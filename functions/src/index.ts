import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// Secrets live in server-side environment configuration (functions/.env.<project>),
// never in the publicly-readable portal settings doc.
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";

const bucket = admin.storage().bucket();

/**
 * Uploads a base64 data URL to Cloud Storage and returns a public HTTP URL.
 * Non-data-URL values (e.g. an existing https URL) are returned unchanged.
 * This keeps large images out of Firestore, which rejects properties over 1MB.
 */
async function uploadDataUrlToStorage(dataUrl: string, prefix: string, peerId: string): Promise<string> {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    return dataUrl;
  }
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/s);
  if (!match) return dataUrl;
  const mime = match[1] || "application/octet-stream";
  const rawExt = (mime.split("/")[1] || "jpg").toLowerCase();
  const ext = rawExt.replace(/[^a-z0-9]/gi, "") || "jpg";
  const buffer = Buffer.from(match[2], "base64");
  const path = `admissions/${peerId}-${prefix}-${Date.now()}.${ext}`;
  const file = bucket.file(path);
  await file.save(buffer, { contentType: mime, resumable: false });
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${path}`;
}

/**
 * verifyPaystackPayment
 *
 * Callable function invoked by the frontend after Paystack popup succeeds.
 * It calls Paystack's /transaction/verify endpoint with the secret key,
 * then marks the admission application as paid in Firestore.
 */
export const verifyPaystackPayment = functions.https.onCall(async (request: any) => {
  const data = request.data || {};
  const { reference, applicationFormNumber } = data;

  if (!reference || !applicationFormNumber) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing reference or applicationFormNumber."
    );
  }

  if (!PAYSTACK_SECRET_KEY) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Paystack secret key not configured. Set PAYSTACK_SECRET_KEY in functions/.env.myskulboot and redeploy."
    );
  }

  const axios = require("axios") as import("axios").AxiosStatic;

  try {
    // Verify the transaction with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, message, data: txnData } = response.data;

    if (!status || !txnData || txnData.status !== "success") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Payment verification failed: ${message || txnData?.gateway_response || "invalid transaction reference"}`
      );
    }

    // Find the application by form number
    const appsRef = db.collection("admissionApplications");
    const snapshot = await appsRef
      .where("applicationFormNumber", "==", applicationFormNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new functions.https.HttpsError(
        "not-found",
        `Application ${applicationFormNumber} not found.`
      );
    }

    const appDoc = snapshot.docs[0];

    // Update with verified payment info
    await appDoc.ref.update({
      paymentStatus: "Paid",
      paymentReference: reference,
      paymentVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentAmount: txnData.amount / 100, // Convert from kobo to naira
      paymentChannel: txnData.channel,
      paymentIpAddress: txnData.ip_address,
    });

    return {
      success: true,
      message: "Payment verified and application submitted.",
      applicationFormNumber,
      reference,
      amount: txnData.amount / 100,
    };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    const paystackMessage = error?.response?.data?.message;
    if (error?.isAxiosError && paystackMessage) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Payment verification failed: ${paystackMessage}`
      );
    }
    console.error("[verifyPaystackPayment] Error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Payment verification failed. Please contact support."
    );
  }
});

/**
 * Settings used to configure SMTP email delivery. Values are stored in the
 * portal settings document (settings/global) and managed from the Super Admin
 * -> Email & SMTP screen, so they can be updated without redeploying.
 */
interface PortalSettings {
  smtp: {
    host?: string;
    port?: string;
    encryption?: string;
    username?: string;
    fromEmail?: string;
  };
  appName: string;
  supportEmail: string;
  admissionsEmail: string;
}

async function getPortalSettings(): Promise<PortalSettings> {
  const snap = await db.doc("settings/global").get();
  const s = snap.exists ? (snap.data() as any) : {};
  return {
    smtp: s.smtpSettings || {},
    appName: s.appName || "BROCHEST Portal",
    supportEmail: s.supportEmail || "",
    admissionsEmail: s.admissionsEmail || "admissions@brochest.com.ng",
  };
}

async function sendMail(
  settings: PortalSettings,
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const { smtp } = settings;
  if (!smtp.host || !smtp.port) {
    console.warn(`[sendMail] SMTP not configured; skipping email to ${to}`);
    return false;
  }

  const fromEmail = smtp.fromEmail || settings.supportEmail || "noreply@brochest.com.ng";
  if (smtp.username && !SMTP_PASSWORD) {
    console.warn(`[sendMail] SMTP password not configured (set SMTP_PASSWORD in functions/.env.myskulboot). Skipping email to ${to}.`);
    return false;
  }
  const nodemailer = require("nodemailer") as typeof import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: parseInt(smtp.port, 10) || 587,
    secure: smtp.encryption === "SSL/TLS",
    auth: smtp.username ? { user: smtp.username, pass: SMTP_PASSWORD } : undefined,
  });

  await transporter.sendMail({
    from: `"${settings.appName}" <${fromEmail}>`,
    to,
    subject,
    html,
  });
  return true;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * submitAdmissionApplication
 *
 * Callable invoked by the public admission form after a successful Paystack
 * payment. Performs all server-side work so the submission is guaranteed to
 * persist (bypasses client rules):
 *  1. Generates the application form number atomically and stores the application.
 *  2. Creates the applicant's Firebase Auth account (role: APPLICANT).
 *  3. Sends the applicant a confirmation email with login + progress link.
 *  4. Sends the admissions office a notification email.
 */
export const submitAdmissionApplication = functions.https.onCall(async (request: any) => {
  const data = request.data || {};
  const {
    password,
    reference,
    progressUrl,
    email,
    surname,
    firstName,
    ...application
  } = data;

  if (!email || !surname || !firstName) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Applicant name and email are required."
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new functions.https.HttpsError("invalid-argument", "A valid email address is required.");
  }

  if (!password || String(password).length < 6) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Password must be at least 6 characters."
    );
  }

  const settings = await getPortalSettings();

  try {
    // 1. Atomically generate the form number and persist the application.
    const settingsRef = db.doc("settings/global");
    const formNumber = await db.runTransaction(async (tx) => {
      const snap = await tx.get(settingsRef);
      const s = snap.exists ? (snap.data() as any) : {};
      const prefix = s.admissionFormPrefix || "BRO";
      const seq = Number(s.admissionFormNextSequence) || 1;
      const year = new Date().getFullYear();
      const number = `${String(prefix).toUpperCase()}/${year}/${String(seq).padStart(4, "0")}`;
      tx.set(settingsRef, { admissionFormNextSequence: seq + 1 }, { merge: true });
      return number;
    });

    const appId = `ADM-${Math.random().toString(36).substring(2, 11)}`;

    // Upload passport & signature images to Cloud Storage before Firestore write.
    // Firestore rejects properties > 1MB; base64 camera photos easily exceed that.
    const uploadedPassport = await uploadDataUrlToStorage(application.passportUrl || "", "passport", appId);
    const uploadedSignature = await uploadDataUrlToStorage(application.sponsorSignatureUrl || "", "signature", appId);

    await db.collection("admissionApplications").doc(appId).set({
      ...application,
      passportUrl: uploadedPassport,
      sponsorSignatureUrl: uploadedSignature,
      id: appId,
      schoolName: application.schoolName || settings.appName,
      applicationFormNumber: formNumber,
      surname,
      firstName,
      email,
      paymentStatus: "Pending",
      applicationStatus: "Pending",
      paymentReference: reference || "",
      submittedAt: new Date().toISOString().split("T")[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Create the applicant's account (role APPLICANT) so they can track progress.
    const fullName = `${surname} ${firstName}`.trim();
    let uid: string | undefined;
    let accountCreated = false;
    try {
      const record = await admin.auth().createUser({
        email,
        password: String(password),
        displayName: fullName,
        emailVerified: false,
      });
      uid = record.uid;
      accountCreated = true;
    } catch (authError: any) {
      if (authError?.code === "auth/email-already-exists") {
        const existing = await admin.auth().getUserByEmail(email);
        uid = existing.uid;
      } else {
        throw authError;
      }
    }

    if (uid) {
      const userDocRef = db.collection("users").doc(uid);
      const userSnap = await userDocRef.get();
      if (!userSnap.exists) {
        await userDocRef.set({
          uid,
          name: fullName,
          email,
          role: "APPLICANT",
          roleLabel: "Applicant",
          schoolName: application.schoolName || settings.appName,
          phone: application.phone || "",
          isVerified: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    const defaultProgressUrl = `${progressUrl || ""}` || "https://www.brochest.com.ng";
    const applicantName = `${firstName} ${surname}`.trim();
    const course = application.courseOfStudy || application.firstChoiceCourse || "—";
    const admissionFee = application.admissionFee ? Number(application.admissionFee) : 0;

    // 3. Applicant confirmation email (non-fatal if it fails).
    try {
      await sendMail(
        settings,
        email,
        `Admission Application Submitted — ${settings.appName}`,
        `<div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px 12px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:#2563eb;color:#ffffff;padding:24px 32px;">
            <h1 style="margin:0;font-size:20px;">Application Submitted</h1>
            <p style="margin:6px 0 0;font-size:13px;opacity:.9;">${escapeHtml(settings.appName)} — Admission Portal</p>
          </div>
          <div style="padding:24px 32px;color:#1e293b;font-size:14px;line-height:1.7;">
            <p>Dear ${escapeHtml(applicantName)},</p>
            <p>Thank you for applying to ${escapeHtml(settings.appName)}. Your admission application has been received successfully.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">
              <tr>
                <td style="padding:8px 12px;background:#f8fafc;font-weight:bold;width:40%;border:1px solid #e2e8f0;">Application Number</td>
                <td style="padding:8px 12px;border:1px solid #e2e8f0;font-family:monospace;font-weight:bold;color:#2563eb;">${escapeHtml(formNumber)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Applicant</td>
                <td style="padding:8px 12px;border:1px solid #e2e8f0;">${escapeHtml(applicantName)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Course of Study</td>
                <td style="padding:8px 12px;border:1px solid #e2e8f0;">${escapeHtml(course)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Processing Fee</td>
                <td style="padding:8px 12px;border:1px solid #e2e8f0;">&#8358;${admissionFee.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Payment Status</td>
                <td style="padding:8px 12px;border:1px solid #e2e8f0;color:#16a34a;font-weight:bold;">Paid</td>
              </tr>
            </table>

            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 8px;font-weight:bold;color:#1d4ed8;">Track your application</p>
              <p style="margin:0 0 4px;">Login to the portal with the credentials below to follow your admission progress:</p>
              <p style="margin:8px 0 0;font-size:13px;">
                <strong>Email:</strong> ${escapeHtml(email)}<br/>
                <strong>Password:</strong> ${escapeHtml(String(password))}
              </p>
              <p style="margin:12px 0 0;">
                <a href="${escapeHtml(defaultProgressUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:10px;font-weight:bold;font-size:13px;">View Application Progress</a>
              </p>
            </div>

            <p style="margin:16px 0 0;font-size:12px;color:#64748b;">
              Please keep this email and your application number safe. The admissions office will contact you with further instructions.
            </p>
            <p style="margin:16px 0 0;color:#64748b;font-size:12px;">
              Need help? Contact us at ${escapeHtml(settings.supportEmail || "the admissions office")}.
            </p>
          </div>
        </div>
      </div>`
      );
    } catch (mailError: any) {
      console.error("[submitAdmissionApplication] Applicant email failed:", mailError);
    }

    // 4. Admin notification email (non-fatal if it fails).
    try {
      await sendMail(
        settings,
        settings.admissionsEmail,
        `New Admission Application — ${formNumber}`,
        `<div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px 12px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:#1e293b;color:#ffffff;padding:24px 32px;">
            <h1 style="margin:0;font-size:20px;">New Admission Application</h1>
            <p style="margin:6px 0 0;font-size:13px;opacity:.9;">${escapeHtml(formNumber)}</p>
          </div>
          <div style="padding:24px 32px;color:#1e293b;font-size:14px;line-height:1.7;">
            <p>A new admission application was just submitted on the ${escapeHtml(settings.appName)} portal.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">
              <tr>
                <td style="padding:8px 12px;background:#f8fafc;font-weight:bold;width:40%;border:1px solid #e2e8f0;">Applicant</td>
                <td style="padding:8px 12px;border:1px solid #e2e8f0;">${escapeHtml(applicantName)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Email</td>
                <td style="padding:8px 12px;border:1px solid #e2e8f0;">${escapeHtml(email)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Phone</td>
                <td style="padding:8px 12px;border:1px solid #e2e8f0;">${escapeHtml(application.phone || "—")}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Course of Study</td>
                <td style="padding:8px 12px;border:1px solid #e2e8f0;">${escapeHtml(course)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Application Number</td>
                <td style="padding:8px 12px;border:1px solid #e2e8f0;font-family:monospace;font-weight:bold;">${escapeHtml(formNumber)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Payment</td>
                <td style="padding:8px 12px;border:1px solid #e2e8f0;color:#16a34a;font-weight:bold;">Paid${reference ? ` (Ref: ${escapeHtml(reference)})` : ""}</td>
              </tr>
            </table>
            <p style="margin:0;">
              <a href="https://www.brochest.com.ng/admin/admissions" style="display:inline-block;background:#1e293b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:10px;font-weight:bold;font-size:13px;">Review Application</a>
            </p>
          </div>
        </div>
      </div>`
      );
    } catch (mailError: any) {
      console.error("[submitAdmissionApplication] Admin email failed:", mailError);
    }

    return {
      success: true,
      applicationFormNumber: formNumber,
      applicationId: appId,
      accountCreated,
      progressUrl: defaultProgressUrl,
    };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error("[submitAdmissionApplication] Error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Your application could not be submitted. Please contact support."
    );
  }
});

/**
 * deleteUserAccount
 *
 * Callable invoked by an ADMIN / SUPER_ADMIN to permanently remove a user
 * account. This must run server-side because deleting an arbitrary Firebase
 * Auth user requires the Admin SDK (the client SDK can only delete the
 * currently signed-in user).
 *
 * Deletes:
 *   1. The Firebase Auth user (if a uid is provided).
 *   2. users/{uid}
 *   3. students/{uid}
 *   4. Any admission applications matching the user's email.
 */
export const deleteUserAccount = functions.https.onCall(async (request: any) => {
  const caller = request.auth;
  if (!caller) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be signed in to delete an account."
    );
  }

  const callerDoc = await db.collection("users").doc(caller.uid).get();
  const callerRole = callerDoc.exists ? (callerDoc.data() as any)?.role : "";
  if (callerRole !== "SUPER_ADMIN" && callerRole !== "ADMIN") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only an admin can delete a user account."
    );
  }

  const data = request.data || {};
  const { uid, email } = data;
  if (!uid && !email) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A user uid (or email) is required."
    );
  }

  const results: string[] = [];
  const errors: string[] = [];

  // 1. Delete the Auth account.
  if (uid) {
    try {
      await admin.auth().deleteUser(uid);
      results.push(`auth-user/${uid}`);
    } catch (authError: any) {
      // Ignore "user not found" — nothing to delete.
      const code = authError?.code || "";
      if (code !== "auth/user-not-found") errors.push(`auth-user: ${code || authError?.message}`);
    }
  }

  // 2. Delete the users/{uid} doc.
  if (uid) {
    try {
      const ref = db.collection("users").doc(uid);
      if ((await ref.get()).exists) {
        await ref.delete();
        results.push(`users/${uid}`);
      }
    } catch (e: any) {
      errors.push(`users: ${e?.message || e}`);
    }
  }

  // 3. Delete the students/{uid} doc.
  if (uid) {
    try {
      const ref = db.collection("students").doc(uid);
      if ((await ref.get()).exists) {
        await ref.delete();
        results.push(`students/${uid}`);
      }
    } catch (e: any) {
      errors.push(`students: ${e?.message || e}`);
    }
  }

  // 4. Delete admission applications matching the email (also search by stored uid if present).
  const emailToUse = email || (uid ? await getEmailForUid(uid) : "");
  if (emailToUse) {
    const appSnap = await db
      .collection("admissionApplications")
      .where("email", "==", emailToUse)
      .get();
    await Promise.all(
      appSnap.docs.map((d) => d.ref.delete().then(() => results.push(`admissionApplications/${d.id}`)))
    );
  }

  if (errors.length) {
    console.warn("[deleteUserAccount] Partial deletion errors:", errors);
  }

  return {
    success: errors.length === 0,
    deleted: results,
    errors,
  };
});

async function getEmailForUid(uid: string): Promise<string> {
  try {
    const snap = await db.collection("users").doc(uid).get();
    return snap.exists ? String((snap.data() as any)?.email || "") : "";
  } catch {
    return "";
  }
}
