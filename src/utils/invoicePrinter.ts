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
  const createdDate = new Date(booking.createdAt || Date.now());
  const dateStr = createdDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeStr = createdDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
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
            <tr><td>Date:</td><td>${dateStr} (${timeStr})</td></tr>
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

      <!-- MAHAL ELECTRICITY (EB) CONSUMPTION & METER VERIFICATION SECTION -->
      ${!isRoom ? `
        <div class="eb-audit-section">
          <div class="eb-audit-title">
            <span>⚡ ELECTRICITY BOARD (EB) METER READING & CONSUMPTION LEDGER</span>
            <span style="font-weight: 700; color: #0F2942;">Tariff Rate: ₹${booking.ebRate || 15}/Unit (kWh)</span>
          </div>

          <div class="eb-audit-layout">
            <div class="eb-calc-side">
              <table class="eb-audit-table">
                <thead>
                  <tr>
                    <th>CHECK-IN (INITIAL)</th>
                    <th>CHECK-OUT (FINAL)</th>
                    <th>CONSUMED</th>
                    <th>RATE</th>
                    <th style="text-align: right;">ELECTRICITY CHARGE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>${booking.ebInitialUnits || 0} kWh</strong>
                      <div class="eb-sub-time">${booking.ebMeterCheckInTime || booking.actualCheckInTime || booking.checkInDate}</div>
                    </td>
                    <td>
                      <strong>${booking.ebFinalUnits || 0} kWh</strong>
                      <div class="eb-sub-time">${booking.ebMeterCheckOutTime || booking.actualCheckOutTime || booking.checkOutDate}</div>
                    </td>
                    <td style="font-weight: 800; color: #0F2942;">
                      ${Math.max(0, (booking.ebFinalUnits || 0) - (booking.ebInitialUnits || 0))} Units
                    </td>
                    <td>₹${booking.ebRate || 15}/U</td>
                    <td style="text-align: right; font-weight: 800; color: #0284C7; font-size: 8pt;">
                      ₹${(booking.mahalCharges?.electricity || booking.ebTotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${(booking.ebMeterCheckInPic || booking.ebInitialPic || booking.ebMeterCheckOutPic) ? `
              <div class="eb-photos-side">
                <div class="eb-thumb-card">
                  <div class="eb-thumb-label">INITIAL METER</div>
                  ${(booking.ebMeterCheckInPic || booking.ebInitialPic) ? `
                    <img src="${booking.ebMeterCheckInPic || booking.ebInitialPic}" alt="Initial EB Meter" class="eb-thumb-img" />
                  ` : `
                    <div class="eb-thumb-empty">${booking.ebInitialUnits || 0} U</div>
                  `}
                  <div class="eb-thumb-sub">${booking.ebInitialUnits || 0} kWh</div>
                </div>

                <div class="eb-thumb-card">
                  <div class="eb-thumb-label">FINAL METER</div>
                  ${booking.ebMeterCheckOutPic ? `
                    <img src="${booking.ebMeterCheckOutPic}" alt="Final EB Meter" class="eb-thumb-img" />
                  ` : `
                    <div class="eb-thumb-empty">${booking.ebFinalUnits || 0} U</div>
                  `}
                  <div class="eb-thumb-sub">${booking.ebFinalUnits || 0} kWh</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <!-- BANK SETTLEMENT & DIGITAL UPI STRIP -->
      <div class="settle-strip">
        <div class="settle-item">
          <strong>BANK RTGS / NEFT:</strong> State Bank of India • A/C: <strong>40912233445</strong> • IFSC: <strong>SBIN0000823</strong> (Chengam Branch)
        </div>
        <div class="settle-item">
          <strong>DIGITAL UPI / QR:</strong> <strong>9500821550@okbizaxis</strong> • GPay / PhonePe: <strong>95008 21550</strong>
        </div>
      </div>

      <!-- TERMS, SIGNATURES & BOTTOM SALUTE -->
      <div class="terms-signatures-block">
        <div class="terms-signatures-row">
          <div class="terms-col">
            <div class="box-title">TERMS & CONDITIONS</div>
            <ol>
              <li>Disputes are subject to Chengam Jurisdiction.</li>
              <li>Check-out past billing limits incurs standard day tariff.</li>
              <li>Damages to property must be settled at counter before exit.</li>
            </ol>
          </div>

          <div class="signatures-col">
            <div class="sig-box">
              <div class="sig-line"></div>
              <span>Guest Signature</span>
            </div>
            <div class="sig-box">
              <div class="stamp-seal">SV RESIDENCY<br/>OFFICIAL</div>
              <div class="sig-line"></div>
              <span>Authorized Signatory</span>
            </div>
          </div>
        </div>

        <div class="bottom-salute">
          Thank you for choosing SV. MAHAL & SV. RESIDENCY, Chengam! We wish you a peaceful stay and celebration.
        </div>
      </div>
    </div>
  `;
}

function renderIdentityPageHtml(booking: Booking, copyLabel: string): string {
  const isRoom = booking.serviceType === 'room';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const invoiceNum = `INV-${booking.id.substring(booking.id.indexOf('-') + 1)}`;
  const primaryIdPic = booking.identityPic || (booking.identityPics && booking.identityPics[0]);

  return `
    <div class="invoice-page identity-page">
      <!-- TOP COPY BANNER -->
      <div class="copy-bar">
        <span>${copyLabel} — ANNEXURE A: GUEST REGISTRATION & PRIMARY IDENTITY RECORD</span>
      </div>

      <!-- HEADER WITH OFFICIAL LOGO -->
      <div class="invoice-header">
        <div class="brand-left">
          <div class="logo-medallion">
            <img src="/logo.png" alt="SV Logo" />
          </div>
          <div>
            <h1 class="brand-title">SV MAHAL & RESIDENCY</h1>
            <div class="brand-subtitle">Guest Identity Verification & Stay Acknowledgment Record</div>
            <p class="brand-address">
              No.859/B, Bangalore Main Road, Chengam - 606701, Tamil Nadu<br/>
              Front Desk: <strong>95008 21550</strong>, <strong>90437 80215</strong> | GSTIN: 33GTSPD9038L1Z1
            </p>
          </div>
        </div>

        <div class="invoice-meta">
          <h2 class="meta-title" style="font-size: 11pt;">GUEST ID RECORD</h2>
          <table class="meta-table">
            <tr><td>Booking ID:</td><td><strong>${booking.id}</strong></td></tr>
            <tr><td>Invoice Ref:</td><td><strong>${invoiceNum}</strong></td></tr>
            <tr><td>Printed On:</td><td>${dateStr} (${timeStr})</td></tr>
            <tr><td>Category:</td><td><strong>${isRoom ? 'Lodging Stay' : 'SV Mahal Banquet'}</strong></td></tr>
          </table>
        </div>
      </div>

      <!-- GUEST DETAILS & CHECK-IN / CHECK-OUT SCHEDULE -->
      <div class="details-grid">
        <div class="detail-box">
          <div class="box-title">PRIMARY GUEST CREDENTIALS</div>
          <table class="id-table">
            <tr><td style="width: 38%; color: #64748B;">Full Legal Name:</td><td><strong style="font-size: 9.5pt; color: #0F2942;">${(booking.customerName || 'Guest').toUpperCase()}</strong></td></tr>
            <tr><td style="color: #64748B;">Mobile Phone:</td><td><strong>${booking.customerPhone || 'N/A'}</strong></td></tr>
            <tr><td style="color: #64748B;">Email Address:</td><td>${booking.customerEmail || 'N/A'}</td></tr>
            <tr><td style="color: #64748B;">Residential Address:</td><td>${booking.customerAddress || 'Chengam, Tamil Nadu'}</td></tr>
            <tr><td style="color: #64748B;">ID Proof Type:</td><td><strong style="color: #0284C7;">${booking.idType || 'Aadhaar Card'}</strong></td></tr>
            <tr><td style="color: #64748B;">ID Document No:</td><td><strong style="color: #0F2942;">${booking.idNumber || 'Verified & Present'}</strong></td></tr>
          </table>
        </div>

        <div class="detail-box">
          <div class="box-title">SCHEDULED & ACTUAL CHECK-IN / CHECK-OUT PARTICULARS</div>
          <table class="id-table">
            <tr><td style="width: 44%; color: #64748B;">Service Type:</td><td><strong>${isRoom ? 'SV Residency Lodging Stay' : 'SV Thirumana Mahal Banquet'}</strong></td></tr>
            <tr><td style="color: #64748B;">Package / Units:</td><td><strong>${booking.packageName || (isRoom ? 'Standard Rooms' : 'Muhurtham Package')}</strong></td></tr>
            <tr><td style="color: #64748B;">Total Guest Count:</td><td><strong>${booking.guestCount || 1} Attendees</strong></td></tr>
            <tr><td style="color: #64748B;">Check-in Scheduled:</td><td><strong>${booking.checkInDate}</strong></td></tr>
            <tr><td style="color: #64748B;">Actual Check-in Time:</td><td><strong style="color: #16A34A; background: #DCFCE7; padding: 1px 6px; border-radius: 4px;">● ${booking.actualCheckInTime || booking.checkInDate + ' 12:00'}</strong></td></tr>
            <tr><td style="color: #64748B;">Check-out Scheduled:</td><td><strong>${booking.checkOutDate}</strong></td></tr>
            <tr><td style="color: #64748B;">Actual Check-out Time:</td><td><strong style="color: #0284C7; background: #E0F2FE; padding: 1px 6px; border-radius: 4px;">● ${booking.actualCheckOutTime || booking.checkOutDate + ' 12:00'}</strong></td></tr>
            ${!isRoom ? `
              <tr><td style="color: #64748B;">EB Consumption:</td><td><strong>${booking.ebInitialUnits || 0} to ${booking.ebFinalUnits || 0} (${Math.max(0, (booking.ebFinalUnits || 0) - (booking.ebInitialUnits || 0))} Units)</strong></td></tr>
            ` : ''}
          </table>
        </div>
      </div>

      <!-- PRIMARY IDENTITY DOCUMENT PHOTO FRAME -->
      <div class="id-proof-wrapper">
        <div class="id-proof-header">
          <strong>GOVERNMENT PRIMARY IDENTITY CARD ATTACHMENT</strong>
          <span>Document Type: <strong>${booking.idType || 'Aadhaar Card'}</strong> • Verified Government Identity Record</span>
        </div>

        <div class="id-proof-box">
          ${primaryIdPic ? `
            <img src="${primaryIdPic}" alt="Primary Government Identity Document" class="id-document-img" />
          ` : `
            <div class="id-fallback-box">
              <div style="font-weight: 800; font-size: 11pt; color: #0F2942; margin-bottom: 4px;">OFFICIAL GOVERNMENT IDENTITY RECORD</div>
              <div style="font-size: 8pt; color: #64748B; max-width: 420px; margin: 0 auto 8px auto;">
                Physical original identity proof (${booking.idType || 'Aadhaar Card'}) verified and validated by front desk reception desk at check-in.
              </div>
              <div style="font-size: 8pt; color: #0284C7; font-weight: 700;">
                Document Verified: ${booking.idType || 'Aadhaar Card'} | ID Number: ${booking.idNumber || 'Verified'}
              </div>
            </div>
          `}
        </div>
        <div class="id-proof-footer">
          Guest ID verification is recorded under Tamil Nadu Innkeepers & Public Safety Regulations.
        </div>
      </div>

      <!-- DECLARATION & FORMAL SIGNATURE BOX -->
      <div class="declaration-block">
        <div class="box-title" style="margin-bottom: 3px;">GUEST DECLARATION & IDENTITY ACKNOWLEDGMENT</div>
        <p style="margin: 0; font-size: 7.2pt; color: #334155; line-height: 1.35;">
          I, <strong>${(booking.customerName || 'the Customer').toUpperCase()}</strong>, hereby solemnly confirm that the identification details and proof document submitted above are authentic, unexpired, and legally registered to me. I acknowledge that the check-in and check-out dates and timings, hall facilities, utility meter readings (where applicable), and final financial accounts were inspected and finalized with my full agreement.
        </p>
      </div>

      <div class="signature-section-grid">
        <div class="sig-panel">
          <div class="sig-drawable-area">
            ${booking.customerSignature ? `
              <img src="${booking.customerSignature}" alt="Customer Digital Signature" class="customer-sig-image" />
            ` : `
              <div class="sig-physical-line"></div>
            `}
          </div>
          <div class="sig-title">SIGNATURE OF CUSTOMER / PRIMARY GUEST</div>
          <div class="sig-details">Name: <strong>${(booking.customerName || '').toUpperCase()}</strong></div>
          <div class="sig-details">Mobile: ${booking.customerPhone || ''} | Place: Chengam</div>
          <div class="sig-details">Date: <strong>${dateStr}</strong></div>
        </div>

        <div class="sig-panel">
          <div class="sig-drawable-area">
            <div class="stamp-seal-box">
              SV RESIDENCY & MAHAL<br/>
              OFFICIAL VERIFICATION<br/>
              CHENGAM - 606701
            </div>
            <div class="sig-physical-line"></div>
          </div>
          <div class="sig-title">AUTHORIZED FRONT DESK / MANAGER</div>
          <div class="sig-details">SV Mahal & SV Residency Operations</div>
          <div class="sig-details">Chengam, Tiruvannamalai Dt., Tamil Nadu</div>
          <div class="sig-details">Date: <strong>${dateStr}</strong></div>
        </div>
      </div>

      <div class="bottom-salute" style="margin-top: 10px;">
        This document serves as Annexure A to Invoice ${invoiceNum} and remains an immutable part of the guest verification ledger.
      </div>
    </div>
  `;
}

export function printInvoice(booking: Booking, copyType: 'customer' | 'admin' | 'both' = 'both'): void {
  const customerPages = `${renderSinglePageHtml(booking, 'CUSTOMER COPY')}${renderIdentityPageHtml(booking, 'CUSTOMER COPY')}`;
  const adminPages = `${renderSinglePageHtml(booking, 'ADMINISTRATION COPY')}${renderIdentityPageHtml(booking, 'ADMINISTRATION COPY')}`;
  
  const pagesHtml = copyType === 'both'
    ? `${customerPages}${adminPages}`
    : (copyType === 'customer' ? customerPages : adminPages);

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title></title>
      <style>
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-page {
            width: 210mm !important;
            height: 296mm !important;
            max-height: 296mm !important;
            margin: 0 !important;
            padding: 5mm 10mm !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
          }
          .invoice-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
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
          width: 210mm;
          height: 296mm;
          max-height: 296mm;
          margin: 0 auto;
          padding: 5mm 10mm;
          box-sizing: border-box;
          background: #FFFFFF;
          overflow: hidden;
          page-break-after: always;
          break-after: page;
          page-break-inside: avoid;
          break-inside: avoid;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .invoice-page:last-child {
          page-break-after: avoid;
          break-after: avoid;
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
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .meta-title {
          font-size: 14pt;
          font-weight: 800;
          color: #0F2942;
          margin: 0 0 4px 0;
          letter-spacing: 0.05em;
        }
        .meta-table {
          margin-left: auto;
          border-collapse: collapse;
          font-size: 7.5pt;
        }
        .meta-table td {
          padding: 1.5px 4px;
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
        /* TERMS & SIGNATURES BLOCK */
        .terms-signatures-block {
          border-top: 1px solid #E2E8F0;
          padding-top: 3px;
          margin-top: 2px;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .terms-signatures-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .terms-col {
          flex: 1.2;
          font-size: 6.2pt;
          color: #475569;
        }
        .terms-col ol {
          margin: 2px 0 0 0;
          padding-left: 12px;
        }
        .terms-col li {
          margin-bottom: 1.5px;
        }
        .signatures-col {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 10px;
        }
        .sig-box {
          text-align: center;
          flex: 1;
        }
        .sig-line {
          height: 30px;
          border-bottom: 1px dashed #94A3B8;
          margin-bottom: 2px;
        }
        .sig-box span {
          font-size: 6.5pt;
          font-weight: 700;
          color: #334155;
        }
        .stamp-seal {
          border: 1px solid #C9A227;
          border-radius: 50%;
          width: 42px;
          height: 42px;
          margin: 0 auto -16px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 5pt;
          color: #C9A227;
          font-weight: 800;
          line-height: 1.05;
          opacity: 0.65;
        }
        .bottom-salute {
          text-align: center;
          font-size: 6.8pt;
          color: #64748B;
          font-style: italic;
          margin-top: 3px;
          border-top: 1px dashed #E2E8F0;
          padding-top: 2px;
        }

        /* EB AUDIT SECTION (MAHAL INVOICE) */
        .eb-audit-section {
          border: 1px solid #CBD5E1;
          border-radius: 5px;
          padding: 4px 8px;
          margin-bottom: 4px;
          background: #F8FAFC;
        }
        .eb-audit-title {
          display: flex;
          justify-content: space-between;
          font-weight: 800;
          font-size: 6.8pt;
          color: #0F2942;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 2px;
          margin-bottom: 3px;
        }
        .eb-audit-layout {
          display: flex;
          gap: 8px;
          align-items: stretch;
        }
        .eb-calc-side {
          flex: 1;
        }
        .eb-audit-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 6.6pt;
        }
        .eb-audit-table th {
          background: #E2E8F0;
          color: #0F2942;
          padding: 2.5px 5px;
          text-align: left;
          font-size: 6.2pt;
          font-weight: 700;
          border: 1px solid #CBD5E1;
        }
        .eb-audit-table td {
          padding: 2.5px 5px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
        }
        .eb-sub-time {
          font-size: 5.8pt;
          color: #64748B;
        }
        .eb-photos-side {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .eb-thumb-card {
          width: 74px;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          padding: 3px;
          background: #FFFFFF;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .eb-thumb-label {
          font-size: 5.6pt;
          font-weight: 800;
          color: #475569;
          white-space: nowrap;
          margin-bottom: 2px;
        }
        .eb-thumb-img {
          width: 100%;
          height: 36px;
          object-fit: cover;
          border-radius: 3px;
          border: 1px solid #CBD5E1;
          background: #0F172A;
          display: block;
        }
        .eb-thumb-empty {
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F1F5F9;
          color: #64748B;
          font-size: 6pt;
          border-radius: 3px;
          border: 1px dashed #CBD5E1;
        }
        .eb-thumb-sub {
          font-size: 5.6pt;
          color: #1E293B;
          font-weight: 700;
          margin-top: 1px;
        }

        /* SETTLEMENT STRIP */
        .settle-strip {
          display: flex;
          justify-content: space-between;
          background: #F8FAFC;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          padding: 3px 6px;
          margin-bottom: 4px;
          font-size: 6.5pt;
          color: #334155;
        }
        .settle-item strong {
          color: #0F2942;
        }

        /* ANNEXURE A: IDENTITY VERIFICATION PAGE */
        .identity-page {
          background: #FFFFFF;
        }
        .id-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7.2pt;
        }
        .id-table td {
          padding: 2.5px 0;
          vertical-align: top;
        }
        .id-proof-wrapper {
          border: 1.5px solid #0F2942;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 10px;
          background: #FAFAFA;
        }
        .id-proof-header {
          display: flex;
          justify-content: space-between;
          font-size: 7.5pt;
          font-weight: 800;
          color: #0F2942;
          border-bottom: 1px solid #CBD5E1;
          padding-bottom: 4px;
          margin-bottom: 8px;
        }
        .id-proof-box {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 140px;
          max-height: 180px;
          background: #F1F5F9;
          border-radius: 4px;
          overflow: hidden;
          border: 1px dashed #CBD5E1;
          padding: 6px;
        }
        .id-document-img {
          max-width: 100%;
          max-height: 168px;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .id-fallback-box {
          text-align: center;
          padding: 18px;
        }
        .id-proof-footer {
          font-size: 6.5pt;
          color: #64748B;
          margin-top: 6px;
          text-align: center;
          font-style: italic;
        }
        .declaration-block {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          padding: 8px 10px;
          margin-bottom: 10px;
        }
        .signature-section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 8px;
        }
        .sig-panel {
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 8px;
          text-align: center;
          background: #FFFFFF;
        }
        .sig-drawable-area {
          height: 52px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          margin-bottom: 6px;
          position: relative;
        }
        .customer-sig-image {
          max-height: 48px;
          max-width: 170px;
          object-fit: contain;
        }
        .sig-physical-line {
          width: 80%;
          border-bottom: 1.5px solid #0F2942;
          margin: 0 auto 4px auto;
        }
        .stamp-seal-box {
          border: 2px solid #C9A227;
          border-radius: 50%;
          width: 58px;
          height: 58px;
          margin: 0 auto -16px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 5pt;
          color: #C9A227;
          font-weight: 800;
          line-height: 1.1;
          opacity: 0.65;
          transform: rotate(-5deg);
        }
        .sig-title {
          font-size: 7.2pt;
          font-weight: 800;
          color: #0F2942;
          margin-bottom: 2px;
        }
        .sig-details {
          font-size: 6.8pt;
          color: #64748B;
          margin-bottom: 1px;
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
    try {
      doc.title = '';
    } catch {}

    // Allow resources/styles to settle before triggering native print
    setTimeout(() => {
      try {
        if (doc) doc.title = '';
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (e) {
        console.error('Error invoking print dialog:', e);
        // Fallback: open print window
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(fullHtml);
          win.document.close();
          try {
            win.document.title = '';
          } catch {}
          win.focus();
          win.print();
        }
      }
    }, 400);
  }
}
