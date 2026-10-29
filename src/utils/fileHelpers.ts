export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });
}

export function downloadFromUrl(url: string, fileName: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadTextFile(fileName: string, content: string, mimeType = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  downloadFromUrl(url, fileName);
  URL.revokeObjectURL(url);
}

type PaymentReceiptOptions = {
  receiptNumber: string;
  payerName: string;
  feeLabel: string;
  amount: string;
  paymentDate: string;
  paymentMethod?: string;
  schoolName?: string;
  schoolCode?: string;
  schoolLogoUrl?: string;
  note?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function openPaymentReceiptWindow(options: PaymentReceiptOptions) {
  const schoolName = escapeHtml(options.schoolName || 'EduPlatform');
  const schoolCode = escapeHtml(options.schoolCode || 'School Payment Desk');
  const receiptNo = escapeHtml(options.receiptNumber);
  const payerName = escapeHtml(options.payerName);
  const feeLabel = escapeHtml(options.feeLabel);
  const amount = escapeHtml(options.amount);
  const paymentDate = escapeHtml(options.paymentDate);
  const paymentMethod = escapeHtml(options.paymentMethod || 'Recorded Payment');
  const note = escapeHtml(
    options.note ||
      'This receipt serves as evidence of payment and can be presented for school verification, finance review, and clearance procedures.',
  );
  const logoHtml = options.schoolLogoUrl
    ? `<img class="logo" src="${escapeHtml(options.schoolLogoUrl)}" alt="School Logo" />`
    : `<div class="logo-fallback">${schoolName.charAt(0)}</div>`;

  const receiptHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${receiptNo} Receipt</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #dbe8f7; font-family: Inter, Arial, sans-serif; color: #0f172a; }
      .sheet { width: 72mm; margin: 12px auto; background: #fff; border: 1px solid #cbd5e1; box-shadow: 0 2px 14px rgba(15,23,42,.18); }
      .inner { padding: 10px 8px; font-size: 10px; line-height: 1.45; }
      .center { text-align: center; }
      .logo { display: block; margin: 0 auto 6px; max-height: 40px; max-width: 180px; object-fit: contain; }
      .logo-fallback { width: 38px; height: 38px; margin: 0 auto 6px; border-radius: 50%; background: linear-gradient(135deg,#1d4ed8,#4f46e5); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; }
      .school { font-size: 14px; font-weight: 900; letter-spacing: .02em; }
      .school-code { font-size: 8px; font-weight: 700; color: #475569; letter-spacing: .12em; text-transform: uppercase; margin-top: 2px; }
      .title { margin: 8px 0; padding: 4px 0; border-top: 1px dashed #94a3b8; border-bottom: 1px dashed #94a3b8; font-size: 11px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
      .row { display: flex; justify-content: space-between; gap: 8px; padding: 3px 0; border-bottom: 1px dotted #cbd5e1; }
      .row:last-child { border-bottom: none; }
      .k { font-weight: 700; color: #334155; font-size: 8px; text-transform: uppercase; letter-spacing: .05em; }
      .v { font-weight: 800; font-size: 10px; text-align: right; }
      .sec { margin: 9px 0 3px; font-size: 9px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; color: #1e293b; }
      .amount { text-align: center; font-size: 20px; font-weight: 900; color: #1d4ed8; margin-top: 7px; padding: 6px 0; border: 1px solid #dbeafe; background: #eff6ff; border-radius: 6px; }
      .status { text-align: center; font-size: 9px; font-weight: 900; color: #047857; letter-spacing: .08em; margin-top: 4px; }
      .note { margin-top: 7px; font-size: 8px; color: #475569; line-height: 1.5; }
      .footer { margin-top: 9px; padding-top: 6px; border-top: 1px dashed #94a3b8; display: flex; justify-content: space-between; gap: 6px; font-size: 8px; font-weight: 700; color: #334155; }
      @media print { body { background: #fff; } .sheet { box-shadow: none; border: none; margin: 0 auto; } }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="inner">
        <div class="center">${logoHtml}</div>
        <div class="center school">${schoolName}</div>
        <div class="center school-code">${schoolCode}</div>
        <div class="center title">Official Payment Receipt</div>

        <div class="sec">Transaction</div>
        <div class="row"><span class="k">Receipt No</span><span class="v">${receiptNo}</span></div>
        <div class="row"><span class="k">Payment Date</span><span class="v">${paymentDate}</span></div>
        <div class="row"><span class="k">Payer</span><span class="v">${payerName}</span></div>

        <div class="sec">Ledger</div>
        <div class="row"><span class="k">Fee Item</span><span class="v">${feeLabel}</span></div>
        <div class="row"><span class="k">Payment Method</span><span class="v">${paymentMethod}</span></div>
        <div class="row"><span class="k">Platform</span><span class="v">BROCHEST Financial Desk</span></div>
        <div class="row"><span class="k">Account</span><span class="v">Tuition &amp; School Fees</span></div>
        <div class="row"><span class="k">Reference</span><span class="v">${receiptNo}</span></div>

        <div class="sec">Amount Settled</div>
        <div class="amount">${amount}</div>
        <div class="status">&#10003; Payment Confirmed</div>

        <div class="sec">Verification &amp; Clearance</div>
        <div class="row"><span class="k">Status</span><span class="v">Verified &amp; Reconciled</span></div>
        <div class="row"><span class="k">Finance Desk</span><span class="v">BROCHEST Financial Desk</span></div>

        <div class="note">${note}</div>

        <div class="footer">
          <span>Generated by BROCHEST Financial Desk</span>
          <span>Finance Verified</span>
        </div>
      </div>
    </div>
    <script>window.print();</script>
  </body>
</html>`;

  const receiptWindow = window.open('', '_blank', 'width=320,height=560');
  if (!receiptWindow) return;
  receiptWindow.document.open();
  receiptWindow.document.write(receiptHtml);
  receiptWindow.document.close();
}
