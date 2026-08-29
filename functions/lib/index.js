"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAdmissionApplication = exports.verifyPaystackPayment = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
// Secrets live in server-side environment configuration (functions/.env.<project>),
// never in the publicly-readable portal settings doc.
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
/**
 * verifyPaystackPayment
 *
 * Callable function invoked by the frontend after Paystack popup succeeds.
 * It calls Paystack's /transaction/verify endpoint with the secret key,
 * then marks the admission application as paid in Firestore.
 */
exports.verifyPaystackPayment = functions.https.onCall(async (request) => {
    var _a, _b;
    const data = request.data || {};
    const { reference, applicationFormNumber } = data;
    if (!reference || !applicationFormNumber) {
        throw new functions.https.HttpsError("invalid-argument", "Missing reference or applicationFormNumber.");
    }
    if (!PAYSTACK_SECRET_KEY) {
        throw new functions.https.HttpsError("failed-precondition", "Paystack secret key not configured. Set PAYSTACK_SECRET_KEY in functions/.env.myskulboot and redeploy.");
    }
    const axios = require("axios");
    try {
        // Verify the transaction with Paystack
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });
        const { status, message, data: txnData } = response.data;
        if (!status || !txnData || txnData.status !== "success") {
            throw new functions.https.HttpsError("failed-precondition", `Payment verification failed: ${message || (txnData === null || txnData === void 0 ? void 0 : txnData.gateway_response) || "invalid transaction reference"}`);
        }
        // Find the application by form number
        const appsRef = db.collection("admissionApplications");
        const snapshot = await appsRef
            .where("applicationFormNumber", "==", applicationFormNumber)
            .limit(1)
            .get();
        if (snapshot.empty) {
            throw new functions.https.HttpsError("not-found", `Application ${applicationFormNumber} not found.`);
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
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        const paystackMessage = (_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message;
        if ((error === null || error === void 0 ? void 0 : error.isAxiosError) && paystackMessage) {
            throw new functions.https.HttpsError("failed-precondition", `Payment verification failed: ${paystackMessage}`);
        }
        console.error("[verifyPaystackPayment] Error:", error);
        throw new functions.https.HttpsError("internal", "Payment verification failed. Please contact support.");
    }
});
async function getPortalSettings() {
    const snap = await db.doc("settings/global").get();
    const s = snap.exists ? snap.data() : {};
    return {
        smtp: s.smtpSettings || {},
        appName: s.appName || "BROCHEST Portal",
        supportEmail: s.supportEmail || "",
        admissionsEmail: s.admissionsEmail || "admissions@brochest.com.ng",
    };
}
async function sendMail(settings, to, subject, html) {
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
    const nodemailer = require("nodemailer");
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
function escapeHtml(value) {
    return String(value !== null && value !== void 0 ? value : "")
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
exports.submitAdmissionApplication = functions.https.onCall(async (request) => {
    const data = request.data || {};
    const { password, reference, progressUrl, email, surname, firstName } = data, application = __rest(data, ["password", "reference", "progressUrl", "email", "surname", "firstName"]);
    if (!email || !surname || !firstName) {
        throw new functions.https.HttpsError("invalid-argument", "Applicant name and email are required.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new functions.https.HttpsError("invalid-argument", "A valid email address is required.");
    }
    if (!password || String(password).length < 6) {
        throw new functions.https.HttpsError("invalid-argument", "Password must be at least 6 characters.");
    }
    const settings = await getPortalSettings();
    try {
        // 1. Atomically generate the form number and persist the application.
        const settingsRef = db.doc("settings/global");
        const formNumber = await db.runTransaction(async (tx) => {
            const snap = await tx.get(settingsRef);
            const s = snap.exists ? snap.data() : {};
            const prefix = s.admissionFormPrefix || "BRO";
            const seq = Number(s.admissionFormNextSequence) || 1;
            const year = new Date().getFullYear();
            const number = `${String(prefix).toUpperCase()}/${year}/${String(seq).padStart(4, "0")}`;
            tx.set(settingsRef, { admissionFormNextSequence: seq + 1 }, { merge: true });
            return number;
        });
        const appId = `ADM-${Math.random().toString(36).substring(2, 11)}`;
        await db.collection("admissionApplications").doc(appId).set(Object.assign(Object.assign({}, application), { id: appId, schoolName: application.schoolName || settings.appName, applicationFormNumber: formNumber, surname,
            firstName,
            email, paymentStatus: "Pending", applicationStatus: "Pending", paymentReference: reference || "", submittedAt: new Date().toISOString().split("T")[0], createdAt: admin.firestore.FieldValue.serverTimestamp() }));
        // 2. Create the applicant's account (role APPLICANT) so they can track progress.
        const fullName = `${surname} ${firstName}`.trim();
        let uid;
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
        }
        catch (authError) {
            if ((authError === null || authError === void 0 ? void 0 : authError.code) === "auth/email-already-exists") {
                const existing = await admin.auth().getUserByEmail(email);
                uid = existing.uid;
            }
            else {
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
            await sendMail(settings, email, `Admission Application Submitted — ${settings.appName}`, `<div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px 12px;">
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
      </div>`);
        }
        catch (mailError) {
            console.error("[submitAdmissionApplication] Applicant email failed:", mailError);
        }
        // 4. Admin notification email (non-fatal if it fails).
        try {
            await sendMail(settings, settings.admissionsEmail, `New Admission Application — ${formNumber}`, `<div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px 12px;">
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
      </div>`);
        }
        catch (mailError) {
            console.error("[submitAdmissionApplication] Admin email failed:", mailError);
        }
        return {
            success: true,
            applicationFormNumber: formNumber,
            applicationId: appId,
            accountCreated,
            progressUrl: defaultProgressUrl,
        };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error("[submitAdmissionApplication] Error:", error);
        throw new functions.https.HttpsError("internal", "Your application could not be submitted. Please contact support.");
    }
});
//# sourceMappingURL=index.js.map