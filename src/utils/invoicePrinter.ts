import type { Booking } from '../types';

function numberToIndianWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const integerPart = Math.floor(num);
  if (integerPart === 0) return 'Zero Rupees Only';

  const n = ('000000000' + integerPart).slice(-9);
  const crore = parseInt(n.slice(0, 2));
  const lakh = parseInt(n.slice(2, 4));
  const thousand = parseInt(n.slice(4, 6));
  const hundred = parseInt(n.slice(6, 7));
  const tens = parseInt(n.slice(7, 9));

  let str = '';
  if (crore > 0) str += (crore < 20 ? a[crore] : b[Math.floor(crore / 10)] + ' ' + a[crore % 10]) + 'Crore ';
  if (lakh > 0) str += (lakh < 20 ? a[lakh] : b[Math.floor(lakh / 10)] + ' ' + a[lakh % 10]) + 'Lakh ';
  if (thousand > 0) str += (thousand < 20 ? a[thousand] : b[Math.floor(thousand / 10)] + ' ' + a[thousand % 10]) + 'Thousand ';
  if (hundred > 0) str += a[hundred] + 'Hundred ';
  if (tens > 0) str += (str !== '' ? 'and ' : '') + (tens < 20 ? a[tens] : b[Math.floor(tens / 10)] + ' ' + a[tens % 10]);

  return 'Rupees ' + str.trim() + ' Only';
}

function renderSinglePageHtml(booking: Booking, copyLabel: 'CUSTOMER COPY' | 'ADMINISTRATION COPY'): string {
  const invoiceNum = `INV-${booking.id.substring(booking.id.indexOf('-') + 1)}`;
  const dateStr = new Date(booking.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const baseVal = booking.financials.baseAmount ?? booking.financials.subtotal;
  const isGst = booking.billingType === 'GST';
  const cgstVal = booking.financials.cgst ?? 0;
  const sgstVal = booking.financials.sgst ?? 0;
  const roundOff = booking.financials.roundOff ?? 0;
  const isRoom = booking.serviceType === 'room';

  const roomNames = booking.roomIds && booking.roomIds.length > 0
    ? booking.roomIds.map(id => `Room ${id.replace('room-', '')}`).join(', ')
    : 'Standard Accommodation';

  return `
    <div class="invoice-page">
      <!-- TOP COPY BANNER -->
      <div class="copy-bar">
        <span>${copyLabel}</span>
      </div>

      <!-- HEADER WITH OFFICIAL LOGO -->
      <div class="invoice-header">
        <div class="brand-left">
          <div class="logo-medallion">
            <img src="/logo.png" alt="SV Residency Logo" />
          </div>
          <div>
            <h1 class="brand-title">SV MAHAL & RESIDENCY</h1>
            <div class="brand-subtitle">A Blend of Heritage & Comfort • Chengam</div>
            <p class="brand-address">
              No.859/B, SV Thirumana Mahal Opposite, Bangalore Main Road, Chengam - 606701<br/>
              Front Desk: <strong>95008 21550</strong>, <strong>90437 80215</strong> | Email: svresidencycgm@gmail.com<br/>
              <strong>GSTIN: 33GTSPD9038L1Z1</strong>
            </p>
          </div>
        </div>

        <div class="invoice-meta">
          <h2 class="meta-title">${isGst ? 'TAX INVOICE' : 'SERVICE INVOICE'}</h2>
          <table class="meta-table">
            <tr><td>Invoice No:</td><td><strong>${invoiceNum}</strong></td></tr>
            <tr><td>Date:</td><td>${dateStr}</td></tr>
            <tr><td>Booking ID:</td><td>${booking.id}</td></tr>
            <tr><td>Billing:</td><td>${isGst ? 'GST Registered' : 'Standard'}</td></tr>
          </table>
        </div>
      </div>

      <!-- BILLED TO & STAY DETAILS -->
      <div class="details-grid">
        <div class="detail-box">
          <div class="box-title">BILLED TO (GUEST DETAILS)</div>
          <div class="guest-name">${(booking.customerName || 'Guest').toUpperCase()}</div>
          <div>Phone: <strong>${booking.customerPhone || 'N/A'}</strong></div>
          ${booking.customerEmail ? `<div>Email: ${booking.customerEmail}</div>` : ''}
          <div>Address: ${booking.customerAddress || 'Chengam, Tamil Nadu'}</div>
          ${booking.companyName ? `
            <div class="company-block">
              <strong>${booking.companyName.toUpperCase()}</strong><br/>
              GSTIN: ${booking.companyGst || 'N/A'}
            </div>
          ` : ''}
        </div>

        <div class="detail-box">
          <div class="box-title">RESERVATION / STAY PARTICULARS</div>
          <div>Category: <strong>${isRoom ? 'SV Residency Lodging Stay' : 'SV Thirumana Mahal Banquet Hall'}</strong></div>
          ${isRoom ? `
            <div>Allocated Rooms: <strong>${roomNames}</strong></div>
            <div>Check-in: <strong>${booking.actualCheckInTime || booking.checkInDate}</strong></div>
            <div>Check-out: <strong>${booking.actualCheckOutTime || booking.checkOutDate}</strong></div>
            <div>Occupancy: <strong>${booking.guestCount || 1} Guests</strong> (${booking.roomCount || 1} Rooms)</div>
          ` : `
            <div>Package: <strong>${booking.packageName || 'Standard Muhurtham Package'}</strong></div>
            <div>Event Date: <strong>${booking.checkInDate}</strong></div>
            <div>Event Type: <strong>${booking.eventDetails?.eventType || 'Wedding Celebration'}</strong></div>
            <div>Capacity: <strong>${booking.guestCount || 500} Attendees</strong></div>
          `}
          <div>Booking Source: <strong>${booking.bookingSource || 'Front Desk Direct'}</strong></div>
        </div>
      </div>

      <!-- ITEMIZED TABLE -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="text-align: left;">Particulars & Service Description</th>
            <th style="width: 90px; text-align: center;">HSN / SAC</th>
            <th style="width: 80px; text-align: center;">GST Rate</th>
            <th style="width: 120px; text-align: right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;">1</td>
            <td>
              <strong>${isRoom ? `Residency Lodging Tariff — ${roomNames}` : `Mahal Rental: ${booking.packageName || 'Event Venue'}`}</strong>
              <div class="desc-sub">
                ${isRoom ? `Stay Period: ${booking.checkInDate} to ${booking.checkOutDate}` : `Event Schedule: ${booking.checkInDate} (${booking.eventDetails?.slot || 'Full Day'})`}
              </div>
            </td>
            <td style="text-align: center;">${isRoom ? '996311' : '996312'}</td>
            <td style="text-align: center;">${isGst ? (isRoom ? '12%' : '18%') : '0%'}</td>
            <td style="text-align: right;">₹${baseVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>

          ${booking.mahalCharges?.electricity ? `
            <tr>
              <td style="text-align: center;">2</td>
              <td>Electricity EB Meter Units Consumption (${booking.ebInitialUnits || 0} to ${booking.ebFinalUnits || 0})</td>
              <td style="text-align: center;">996312</td>
              <td style="text-align: center;">${isGst ? '18%' : '0%'}</td>
              <td style="text-align: right;">₹${booking.mahalCharges.electricity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ` : ''}

          ${booking.mahalCharges?.generator ? `
            <tr>
              <td style="text-align: center;">3</td>
              <td>Diesel Generator Backup Operation Fee</td>
              <td style="text-align: center;">996312</td>
              <td style="text-align: center;">${isGst ? '18%' : '0%'}</td>
              <td style="text-align: right;">₹${booking.mahalCharges.generator.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ` : ''}

          ${booking.mahalCharges?.rooms ? `
            <tr>
              <td style="text-align: center;">4</td>
              <td>Additional Guest Accommodation Suites</td>
              <td style="text-align: center;">996311</td>
              <td style="text-align: center;">${isGst ? '12%' : '0%'}</td>
              <td style="text-align: right;">₹${booking.mahalCharges.rooms.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ` : ''}

          ${booking.mahalCharges?.damages ? `
            <tr>
              <td style="text-align: center;">5</td>
              <td style="color: #DC2626;">Damage / Asset Penalty: ${booking.damageReportText || 'Incident Settlement'}</td>
              <td style="text-align: center;">996312</td>
              <td style="text-align: center;">0%</td>
              <td style="text-align: right; color: #DC2626;">₹${booking.mahalCharges.damages.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ` : ''}

          ${booking.mahalCharges?.other ? `
            <tr>
              <td style="text-align: center;">6</td>
              <td>Miscellaneous Venue Services & Support</td>
              <td style="text-align: center;">996312</td>
              <td style="text-align: center;">${isGst ? '18%' : '0%'}</td>
              <td style="text-align: right;">₹${booking.mahalCharges.other.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ` : ''}

          <!-- TOTALS ROWS -->
          <tr class="calc-row">
            <td colspan="3" class="no-border"></td>
            <td class="calc-label">Subtotal:</td>
            <td class="calc-val">₹${booking.financials.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>

          ${booking.financials.discount > 0 ? `
            <tr class="calc-row">
              <td colspan="3" class="no-border"></td>
              <td class="calc-label" style="color: #DC2626;">Discount:</td>
              <td class="calc-val" style="color: #DC2626;">- ₹${booking.financials.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ` : ''}

          ${isGst ? `
            <tr class="calc-row">
              <td colspan="3" class="no-border"></td>
              <td class="calc-label">CGST (${isRoom ? '6%' : '9%'}):</td>
              <td class="calc-val">₹${cgstVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr class="calc-row">
              <td colspan="3" class="no-border"></td>
              <td class="calc-label">SGST (${isRoom ? '6%' : '9%'}):</td>
              <td class="calc-val">₹${sgstVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ` : ''}

          ${roundOff !== 0 ? `
            <tr class="calc-row">
              <td colspan="3" class="no-border"></td>
              <td class="calc-label">Round Off:</td>
              <td class="calc-val">₹${roundOff.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ` : ''}

          <tr class="grand-total-row">
            <td colspan="3" class="no-border"></td>
            <td class="total-label">Grand Total:</td>
            <td class="total-val">₹${booking.financials.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>

          <tr class="paid-row">
            <td colspan="3" class="no-border"></td>
            <td class="calc-label">Paid to Date:</td>
            <td class="calc-val" style="color: #16A34A; font-weight: 700;">₹${booking.financials.advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>

          <tr class="balance-row">
            <td colspan="3" class="no-border"></td>
            <td class="balance-label">Balance Due:</td>
            <td class="balance-val">₹${booking.financials.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      <!-- AMOUNT IN WORDS -->
      <div class="words-box">
        <strong>Amount in Words:</strong> ${numberToIndianWords(booking.financials.total)}
      </div>

      <!-- BANK SETTLEMENT & UPI SECTION -->
      <div class="settle-grid">
        <div class="settle-box">
          <div class="settle-title">BANK RTGS / NEFT SETTLEMENT</div>
          <div>Bank Name: <strong>State Bank of India</strong></div>
          <div>Account Name: <strong>SV MAHAL & RESIDENCY</strong></div>
          <div>A/C Number: <strong>40912233445</strong> | IFSC: <strong>SBIN0000823</strong></div>
          <div>Branch: <strong>Chengam (0823)</strong></div>
        </div>

        <div class="settle-box">
          <div class="settle-title">INSTANT DIGITAL UPI SETTLEMENT</div>
          <div>UPI ID: <strong>9500821550@okbizaxis</strong></div>
          <div>GPay / PhonePe: <strong>95008 21550</strong></div>
          <div>Settlement Verification: <strong>Instant POS Ref Check</strong></div>
        </div>
      </div>

      <!-- TERMS & SIGNATURE FOOTER -->
      <div class="terms-signatures">
        <div class="terms-col">
          <div class="box-title">TERMS & CONDITIONS</div>
          <ol>
            <li>Check-out past standard billing time incurs standard day charges.</li>
            <li>All disputes are subject to the exclusive jurisdiction of Chengam courts.</li>
            <li>Damages to hotel or hall property must be settled immediately at counter.</li>
            <li>This is a computer-generated tax invoice issued by SV Residency PMS.</li>
          </ol>
        </div>

        <div class="signatures-col">
          <div class="sig-box">
            <div class="sig-line"></div>
            <span>Guest Signature</span>
          </div>
          <div class="sig-box">
            <div class="stamp-seal">SV RESIDENCY<br/>OFFICIAL SEAL</div>
            <div class="sig-line"></div>
            <span>Authorized Signatory</span>
          </div>
        </div>
      </div>

      <div class="bottom-salute">
        Thank you for choosing SV. MAHAL & SV. RESIDENCY, Chengam! We wish you a peaceful stay and celebration.
      </div>
    </div>
  `;
}

export function printInvoice(booking: Booking, copyType: 'customer' | 'admin' | 'both' = 'both'): void {
  const pagesHtml = copyType === 'both'
    ? `${renderSinglePageHtml(booking, 'CUSTOMER COPY')}<div class="page-break"></div>${renderSinglePageHtml(booking, 'ADMINISTRATION COPY')}`
    : renderSinglePageHtml(booking, copyType === 'customer' ? 'CUSTOMER COPY' : 'ADMINISTRATION COPY');

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${booking.id}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          background: #FFFFFF;
          font-size: 8.5pt;
          line-height: 1.35;
        }
        .invoice-page {
          width: 100%;
          max-width: 190mm;
          margin: 0 auto;
          padding: 4mm 0;
        }
        .page-break {
          page-break-after: always;
          height: 0;
        }
        .copy-bar {
          text-align: right;
          border-bottom: 2px solid #0F2942;
          padding-bottom: 3px;
          margin-bottom: 12px;
        }
        .copy-bar span {
          font-size: 8.5pt;
          font-weight: 800;
          color: #0F2942;
          letter-spacing: 0.1em;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .brand-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-medallion {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 2px solid #C9A227;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .logo-medallion img {
          width: 90%;
          height: 90%;
          object-fit: contain;
        }
        .brand-title {
          font-size: 15pt;
          font-weight: 800;
          color: #0F2942;
          margin: 0;
          letter-spacing: 0.02em;
        }
        .brand-subtitle {
          font-size: 7.5pt;
          font-weight: 700;
          color: #C9A227;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .brand-address {
          font-size: 7.5pt;
          color: #475569;
          margin: 2px 0 0 0;
          line-height: 1.3;
        }
        .invoice-meta {
          text-align: right;
        }
        .meta-title {
          font-size: 14pt;
          font-weight: 800;
          color: #C9A227;
          margin: 0 0 4px 0;
          letter-spacing: 0.05em;
        }
        .meta-table {
          margin-left: auto;
          border-collapse: collapse;
          font-size: 7.5pt;
        }
        .meta-table td {
          padding: 1px 4px;
          text-align: right;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .detail-box {
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 8pt;
          background: #FAFAFA;
        }
        .box-title {
          font-size: 7.5pt;
          font-weight: 800;
          color: #0F2942;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 3px;
          margin-bottom: 5px;
          letter-spacing: 0.04em;
        }
        .guest-name {
          font-size: 9.5pt;
          font-weight: 800;
          color: #0F2942;
          margin-bottom: 2px;
        }
        .company-block {
          margin-top: 4px;
          padding-top: 4px;
          border-top: 1px dashed #CBD5E1;
          font-size: 7.5pt;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
          font-size: 8pt;
        }
        .items-table th {
          background: #0F2942;
          color: #FFFFFF;
          padding: 6px 8px;
          font-weight: 700;
          border: 1px solid #0F2942;
        }
        .items-table td {
          padding: 5px 8px;
          border: 1px solid #E2E8F0;
        }
        .desc-sub {
          font-size: 7pt;
          color: #64748B;
          margin-top: 1px;
        }
        .calc-row td {
          padding: 3px 8px;
        }
        .calc-label {
          text-align: right;
          font-weight: 600;
          border: 1px solid #E2E8F0 !important;
        }
        .calc-val {
          text-align: right;
          border: 1px solid #E2E8F0 !important;
        }
        .grand-total-row td {
          padding: 6px 8px;
          background: #F1F5F9;
          font-weight: 800;
          font-size: 9.5pt;
          border-top: 2px solid #0F2942 !important;
          border-bottom: 2px solid #0F2942 !important;
        }
        .total-label {
          text-align: right;
          color: #0F2942;
        }
        .total-val {
          text-align: right;
          color: #0F2942;
        }
        .paid-row td {
          padding: 3px 8px;
        }
        .balance-row td {
          padding: 5px 8px;
          background: #FEF3C7;
          border: 1px solid #FCD34D !important;
        }
        .balance-label {
          text-align: right;
          font-weight: 800;
          color: #B45309;
        }
        .balance-val {
          text-align: right;
          font-weight: 800;
          color: #B45309;
          font-size: 9.5pt;
        }
        .no-border {
          border: none !important;
        }
        .words-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 4px;
          padding: 6px 10px;
          margin-bottom: 10px;
          font-size: 7.5pt;
        }
        .settle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }
        .settle-box {
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          padding: 6px 8px;
          font-size: 7.5pt;
          background: #FAFAFA;
        }
        .settle-title {
          font-weight: 800;
          color: #0F2942;
          font-size: 7pt;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 2px;
          margin-bottom: 4px;
        }
        .terms-signatures {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 14px;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid #E2E8F0;
        }
        .terms-col {
          font-size: 6.8pt;
          color: #475569;
        }
        .terms-col ol {
          margin: 3px 0 0 0;
          padding-left: 14px;
        }
        .terms-col li {
          margin-bottom: 2px;
        }
        .signatures-col {
          display: flex;
          justifyContent: space-between;
          align-items: flex-end;
          gap: 12px;
        }
        .sig-box {
          text-align: center;
          flex: 1;
        }
        .sig-line {
          height: 38px;
          border-bottom: 1px dashed #94A3B8;
          margin-bottom: 4px;
        }
        .sig-box span {
          font-size: 7.2pt;
          font-weight: 700;
          color: #334155;
        }
        .stamp-seal {
          border: 1px solid #C9A227;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          margin: 0 auto -20px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 5.5pt;
          color: #C9A227;
          font-weight: 800;
          line-height: 1.1;
          opacity: 0.6;
        }
        .bottom-salute {
          text-align: center;
          font-size: 7pt;
          color: #94A3B8;
          font-style: italic;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      ${pagesHtml}
    </body>
    </html>
  `;

  // Hidden print iframe
  let printFrame = document.getElementById('sv-invoice-print-frame') as HTMLIFrameElement;
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'sv-invoice-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);
  }

  const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
  if (doc) {
    doc.open();
    doc.write(fullHtml);
    doc.close();

    // Allow resources/styles to settle before triggering native print
    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (e) {
        console.error('Error invoking print dialog:', e);
        // Fallback: open print window
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(fullHtml);
          win.document.close();
          win.focus();
          win.print();
        }
      }
    }, 400);
  }
}
