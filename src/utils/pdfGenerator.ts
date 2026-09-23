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
  const dateStr = new Date(booking.createdAt).toLocaleDateString('en-IN');

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

  // Big INVOICE badge (Right side)
  doc.setFont(fontBody, 'bold');
  doc.setFontSize(28);
  doc.setTextColor(147, 197, 253); // Light Blue
  doc.text('INVOICE', 195, 22, { align: 'right' });

  // Invoice # and Date Table
  doc.setFillColor(241, 245, 249);
  doc.rect(130, 26, 65, 16, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(130, 26, 195, 26);
  doc.line(130, 34, 195, 34);
  doc.line(130, 42, 195, 42);
  doc.line(130, 26, 130, 42);
  doc.line(162, 26, 162, 42);
  doc.line(195, 26, 195, 42);

  doc.setFont(fontBody, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICE #', 146, 31, { align: 'center' });
  doc.text('DATE', 178, 31, { align: 'center' });
  doc.setFont(fontBody, 'normal');
  doc.setFontSize(8.5);
  doc.text(invoiceNum, 146, 39, { align: 'center' });
  doc.text(dateStr, 178, 39, { align: 'center' });

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

  // Save the PDF file
  doc.save(`Invoice_${booking.id}.pdf`);
};
