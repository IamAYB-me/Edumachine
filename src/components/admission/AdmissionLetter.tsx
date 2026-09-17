/**
 * BROCHEST Admission Letter — a self-contained, print-ready A4 document.
 *
 * This follows the same pattern used across the portal for print output
 * (see `openPaymentReceiptWindow` in @/utils/fileHelpers): build a full HTML
 * string and open it in a new window which auto-triggers the print dialog.
 * No third-party PDF library is required and the printed result is clean,
 * single-page A4 with no portal chrome.
 */

export type AdmissionDocumentType = 'ORIGINAL' | 'DUPLICATE';

export interface AdmissionLetterCollege {
  name: string;
  acronym: string;
  location: string;
  address: string;
  logo?: string;
  registrarName: string;
  registrarCredentials: string;
  registrarSignature?: string;
}

export interface AdmissionLetterStudent {
  fullName: string;
  firstName: string;
  lastName: string;
  matricNumber: string;
  passportPhoto?: string;
}

export interface AdmissionLetterData {
  documentType: AdmissionDocumentType;
  college: AdmissionLetterCollege;
  student: AdmissionLetterStudent;
  admission: {
    applicationReference: string;
    programme: string;
    academicSession: string;
    level: string;
    department: string;
    admissionDate: string;
    resumptionDate: string;
    verificationCode: string;
    status: string;
    acceptanceFeeStatus: string;
  };
}

const NAVY = '#16376D';
const NAVY_DARK = '#152F61';
const GOLD = '#D5A928';

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bold(value: string): string {
  return `<strong>${esc(value)}</strong>`;
}

export function buildAdmissionLetterHtml(data: AdmissionLetterData): string {
  const type = data.documentType === 'DUPLICATE' ? 'DUPLICATE' : 'ORIGINAL';
  const statusBar = type === 'DUPLICATE' ? 'DUPLICATE — FOR OFFICIAL USE ONLY' : 'ORIGINAL — FOR CANDIDATE\'S USE ONLY';
  const verificationHeading = type === 'DUPLICATE' ? 'OFFICIAL RECORD' : 'DOCUMENT VERIFICATION';
  const duplicateNote = type === 'DUPLICATE' ? '<p style="margin:6px 0 0;font-size:10px;line-height:1.5;color:#566174;">Use: College filing and official record only.</p>' : '';

  const college = data.college;
  const student = data.student;
  const adm = data.admission;

  const logoTag = college.logo
    ? `<img class="logo" src="${esc(college.logo)}" alt="School logo" />`
    : `<div class="logo-placeholder">${esc(college.acronym || college.name.slice(0, 1))}</div>`;

  const photoTag = student.passportPhoto
    ? `<img class="photo" src="${esc(student.passportPhoto)}" alt="Passport" />`
    : `<div class="photo-placeholder">PHOTO</div>`;

  const signatureTag = college.registrarSignature
    ? `<img class="signature" src="${esc(college.registrarSignature)}" alt="Registrar signature" />`
    : '<div class="signature-space"></div>';

  const fullName = student.fullName || `${student.firstName} ${student.lastName}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Admission Letter - ${esc(fullName)}</title>
<style>
  @page { size: A4 portrait; margin: 0mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #edf1f7; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .stage { display: flex; justify-content: center; padding: 28px 16px; }
  .sheet { position: relative; width: 210mm; height: 297mm; background: #ffffff; overflow: hidden; }
  .outer-border { position: absolute; top: 6mm; left: 6mm; right: 6mm; bottom: 6mm; border: 1.4pt solid ${NAVY}; }
  .inner-border { position: absolute; top: 8mm; left: 8mm; right: 8mm; bottom: 8mm; border: 1pt solid ${GOLD}; }
  .page { position: relative; z-index: 2; height: 100%; padding: 14mm 16mm 12mm; display: flex; flex-direction: column; }
  .watermark { position: absolute; z-index: 1; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 120px; font-weight: 900; color: ${NAVY}; opacity: 0.06; letter-spacing: 8px; user-select: none; pointer-events: none; white-space: nowrap; }

  /* Header */
  .header { display: flex; align-items: center; gap: 12mm; }
  .logo, .logo-placeholder { width: 28mm; height: 28mm; flex: 0 0 28mm; object-fit: contain; }
  .logo-placeholder { display: flex; align-items: center; justify-content: center; border: 1px solid ${NAVY}; color: ${NAVY}; font-weight: 900; font-size: 20px; }
  .school-block { flex: 1; text-align: center; }
  .school-name { font-family: Arial, Helvetica, sans-serif; font-weight: 900; text-transform: uppercase; color: ${NAVY}; font-size: 20px; line-height: 1.15; letter-spacing: 0.5px; }
  .school-tagline { margin-top: 2mm; font-weight: 800; text-transform: uppercase; color: ${NAVY}; font-size: 11px; letter-spacing: 0.5px; }
  .school-location { margin-top: 1.5mm; color: ${NAVY}; font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
  .header-meta { flex: 0 0 auto; text-align: right; }
  .meta-title { font-family: Arial, Helvetica, sans-serif; font-weight: 900; color: ${NAVY}; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
  .meta-line { margin-top: 1mm; color: #566174; font-size: 10px; text-align: right; }
  .header-divider { margin-top: 4mm; height: 2.5px; background: ${NAVY}; }

  /* Status bar */
  .status-bar { margin-top: 3mm; background: ${NAVY}; color: #fff; text-align: center; padding: 2.4mm 0; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; }

  /* Candidate info */
  .candidate { display: flex; gap: 5mm; margin-top: 5mm; align-items: stretch; }
  .info-box { flex: 1; background: ${'#F4F7FA'}; border: 1px solid ${'#CBD5E1'}; padding: 4mm 5mm; }
  .info-row { display: flex; gap: 4mm; padding: 1.6mm 0; border-bottom: 1px solid #e2e8f0; }
  .info-row:last-child { border-bottom: none; }
  .info-label { min-width: 46mm; font-weight: 700; color: ${NAVY}; font-size: 10px; }
  .info-value { font-size: 10px; color: #172033; }
  .photo-box { flex: 0 0 30mm; width: 30mm; height: 40mm; border: 1px solid ${'#CBD5E1'}; overflow: hidden; }
  .photo, .photo-placeholder { width: 100%; height: 100%; object-fit: cover; }
  .photo-placeholder { display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11px; font-weight: 700; letter-spacing: 1px; }

  /* Title */
  .letter-title { margin-top: 5mm; text-align: center; }
  .letter-title h1 { font-family: Arial, Helvetica, sans-serif; color: ${NAVY}; font-weight: 900; text-transform: uppercase; font-size: 20px; letter-spacing: 1.5px; }
  .title-underline { width: 60mm; height: 1.5px; background: ${GOLD}; margin: 1.6mm auto 0; }
  .letter-session { margin-top: 1.6mm; color: ${NAVY_DARK}; font-weight: 800; font-size: 13px; text-align: center; }

  /* Body */
  .body { margin-top: 4mm; flex: 1; font-family: Georgia, 'Times New Roman', serif; color: #172033; font-size: 11.5px; line-height: 1.55; text-align: justify; }
  .body p { margin-bottom: 2.6mm; }
  .salutation { margin-bottom: 3mm; }
  ol.main-conditions { margin: 1mm 0 2.6mm 6mm; }
  ol.main-conditions > li { margin-bottom: 1.6mm; }
  ol.sub-conditions { margin: 1.6mm 0 0 7mm; list-style: lower-alpha; }
  ol.sub-conditions > li { margin-bottom: 1mm; }
  .inline-strong { font-weight: 700; }
  .copy strong { font-weight: 700; }

  /* Signature + verification */
  .signature-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 2mm; }
  .signature-block { text-align: left; }
  .signature-line { margin: 2mm 0 1mm; font-weight: 700; color: #172033; font-size: 11.5px; }
  .signature img { height: 14mm; object-fit: contain; }
  .signature-space { height: 14mm; }
  .registrar-name { margin-top: 1mm; font-weight: 700; color: #172033; font-size: 11.5px; }
  .registrar-credentials { font-size: 10px; color: #566174; }
  .registrar-role { margin-top: 0.5mm; font-weight: 700; color: #172033; font-size: 11px; letter-spacing: 0.5px; }
  .verify-panel { flex: 0 0 52mm; width: 52mm; background: ${'#F4F7FA'}; border: 1px solid ${'#CBD5E1'}; padding: 3.5mm 4mm; }
  .verify-heading { font-weight: 700; color: ${NAVY}; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; }
  .verify-row { display: flex; justify-content: space-between; gap: 3mm; margin-top: 1.6mm; font-size: 9.5px; color: #172033; }
  .verify-label { font-weight: 600; color: #566174; }
  .verify-code { font-family: Consolas, 'Courier New', monospace; font-weight: 700; }
  .verify-status { color: #047857; font-weight: 700; }
  .verify-acceptance { color: #047857; font-weight: 700; }

  /* Footer */
  .footer { margin-top: 2mm; text-align: center; color: #94a3b8; font-size: 8px; line-height: 1.45; }

  @media screen {
    .stage { min-height: 100vh; }
    .sheet { box-shadow: 0 20px 60px rgba(22,55,109,0.18); }
  }
  @media print {
    html, body { background: #ffffff; margin: 0; padding: 0; }
    .stage { padding: 0; margin: 0; }
    .sheet { position: relative; width: 210mm; height: 297mm; max-width: 210mm; max-height: 297mm; box-shadow: none; overflow: hidden; transform: none; -webkit-transform: none; }
    .watermark { opacity: 0.06; }
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="sheet">
      <div class="watermark">${type}</div>
      <div class="outer-border"></div>
      <div class="inner-border"></div>
      <div class="page">
        <div class="header">
          ${logoTag}
          <div class="school-block">
            <div class="school-name">${esc(college.name)}</div>
            <div class="school-tagline">(${esc(college.acronym)}) · ${esc(college.location)}</div>
            <div class="school-location">${esc(college.address)} · Official Admission Document</div>
          </div>
          <div class="header-meta">
            <div class="meta-title">Admission Document</div>
            <div class="meta-line">Ref: ${esc(adm.applicationReference)}</div>
            <div class="meta-line">Date: ${esc(adm.admissionDate)}</div>
          </div>
        </div>
        <div class="header-divider"></div>
        <div class="status-bar">${statusBar}</div>

        <div class="candidate">
          <div class="info-box">
            ${[['APPLICATION REFERENCE', adm.applicationReference], ['MATRICULATION NUMBER', student.matricNumber], ['FULL NAME', fullName], ['PROGRAMME', adm.programme], ['ACADEMIC SESSION', adm.academicSession], ['LEVEL', adm.level], ['DEPARTMENT', adm.department]].map(([label, value]) => `
            <div class="info-row"><span class="info-label">${esc(label)}:</span><span class="info-value">${esc(value)}</span></div>`).join('')}
          </div>
          <div class="photo-box">${photoTag}</div>
        </div>

        <div class="letter-title">
          <h1>Provisional Admission Letter</h1>
          <div class="title-underline"></div>
          <div class="letter-session">${esc(adm.academicSession)}</div>
        </div>

        <div class="body copy">
          <p class="salutation">Dear ${bold(fullName)},</p>
          <p>I am pleased to inform you that you have been offered provisional admission to pursue a three-year academic programme for a ${bold(adm.programme)}.</p>
          <p>The ${bold(adm.academicSession)} academic session is set to begin on ${bold(adm.resumptionDate)}, and you are expected to report to the College on the resumption date.</p>
          <p>This offer is contingent on the following conditions:</p>
          <ol class="main-conditions">
            <li>You must sign a letter of acceptance provided by the College.</li>
            <li>You are required to pay the College fees to the College Bank Account within two weeks of receiving this letter.</li>
            <li>You must properly complete and sign the acceptance form.</li>
            <li>You are to submit three copies of each of the following documents:
              <ol class="sub-conditions">
                <li>Original copy of your GCE, WAEC, NECO, or NABTEB results.</li>
                <li>Four passport photographs with a red background.</li>
                <li>Your Certificate of State of Origin.</li>
              </ol>
            </li>
          </ol>
          <p>Please be aware that this offer will be withdrawn if these conditions are not met within the specified time. <span class="inline-strong">All payments are non-refundable.</span></p>
          <p>The College reserves the right to withdraw your admission if you fail to pay the school fees or pass the probationary examination administered by the College.</p>
          <p>We look forward to welcoming you to the College. <span class="inline-strong">Congratulations!</span></p>

          <div class="signature-row">
            <div class="signature-block">
              <div class="signature-line">Sincerely,</div>
              <div class="signature">${signatureTag}</div>
              <div class="registrar-name">${esc(college.registrarName)}</div>
              <div class="registrar-credentials">${esc(college.registrarCredentials)}</div>
              <div class="registrar-role">REGISTRAR</div>
            </div>
            <div class="verify-panel">
              <div class="verify-heading">${verificationHeading}</div>
              <div class="verify-row"><span class="verify-label">Reference:</span><span>${esc(adm.applicationReference)}</span></div>
              <div class="verify-row"><span class="verify-label">Verification Code:</span><span class="verify-code">${esc(adm.verificationCode)}</span></div>
              <div class="verify-row"><span class="verify-label">Status:</span><span class="verify-status">${esc(adm.status)}</span></div>
              <div class="verify-row"><span class="verify-label">Acceptance Fee:</span><span class="verify-acceptance">${esc(adm.acceptanceFeeStatus)}</span></div>
              ${duplicateNote}
            </div>
          </div>
        </div>

        <div class="footer">This document is issued electronically by ${esc(college.acronym)}. Any alteration or unauthorised reproduction renders it subject to verification by the College.</div>
      </div>
    </div>
  </div>
  <script>window.print();</script>
</body>
</html>`;
}

export function openAdmissionLetterWindow(data: AdmissionLetterData) {
  const fullName = data.student.fullName || `${data.student.firstName} ${data.student.lastName}`.trim();
  const win = window.open('', '_blank', 'width=820,height=1100');
  if (!win) return;
  win.document.open();
  win.document.write(buildAdmissionLetterHtml(data));
  win.document.close();
  win.focus();
}

export default buildAdmissionLetterHtml;