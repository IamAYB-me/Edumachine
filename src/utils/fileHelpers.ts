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
  const receiptHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(options.receiptNumber)} Receipt</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 32px; background: #eef4ff; font-family: Inter, Arial, sans-serif; color: #0f172a; ${options.schoolLogoUrl ? `--receipt-logo: url(${options.schoolLogoUrl});` : ''} }
      .sheet { max-width: 820px; margin: 0 auto; background: #fff; border-radius: 28px; overflow: hidden; box-shadow: 0 30px 90px rgba(37,99,235,.16); border: 1px solid #dbeafe; }
      .hero { background: linear-gradient(135deg, #1d4ed8, #4f46e5); color: #fff; padding: 32px; }
      .eyebrow { margin: 0 0 8px; font-size: 11px; letter-spacing: .28em; text-transform: uppercase; opacity: .78; font-weight: 700; }
      .title { margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -.03em; }
      .subtitle { margin: 10px 0 0; font-size: 14px; opacity: .88; }
      .meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 24px; }
      .meta-card { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.16); border-radius: 18px; padding: 16px 18px; }
      .meta-label { font-size: 10px; font-weight: 800; letter-spacing: .24em; text-transform: uppercase; opacity: .72; }
      .meta-value { margin-top: 8px; font-size: 18px; font-weight: 800; }
      .content { padding: 32px; }
      .summary { display: grid; grid-template-columns: 1.2fr .8fr; gap: 20px; }
      .card { border: 1px solid #e2e8f0; border-radius: 22px; padding: 22px; background: #f8fbff; }
      .card h3 { margin: 0 0 18px; font-size: 13px; font-weight: 900; letter-spacing: .2em; text-transform: uppercase; color: #64748b; }
      .detail-row { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px dashed #dbe3f0; }
      .detail-row:last-child { border-bottom: none; }
      .detail-key { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .14em; }
      .detail-value { text-align: right; font-size: 14px; font-weight: 800; }
      .amount-box { background: linear-gradient(180deg, #eff6ff, #ffffff); text-align: center; }
      .amount { font-size: 40px; font-weight: 900; color: #1d4ed8; letter-spacing: -.04em; }
      .status { display: inline-block; margin-top: 10px; padding: 8px 14px; border-radius: 999px; background: #dcfce7; color: #047857; font-size: 11px; font-weight: 900; letter-spacing: .22em; text-transform: uppercase; }
      .footer { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-top: 28px; padding-top: 24px; border-top: 1px dashed #cbd5e1; }
      .footer-note { max-width: 420px; font-size: 13px; line-height: 1.6; color: #475569; }
      .receipt-stamp { min-width: 180px; border: 2px solid #1d4ed8; color: #1d4ed8; border-radius: 18px; padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 900; letter-spacing: .24em; text-transform: uppercase; }
      @media print { body { background: white; padding: 0; } .sheet { box-shadow: none; border-radius: 0; border: none; } body::before { content: ''; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 260px; height: 260px; background-image: var(--receipt-logo); background-repeat: no-repeat; background-position: center; background-size: contain; opacity: 0.06; z-index: -1; pointer-events: none; } }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="hero">
        <p class="eyebrow">Official Payment Receipt</p>
        <h1 class="title">${escapeHtml(options.schoolName || 'EduPlatform')}</h1>
        <p class="subtitle">${escapeHtml(options.schoolCode || 'School Payment Desk')} • Verified transaction acknowledgement</p>
        <div class="meta-grid">
          <div class="meta-card"><div class="meta-label">Receipt No</div><div class="meta-value">${escapeHtml(options.receiptNumber)}</div></div>
          <div class="meta-card"><div class="meta-label">Payment Date</div><div class="meta-value">${escapeHtml(options.paymentDate)}</div></div>
        </div>
      </div>
      <div class="content">
        <div class="summary">
          <div class="card">
            <h3>Transaction Details</h3>
            <div class="detail-row"><span class="detail-key">Payer</span><span class="detail-value">${escapeHtml(options.payerName)}</span></div>
            <div class="detail-row"><span class="detail-key">Fee Item</span><span class="detail-value">${escapeHtml(options.feeLabel)}</span></div>
            <div class="detail-row"><span class="detail-key">Method</span><span class="detail-value">${escapeHtml(options.paymentMethod || 'Recorded Payment')}</span></div>
            <div class="detail-row"><span class="detail-key">Platform</span><span class="detail-value">EduPlatform Finance Desk</span></div>
          </div>
          <div class="card amount-box">
            <h3>Amount Settled</h3>
            <div class="amount">${escapeHtml(options.amount)}</div>
            <div class="status">Payment Confirmed</div>
          </div>
        </div>
        <div class="footer">
          <div class="footer-note">${escapeHtml(options.note || 'This receipt serves as evidence of payment and can be presented for school verification, finance review, and clearance procedures.')}</div>
          <div class="receipt-stamp">Finance Verified</div>
        </div>
      </div>
    </div>
    <script>window.print();</script>
  </body>
</html>`;

  const receiptWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!receiptWindow) return;
  receiptWindow.document.open();
  receiptWindow.document.write(receiptHtml);
  receiptWindow.document.close();
}
