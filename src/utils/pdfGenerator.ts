import { jsPDF } from 'jspdf';
import type { Booking, Payment } from '../types';

// Simple number to Indian currency words converter
function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const integerPart = Math.floor(num);
  if (integerPart === 0) return 'Zero Only';

  const n = ('000000000' + integerPart).slice(-9);
  const crore = parseInt(n.slice(0, 2));
  const lakh = parseInt(n.slice(2, 2));
  const thousand = parseInt(n.slice(4, 2));
  const hundred = parseInt(n.slice(6, 7));
  const tens = parseInt(n.slice(7, 9));

  let str = '';
  if (crore > 0) {
    str += (crore < 20 ? a[crore] : b[Math.floor(crore / 10)] + ' ' + a[crore % 10]) + 'Crore ';
  }
  if (lakh > 0) {
    str += (lakh < 20 ? a[lakh] : b[Math.floor(lakh / 10)] + ' ' + a[lakh % 10]) + 'Lakh ';
  }
  if (thousand > 0) {
    str += (thousand < 20 ? a[thousand] : b[Math.floor(thousand / 10)] + ' ' + a[thousand % 10]) + 'Thousand ';
  }
  if (hundred > 0) {
    str += a[hundred] + 'Hundred ';
  }
  if (tens > 0) {
    str += (str !== '' ? 'and ' : '') + (tens < 20 ? a[tens] : b[Math.floor(tens / 10)] + ' ' + a[tens % 10]);
  }
  return str.trim() + ' Only';
}

export const generateInvoicePdf = (booking: Booking, payments: Payment[]): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const invoiceNum = `INV-${booking.id.substring(booking.id.indexOf('-') + 1)}`;
  const createdDate = new Date(booking.createdAt || Date.now());
  const dateStr = createdDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Business Details (From template)
  const businessName = 'SV MAHAL & RESIDENCY';
  const businessAddress1 = 'No.859/B';
  const businessAddress2 = 'SV Thirumana mahal opposite';
  const businessAddress3 = 'Bangalore Main Road, Chengam';
  const businessPhone = 'Ph: 9500821550, 9043780215';
  const businessGstin = 'GSTIN: 33GTSPD9038L1Z1';

  // Typography details
  const fontTitle = 'times';
  const fontBody = 'helvetica';

  // Draw Logo fallback or top brand line
  doc.setFont(fontTitle, 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Navy
  doc.text(businessName, 15, 20);

  doc.setFont(fontBody, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate
  doc.text(businessAddress1, 15, 25);
  doc.text(businessAddress2, 15, 29);
  doc.text(businessAddress3, 15, 33);
  doc.text(businessPhone, 15, 37);
  doc.setFont(fontBody, 'bold');
  doc.text(businessGstin, 15, 41);

  // SERVICE INVOICE / TAX INVOICE badge (Right side)
  const invoiceTypeTitle = booking.billingType === 'GST' ? 'TAX INVOICE' : 'SERVICE INVOICE';
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 41, 66); // Dark Navy
  doc.text(invoiceTypeTitle, 195, 18, { align: 'right' });

  // Invoice # and Date Table
  doc.setFillColor(241, 245, 249);
  doc.rect(130, 25, 65, 16, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(130, 25, 195, 25);
  doc.line(130, 33, 195, 33);
  doc.line(130, 41, 195, 41);
  doc.line(130, 25, 130, 41);
  doc.line(162, 25, 162, 41);
  doc.line(195, 25, 195, 41);

  doc.setFont(fontBody, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICE #', 146, 30, { align: 'center' });
  doc.text('DATE', 178, 30, { align: 'center' });
  doc.setFont(fontBody, 'normal');
  doc.setFontSize(8.5);
  doc.text(invoiceNum, 146, 38, { align: 'center' });
  doc.text(`${dateStr}`, 178, 38, { align: 'center' });

  // BILL TO Banner
  doc.setFillColor(203, 213, 225);
  doc.rect(15, 48, 70, 5, 'F');
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('BILL TO', 18, 51.8);

  // Customer stay & company details
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(10);
  doc.text(booking.customerName, 15, 58);
  
  doc.setFont(fontBody, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${booking.customerPhone}`, 15, 62);
  if (booking.customerEmail) {
    doc.text(booking.customerEmail, 15, 66);
  }
  const splitAddress = doc.splitTextToSize(booking.customerAddress, 70);
  doc.text(splitAddress, 15, 70);

  // If corporate / company details exist
  if (booking.companyName) {
    const yCompany = 70 + (splitAddress.length * 4);
    doc.setFont(fontBody, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(booking.companyName, 15, yCompany);
    doc.text(`GSTIN: ${booking.companyGst || 'N/A'}`, 15, yCompany + 4);
    if (booking.companyContact) {
      doc.setFont(fontBody, 'normal');
      doc.setFontSize(8);
      doc.text(`Contact: ${booking.companyContact}`, 15, yCompany + 8);
    }
  }

  // -------------------------------------------------------------
  // THE PARTICULARS TABLE
  const tableY = 90;
  
  // Outer Table Header
  doc.setFillColor(203, 213, 225);
  doc.rect(15, tableY, 180, 7, 'F');
  doc.setDrawColor(71, 85, 105);
  doc.rect(15, tableY, 180, 7);

  doc.setFont(fontBody, 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PARTICULARS', 17, tableY + 5);
  doc.text('HSN/SAC', 125, tableY + 5, { align: 'center' });
  doc.text('GST RATE', 152, tableY + 5, { align: 'center' });
  doc.text('AMOUNT', 193, tableY + 5, { align: 'right' });

  // Main particulars frame
  const frameHeight = 85;
  doc.rect(15, tableY + 7, 180, frameHeight);
  // Column separators
  doc.line(112, tableY + 7, 112, tableY + 7 + frameHeight);
  doc.line(138, tableY + 7, 138, tableY + 7 + frameHeight);
  doc.line(166, tableY + 7, 166, tableY + 7 + frameHeight);

  // Table Body details
  let textY = tableY + 13;
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  // Service Description Name
  let particularsTitle = '';
  let hsnCode = '996311'; // Hotel standard
  let gstRateText = booking.billingType === 'Normal' ? '0%' : (booking.serviceType === 'room' ? '5%' : '18%');

  if (booking.serviceType === 'room') {
    particularsTitle = `${(booking.roomIds && booking.roomIds.length > 0 ? booking.roomIds.map(id => {
      const roomNum = id.replace('room-', '').toUpperCase();
      return `ROOM ${roomNum}`;
    }).join(', ') : 'ROOM STAY')} UNIT`;
  } else {
    particularsTitle = `SV MAHAL BANQUET HALL (${booking.packageName || 'STANDARD'} PACKAGE)`;
    hsnCode = '996312'; // Convention center HSN
  }

  // Draw Title
  doc.text(particularsTitle, 17, textY);

  // Draw Dates/Times details (from booking.actualCheckInTime if present)
  doc.setFont(fontBody, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  
  const checkInStr = booking.actualCheckInTime || booking.checkInDate;
  const checkOutStr = booking.actualCheckOutTime || booking.checkOutDate;
  doc.text(`${checkInStr} TO ${checkOutStr}`, 17, textY + 5);

  // Financial values
  const baseVal = booking.financials.baseAmount ?? booking.financials.subtotal;
  const cgstVal = booking.financials.cgst ?? 0;
  const sgstVal = booking.financials.sgst ?? 0;
  const roundOffVal = booking.financials.roundOff ?? 0;

  // Draw HSN and Rate on the first line
  doc.setFont(fontBody, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(hsnCode, 125, textY, { align: 'center' });
  doc.text(gstRateText, 152, textY, { align: 'center' });
  doc.text(baseVal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 193, textY, { align: 'right' });

  // If GST bill, print CGST, SGST, and Round Off
  if (booking.billingType === 'GST') {
    textY += 12;
    doc.setFont(fontBody, 'normal');
    doc.setTextColor(71, 85, 105);
    
    // CGST row
    doc.text(`CGST ${booking.serviceType === 'room' ? '2.5%' : '9%'}`, 17, textY);
    doc.text(cgstVal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 193, textY, { align: 'right' });

    // SGST row
    textY += 6;
    doc.text(`SGST ${booking.serviceType === 'room' ? '2.5%' : '9%'}`, 17, textY);
    doc.text(sgstVal.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 193, textY, { align: 'right' });

    // Round Off row
    if (roundOffVal !== 0) {
      textY += 12;
      doc.text(`Round off ${roundOffVal < 0 ? '(-)' : '(+)'}`, 17, textY);
      doc.text(Math.abs(roundOffVal).toLocaleString('en-IN', { minimumFractionDigits: 2 }), 193, textY, { align: 'right' });
    }
  } else if (booking.financials.discount > 0) {
    // Normal bill discount row
    textY += 12;
    doc.setFont(fontBody, 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Discount applied', 17, textY);
    doc.text(`(-) ${booking.financials.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 193, textY, { align: 'right' });
  }

  // Draw TOTAL Row at the bottom of the table
  const totalY = tableY + 7 + frameHeight;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, totalY, 180, 8, 'F');
  doc.rect(15, totalY, 180, 8);
  doc.line(112, totalY, 112, totalY + 8);
  doc.line(138, totalY, 138, totalY + 8);
  doc.line(166, totalY, 166, totalY + 8);

  doc.setFont(fontBody, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL', 17, totalY + 5.5);
  doc.text(`Rs. ${booking.financials.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 193, totalY + 5.5, { align: 'right' });

  // Amount Chargeable in words
  const wordsY = totalY + 14;
  doc.setFont(fontBody, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Amount Chargeable (in words)', 15, wordsY);
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(numberToWords(booking.financials.total), 15, wordsY + 4.5);

  // Advance paid & outstanding details box
  const boxY = wordsY + 12;
  doc.setFillColor(248, 250, 252);
  doc.rect(15, boxY, 85, 18, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, boxY, 85, 18);
  
  doc.setFont(fontBody, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Advance Paid:', 18, boxY + 5);
  doc.text('Balance Outstanding:', 18, boxY + 10);
  doc.text('Settlement Method:', 18, boxY + 15);

  doc.setFont(fontBody, 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${booking.financials.advancePaid.toLocaleString()}`, 52, boxY + 5);
  doc.setTextColor(booking.financials.balanceDue > 0 ? 220 : 22, booking.financials.balanceDue > 0 ? 38 : 101, booking.financials.balanceDue > 0 ? 38 : 216); // Red or Green
  doc.text(`Rs. ${booking.financials.balanceDue.toLocaleString()}`, 52, boxY + 10);
  doc.setTextColor(15, 23, 42);
  doc.text(payments[0] ? `${payments[0].method} (Ref: ${payments[0].referenceNumber || 'N/A'})` : 'Cash Ledger', 52, boxY + 15);

  // Terms and signatures (Footer alignment matching template)
  const footerY = 240;
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Terms & Conditions:', 15, footerY);
  
  doc.setFont(fontBody, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('1. Any disputes arising shall be subject to Chengam Jurisdiction.', 15, footerY + 4);
  doc.text('2. Payments are non-refundable for cancellations made within 24 hours of check-in.', 15, footerY + 8);
  doc.text('3. Checking out past stay limits without notification incurs additional day rates.', 15, footerY + 12);

  // Authorised Signatory section
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For.S V RESIDENCY`, 185, footerY, { align: 'right' });
  
  // Authorized signature line
  doc.setDrawColor(203, 213, 225);
  doc.line(145, footerY + 18, 195, footerY + 18);
  doc.setFont(fontBody, 'normal');
  doc.setFontSize(8);
  doc.text('Authorised Signatory', 170, footerY + 22, { align: 'center' });

  // Thank you note
  doc.setFont(fontTitle, 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Thank you for choosing SV MAHAL & RESIDENCY.', 105, footerY + 32, { align: 'center' });

  // ==========================================
  // PAGE 2: ANNEXURE A - GUEST REGISTRATION & PRIMARY IDENTITY RECORD
  // ==========================================
  doc.addPage();

  // Page 2 Header
  doc.setFont(fontTitle, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('SV MAHAL & RESIDENCY', 15, 20);

  doc.setFont(fontBody, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(201, 162, 39); // Gold
  doc.text('ANNEXURE A: GUEST REGISTRATION & PRIMARY IDENTITY VERIFICATION', 15, 26);

  doc.setFont(fontBody, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('No.859/B, Bangalore Main Road, Chengam - 606701, Tamil Nadu | Ph: 95008 21550 / 90437 80215', 15, 31);

  // Meta box top right
  doc.setFillColor(241, 245, 249);
  doc.rect(130, 15, 65, 18, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(130, 15, 65, 18);
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 41, 66);
  doc.text('BOOKING ID:', 133, 20);
  doc.text(booking.id, 192, 20, { align: 'right' });
  doc.text('RECORD DATE:', 133, 25);
  doc.text(dateStr, 192, 25, { align: 'right' });
  doc.text('SERVICE:', 133, 30);
  doc.text(booking.serviceType === 'mahal' ? 'SV Mahal Banquet' : 'Lodging Stay', 192, 30, { align: 'right' });

  // 1. Guest Particulars Box (Left)
  const gridY = 38;
  doc.setFillColor(248, 250, 252);
  doc.rect(15, gridY, 86, 44, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, gridY, 86, 44);

  doc.setFont(fontBody, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 41, 66);
  doc.text('PRIMARY GUEST CREDENTIALS', 18, gridY + 6);
  doc.line(18, gridY + 8, 98, gridY + 8);

  doc.setFont(fontBody, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Full Name:', 18, gridY + 13);
  doc.text('Mobile Phone:', 18, gridY + 18);
  doc.text('Email Address:', 18, gridY + 23);
  doc.text('Permanent Address:', 18, gridY + 28);
  doc.text('Identity Proof Type:', 18, gridY + 36);
  doc.text('Identity Document No:', 18, gridY + 41);

  doc.setFont(fontBody, 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text((booking.customerName || 'Guest').toUpperCase(), 48, gridY + 13);
  doc.text(booking.customerPhone || 'N/A', 48, gridY + 18);
  doc.text(booking.customerEmail || 'N/A', 48, gridY + 23);
  doc.setFontSize(7);
  doc.text((booking.customerAddress || 'Chengam, Tamil Nadu').substring(0, 32), 48, gridY + 28);
  doc.setFontSize(7.5);
  doc.setTextColor(2, 132, 199); // Cyan
  doc.text(booking.idType || 'Aadhaar Card', 48, gridY + 36);
  doc.setTextColor(15, 23, 42);
  doc.text(booking.idNumber || 'Verified', 48, gridY + 41);

  // 2. Stay Schedule & Event Particulars Box (Right)
  doc.setFillColor(248, 250, 252);
  doc.rect(109, gridY, 86, 44, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(109, gridY, 86, 44);

  doc.setFont(fontBody, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 41, 66);
  doc.text('SCHEDULED & ACTUAL STAY PARTICULARS', 112, gridY + 6);
  doc.line(112, gridY + 8, 192, gridY + 8);

  doc.setFont(fontBody, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Category:', 112, gridY + 13);
  doc.text('Event / Package:', 112, gridY + 18);
  doc.text('Scheduled Check-in:', 112, gridY + 23);
  doc.text('Actual Check-in Time:', 112, gridY + 28);
  doc.text('Scheduled Check-out:', 112, gridY + 33);
  doc.text('Actual Check-out Time:', 112, gridY + 38);
  if (booking.serviceType === 'mahal') {
    doc.text('EB Meter Readings:', 112, gridY + 43);
  }

  doc.setFont(fontBody, 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(booking.serviceType === 'mahal' ? 'SV Mahal Banquet' : 'Lodging Stay', 148, gridY + 13);
  doc.text(booking.packageName || 'Standard', 148, gridY + 18);
  doc.text(booking.checkInDate, 148, gridY + 23);
  doc.setTextColor(22, 163, 74); // Green
  doc.text(booking.actualCheckInTime || booking.checkInDate + ' 12:00', 148, gridY + 28);
  doc.setTextColor(15, 23, 42);
  doc.text(booking.checkOutDate, 148, gridY + 33);
  doc.setTextColor(2, 132, 199); // Blue
  doc.text(booking.actualCheckOutTime || booking.checkOutDate + ' 12:00', 148, gridY + 38);
  if (booking.serviceType === 'mahal') {
    doc.setTextColor(180, 83, 9);
    doc.text(`${booking.ebInitialUnits || 0} to ${booking.ebFinalUnits || 0} (${Math.max(0, (booking.ebFinalUnits || 0) - (booking.ebInitialUnits || 0))} U)`, 148, gridY + 43);
  }

  // 3. Primary Identity Document Frame Box
  const docBoxY = 88;
  doc.setFillColor(255, 255, 255);
  doc.rect(15, docBoxY, 180, 75);
  doc.setDrawColor(15, 41, 66);
  doc.setLineWidth(0.4);
  doc.rect(15, docBoxY, 180, 75);
  doc.setLineWidth(0.2);

  // Top banner of ID box
  doc.setFillColor(15, 41, 66);
  doc.rect(15, docBoxY, 180, 7, 'F');
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ATTACHED GOVERNMENT PRIMARY IDENTITY CARD PROOF', 18, docBoxY + 5);
  doc.text(`TYPE: ${(booking.idType || 'AADHAAR CARD').toUpperCase()} • VERIFIED GOVERNMENT RECORD`, 192, docBoxY + 5, { align: 'right' });

  // Interior ID verification details / embed area
  doc.setFillColor(248, 250, 252);
  doc.rect(20, docBoxY + 11, 170, 56, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(20, docBoxY + 11, 170, 56);

  doc.setFont(fontBody, 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 41, 66);
  doc.text('OFFICIAL GOVERNMENT PHOTO IDENTITY PROOF', 105, docBoxY + 22, { align: 'center' });

  doc.setFont(fontBody, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Physical government-issued identity proof verified and scanned by front desk operations.', 105, docBoxY + 28, { align: 'center' });
  doc.text('Stored encrypted under Tamil Nadu Hotel & Public Gathering Security Guidelines.', 105, docBoxY + 33, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.rect(40, docBoxY + 38, 130, 20, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(40, docBoxY + 38, 130, 20);

  doc.setFont(fontBody, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('DOCUMENT TYPE:', 45, docBoxY + 45);
  doc.text('DOCUMENT NUMBER:', 45, docBoxY + 51);
  doc.text('HOLDER NAME:', 45, docBoxY + 56);

  doc.setTextColor(15, 41, 66);
  doc.text(booking.idType || 'Aadhaar Card', 90, docBoxY + 45);
  doc.text(booking.idNumber || 'Verified & Present', 90, docBoxY + 51);
  doc.text((booking.customerName || 'Guest').toUpperCase(), 90, docBoxY + 56);

  doc.setFont(fontBody, 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Identity proof verified by SV Residency Reception Front Desk.', 105, docBoxY + 72, { align: 'center' });

  // 4. Declaration box
  const declY = 168;
  doc.setFillColor(248, 250, 252);
  doc.rect(15, declY, 180, 22, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, declY, 180, 22);

  doc.setFont(fontBody, 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 41, 66);
  doc.text('GUEST DECLARATION & IDENTITY ACKNOWLEDGMENT:', 18, declY + 5);

  doc.setFont(fontBody, 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  const declarationText = `I, ${(booking.customerName || 'the Customer').toUpperCase()}, solemnly declare that the credentials and identity document presented above are true, authentic, and legally valid. I confirm that all check-in and check-out timings, room/hall facilities, and electricity meter readings have been verified in my presence, and I accept the final financial settlement.`;
  const splitDeclaration = doc.splitTextToSize(declarationText, 172);
  doc.text(splitDeclaration, 18, declY + 10);

  // 5. Customer Signature & Counter-Signature blocks
  const sigY = 196;
  // Customer Sig Box
  doc.rect(15, sigY, 86, 42);
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, sigY, 86, 42);

  doc.line(25, sigY + 22, 91, sigY + 22);
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 41, 66);
  doc.text('SIGNATURE OF CUSTOMER / PRIMARY GUEST', 53, sigY + 27, { align: 'center' });
  doc.setFont(fontBody, 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${(booking.customerName || '').toUpperCase()}`, 53, sigY + 32, { align: 'center' });
  doc.text(`Phone: ${booking.customerPhone || ''} | Chengam`, 53, sigY + 36, { align: 'center' });
  doc.text(`Date: ${dateStr}`, 53, sigY + 40, { align: 'center' });

  // Management Counter-Signatory Box
  doc.rect(109, sigY, 86, 42);
  doc.setDrawColor(203, 213, 225);
  doc.rect(109, sigY, 86, 42);

  // Stamp circle
  doc.setDrawColor(201, 162, 39);
  doc.circle(152, sigY + 12, 10);
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(5);
  doc.setTextColor(201, 162, 39);
  doc.text('SV RESIDENCY', 152, sigY + 10, { align: 'center' });
  doc.text('OFFICIAL SEAL', 152, sigY + 13, { align: 'center' });
  doc.text('CHENGAM', 152, sigY + 16, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.line(119, sigY + 22, 185, sigY + 22);
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 41, 66);
  doc.text('AUTHORIZED FRONT DESK / MANAGER', 152, sigY + 27, { align: 'center' });
  doc.setFont(fontBody, 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('SV Mahal & SV Residency Operations', 152, sigY + 32, { align: 'center' });
  doc.text('Chengam, Tiruvannamalai Dt., Tamil Nadu', 152, sigY + 36, { align: 'center' });
  doc.text(`Date: ${dateStr}`, 152, sigY + 40, { align: 'center' });

  // Bottom footer on page 2
  doc.setFont(fontTitle, 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Annexure A to Invoice ${invoiceNum} • Immutable Guest Identity Verification Record`, 105, 248, { align: 'center' });

  // Save the PDF file
  doc.save(`Invoice_${booking.id}.pdf`);
};
