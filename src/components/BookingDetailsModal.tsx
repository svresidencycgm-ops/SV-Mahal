import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import { invoiceService } from '../services/invoiceService';
import { 
  X, Calendar, User, DollarSign, CreditCard, Trash2, Printer, 
  Download, Ban, Phone, Mail, MapPin, Edit, Save 
} from 'lucide-react';
import type { Booking } from '../types';

import { addTimestampWatermark } from '../utils/watermark';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose }) => {
  const { 
    selectedBooking, setSelectedBooking, updateBooking, cancelBooking, 
    deleteBooking, payments, addPayment, deletePayment, currentUserRole, rooms, addToast 
  } = useApp();

  // Local drawer toggles
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Checkout auto-capture states
  const [isCheckoutPromptOpen, setIsCheckoutPromptOpen] = useState(false);
  const [checkoutTime, setCheckoutTime] = useState('');
  const [checkoutInTime, setCheckoutInTime] = useState('');
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutBillingType, setCheckoutBillingType] = useState<'GST' | 'Normal'>('GST');
  
  // Check-in auto-capture states
  const [isCheckInPromptOpen, setIsCheckInPromptOpen] = useState(false);
  const [checkInInTime, setCheckInInTime] = useState('');
  const [chkInEbPic, setChkInEbPic] = useState('');
  const [chkInEbTime, setChkInEbTime] = useState('');

  // Checkout custom pics
  const [chkOutEbPic, setChkOutEbPic] = useState('');
  const [chkOutEbTime, setChkOutEbTime] = useState('');
  const [chkDamagePic, setChkDamagePic] = useState('');
  const [chkDamagePicTime, setChkDamagePicTime] = useState('');
  const [chkDamageReport, setChkDamageReport] = useState('');

  // Printing Copy Selector
  const [isPrintSelectorOpen, setIsPrintSelectorOpen] = useState(false);
  const [printCopiesOption, setPrintCopiesOption] = useState<'customer' | 'admin' | 'both'>('both');

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setterPic: (val: string) => void,
    setterTime: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const watermarked = await addTimestampWatermark(base64);
      setterPic(watermarked);
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      setterTime(nowStr);
    };
    reader.readAsDataURL(file);
  };
  
  // Custom charges for Checkout prompt
  const [chkEbInitialUnits, setChkEbInitialUnits] = useState(0);
  const [chkEbFinalUnits, setChkEbFinalUnits] = useState(0);
  const [chkEbRate, setChkEbRate] = useState(10);
  const chkElectricity = Math.max(0, (chkEbFinalUnits - chkEbInitialUnits) * chkEbRate);

  const [chkRooms, setChkRooms] = useState(0);
  const [chkGenerator, setChkGenerator] = useState(0);
  const [chkDamages, setChkDamages] = useState(0);
  const [chkOther, setChkOther] = useState(0);


  // New payment form state
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Editing form states
  const [editCustName, setEditCustName] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustEmail, setEditCustEmail] = useState('');
  const [editCustAddress, setEditCustAddress] = useState('');
  const [editGuests, setEditGuests] = useState(1);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editStatus, setEditStatus] = useState<Booking['status']>('Pending');

  // Additional charges states
  const [editElectricity, setEditElectricity] = useState(0);
  const [editMahalRooms, setEditMahalRooms] = useState(0);
  const [editGenerator, setEditGenerator] = useState(0);
  const [editDamages, setEditDamages] = useState(0);
  const [editOther, setEditOther] = useState(0);
  const [editBillingType, setEditBillingType] = useState<'GST' | 'Normal'>('GST');

  // Trigger load when editing mode opens
  const enterEditMode = () => {
    if (!selectedBooking) return;
    setEditCustName(selectedBooking.customerName);
    setEditCustPhone(selectedBooking.customerPhone);
    setEditCustEmail(selectedBooking.customerEmail);
    setEditCustAddress(selectedBooking.customerAddress);
    setEditGuests(selectedBooking.guestCount);
    setEditDiscount(selectedBooking.financials.discount);
    setEditStatus(selectedBooking.status);

    // Load custom charges
    setEditElectricity(selectedBooking.mahalCharges?.electricity || 0);
    setEditMahalRooms(selectedBooking.mahalCharges?.rooms || 0);
    setEditGenerator(selectedBooking.mahalCharges?.generator || 0);
    setEditDamages(selectedBooking.mahalCharges?.damages || 0);
    setEditOther(selectedBooking.mahalCharges?.other || 0);
    setEditBillingType(selectedBooking.billingType || 'GST');

    setIsEditMode(true);
  };

  if (!isOpen || !selectedBooking) return null;

  const filteredPayments = payments.filter(p => p.bookingId === selectedBooking.id);
  const invoiceNumber = `INV-${selectedBooking.id.substring(selectedBooking.id.indexOf('-') + 1)}`;

  const getWhatsAppEstimateLink = () => {
    if (!selectedBooking) return '';
    const phone = selectedBooking.customerPhone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${selectedBooking.customerName.toUpperCase()},\n\n` +
      `Here is the quotation estimate for your upcoming ${selectedBooking.serviceType === 'room' ? 'Residency Room' : 'SV Mahal'} booking.\n\n` +
      `Estimated Amount: ₹${selectedBooking.financials.total.toLocaleString()}\n` +
      `Check-in: ${selectedBooking.checkInDate}\n` +
      `Check-out: ${selectedBooking.checkOutDate}\n\n` +
      `Thank you,\nSV Residency & Mahal`
    );
    return `https://api.whatsapp.com/send?phone=${phone.startsWith('91') ? phone : '91' + phone}&text=${text}`;
  };

  const getWhatsAppInvoiceLink = () => {
    if (!selectedBooking) return '';
    const phone = selectedBooking.customerPhone.replace(/[^0-9]/g, '');
    const invoiceNum = `INV-${selectedBooking.id.substring(selectedBooking.id.indexOf('-') + 1)}`;
    const text = encodeURIComponent(
      `Hello ${selectedBooking.customerName.toUpperCase()},\n\n` +
      `Thank you for staying with us! Your final invoice ${invoiceNum} for booking ${selectedBooking.id} is attached/settled.\n\n` +
      `Total Amount: ₹${selectedBooking.financials.total.toLocaleString()}\n` +
      `Amount Paid: ₹${selectedBooking.financials.advancePaid.toLocaleString()}\n` +
      `Balance Due: ₹${selectedBooking.financials.balanceDue.toLocaleString()}\n\n` +
      `Best Regards,\nSV Residency & Mahal`
    );
    return `https://api.whatsapp.com/send?phone=${phone.startsWith('91') ? phone : '91' + phone}&text=${text}`;
  };

  const getWhatsAppReminderLink = () => {
    if (!selectedBooking) return '';
    const phone = selectedBooking.customerPhone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${selectedBooking.customerName.toUpperCase()},\n\n` +
      `This is a gentle payment reminder for booking ${selectedBooking.id}.\n\n` +
      `Pending Outstanding Balance: ₹${selectedBooking.financials.balanceDue.toLocaleString()}\n\n` +
      `Please settle the dues at your earliest convenience.\n\n` +
      `Thank you,\nSV Residency & Mahal`
    );
    return `https://api.whatsapp.com/send?phone=${phone.startsWith('91') ? phone : '91' + phone}&text=${text}`;
  };

  const renderInvoiceCopy = (copyLabel: 'CUSTOMER COPY' | 'ADMINISTRATION COPY') => {
    if (!selectedBooking) return null;
    const baseVal = selectedBooking.financials.baseAmount ?? selectedBooking.financials.subtotal;
    const cgstVal = selectedBooking.financials.cgst ?? 0;
    const sgstVal = selectedBooking.financials.sgst ?? 0;
    const roundOffVal = selectedBooking.financials.roundOff ?? 0;

    return (
      <div className="print-invoice-page" style={{ fontFamily: 'var(--font-sans)', color: '#000000', backgroundColor: '#FFFFFF', padding: '15mm', boxSizing: 'border-box' }}>
        
        {/* --- PAGE 1: BILLING DETAILS --- */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Copy Label Header */}
          <div style={{ textAlign: 'right', borderBottom: '2px solid #0F2942', paddingBottom: '4px', marginBottom: '15px' }}>
            <span style={{ fontSize: '10pt', fontWeight: 800, letterSpacing: '0.1em', color: '#0F2942' }}>{copyLabel}</span>
          </div>

          {/* Business Details Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '18pt', fontWeight: 800, color: '#0F2942', margin: 0, fontFamily: 'var(--font-sans)' }}>SV MAHAL & RESIDENCY</h1>
              <p style={{ fontSize: '8.5pt', color: '#475569', margin: '2px 0 0 0' }}>
                No.859/B, SV Thirumana Mahal Opposite, Bangalore Main Road, Chengam
              </p>
              <p style={{ fontSize: '8.5pt', color: '#475569', margin: 0 }}>
                Ph: 9500821550, 9043780215 | GSTIN: 33GTSPD9038L1Z1
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '16pt', fontWeight: 800, color: '#C9A227', margin: 0 }}>INVOICE</h2>
              <p style={{ fontSize: '8.5pt', color: '#475569', margin: '2px 0 0 0' }}>
                Invoice No: <strong>{invoiceNumber}</strong>
              </p>
              <p style={{ fontSize: '8.5pt', color: '#475569', margin: 0 }}>
                Date: {new Date(selectedBooking.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Billed To / Stay Details Table Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '9pt' }}>
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontWeight: 800, color: '#0F2942', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '6px', textTransform: 'uppercase' }}>BILLED TO:</div>
              <div><strong>Name:</strong> {selectedBooking.customerName.toUpperCase()}</div>
              <div><strong>Phone:</strong> {selectedBooking.customerPhone}</div>
              {selectedBooking.customerEmail && <div><strong>Email:</strong> {selectedBooking.customerEmail}</div>}
              <div><strong>Address:</strong> {selectedBooking.customerAddress.toUpperCase()}</div>
              {selectedBooking.companyName && (
                <div style={{ marginTop: '6px', borderTop: '1px dashed #E2E8F0', paddingTop: '4px' }}>
                  <strong>Company:</strong> {selectedBooking.companyName.toUpperCase()}<br />
                  <strong>GSTIN:</strong> {selectedBooking.companyGst || 'N/A'}
                </div>
              )}
            </div>
            
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontWeight: 800, color: '#0F2942', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '6px', textTransform: 'uppercase' }}>STAY / RESERVATION:</div>
              <div><strong>Service:</strong> {selectedBooking.serviceType === 'room' ? 'Hotel Residency Room' : 'Banquet Mahal Event'}</div>
              {selectedBooking.serviceType === 'room' ? (
                <>
                  <div><strong>Assigned Rooms:</strong> {selectedBooking.roomIds?.map(id => rooms.find(r => r.id === id)?.number).join(', ') || 'N/A'}</div>
                  <div><strong>Check-In Time:</strong> {selectedBooking.actualCheckInTime || selectedBooking.checkInDate}</div>
                  <div><strong>Check-Out Time:</strong> {selectedBooking.actualCheckOutTime || selectedBooking.checkOutDate}</div>
                </>
              ) : (
                <>
                  <div><strong>Package Name:</strong> {selectedBooking.packageName || 'Standard Package'}</div>
                  <div><strong>Event Type:</strong> {selectedBooking.eventDetails?.eventType || 'Celebration'}</div>
                  <div><strong>Event Date:</strong> {selectedBooking.checkInDate}</div>
                </>
              )}
              <div><strong>Headcount:</strong> {selectedBooking.guestCount} Guests</div>
            </div>
          </div>

          {/* Itemized Cost Breakdown Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F2942', fontWeight: 800 }}>
                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #CBD5E1' }}>Particular Description</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>HSN/SAC</th>
                <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>GST Rate</th>
                <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #CBD5E1' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #CBD5E1' }}>
                  {selectedBooking.serviceType === 'room' ? (
                    <strong>Residency Stays - {(selectedBooking.roomIds && selectedBooking.roomIds.length > 0) ? selectedBooking.roomIds.map(id => `ROOM ${id.replace('room-', '').toUpperCase()}`).join(', ') : 'Lodging Unit'}</strong>
                  ) : (
                    <strong>SV Mahal Banquet Space Rental ({selectedBooking.packageName} Package)</strong>
                  )}
                </td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>{selectedBooking.serviceType === 'room' ? '996311' : '996312'}</td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>
                  {selectedBooking.billingType === 'Normal' ? '0%' : (selectedBooking.serviceType === 'room' ? '5%' : '18%')}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #CBD5E1' }}>₹{baseVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>

              {/* Custom Mahal Charges Details */}
              {selectedBooking.serviceType === 'mahal' && selectedBooking.mahalCharges && (
                <>
                  {(selectedBooking.mahalCharges.electricity || 0) > 0 && (
                    <tr>
                      <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', paddingLeft: '20px' }}>
                        Electricity Meter Charges 
                        <span style={{ fontSize: '7pt', color: '#64748B', display: 'block', marginTop: '2px' }}>
                          (Initial: {selectedBooking.ebInitialUnits || 0}, Final: {selectedBooking.ebFinalUnits || 0}, Rate: ₹{selectedBooking.ebRate || 0}/unit)
                        </span>
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>996312</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>{selectedBooking.billingType === 'Normal' ? '0%' : '18%'}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1' }}>+ ₹{selectedBooking.mahalCharges.electricity.toLocaleString()}</td>
                    </tr>
                  )}
                  {(selectedBooking.mahalCharges.rooms || 0) > 0 && (
                    <tr>
                      <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', paddingLeft: '20px' }}>Additional Mahal Rooms Stay</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>996311</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>{selectedBooking.billingType === 'Normal' ? '0%' : '18%'}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1' }}>+ ₹{selectedBooking.mahalCharges.rooms.toLocaleString()}</td>
                    </tr>
                  )}
                  {(selectedBooking.mahalCharges.generator || 0) > 0 && (
                    <tr>
                      <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', paddingLeft: '20px' }}>Generator Fuel/Usage Fee</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>996312</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>{selectedBooking.billingType === 'Normal' ? '0%' : '18%'}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1' }}>+ ₹{selectedBooking.mahalCharges.generator.toLocaleString()}</td>
                    </tr>
                  )}
                  {(selectedBooking.mahalCharges.damages || 0) > 0 && (
                    <tr>
                      <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', paddingLeft: '20px', color: '#DC2626' }}>
                        Damages / Penalty Levied
                        {selectedBooking.damageReportText && (
                          <span style={{ fontSize: '7pt', color: '#DC2626', display: 'block', marginTop: '2px', fontStyle: 'italic' }}>
                            Note: {selectedBooking.damageReportText}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>996312</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>0%</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', color: '#DC2626' }}>+ ₹{selectedBooking.mahalCharges.damages.toLocaleString()}</td>
                    </tr>
                  )}
                  {(selectedBooking.mahalCharges.other || 0) > 0 && (
                    <tr>
                      <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', paddingLeft: '20px' }}>Other Miscellaneous Dues</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>996312</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #CBD5E1' }}>{selectedBooking.billingType === 'Normal' ? '0%' : '18%'}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1' }}>+ ₹{selectedBooking.mahalCharges.other.toLocaleString()}</td>
                    </tr>
                  )}
                </>
              )}

              {/* Subtotal & taxes */}
              <tr style={{ borderTop: '2px solid #CBD5E1' }}>
                <td colSpan={2} style={{ border: 'none' }}></td>
                <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', fontWeight: 700 }}>Subtotal:</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1' }}>₹{selectedBooking.financials.subtotal.toLocaleString()}</td>
              </tr>
              {selectedBooking.financials.discount > 0 && (
                <tr>
                  <td colSpan={2} style={{ border: 'none' }}></td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', fontWeight: 700, color: '#DC2626' }}>Discount:</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', color: '#DC2626' }}>- ₹{selectedBooking.financials.discount.toLocaleString()}</td>
                </tr>
              )}
              {selectedBooking.billingType === 'GST' && (
                <>
                  <tr>
                    <td colSpan={2} style={{ border: 'none' }}></td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', fontWeight: 700 }}>CGST:</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1' }}>₹{cgstVal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ border: 'none' }}></td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', fontWeight: 700 }}>SGST:</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1' }}>₹{sgstVal.toLocaleString()}</td>
                  </tr>
                </>
              )}
              <tr>
                <td colSpan={2} style={{ border: 'none' }}></td>
                <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', fontWeight: 800, backgroundColor: '#F1F5F9' }}>Grand Total:</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', fontWeight: 800, backgroundColor: '#F1F5F9' }}>₹{selectedBooking.financials.total.toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ border: 'none' }}></td>
                <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', fontWeight: 700, color: '#16A34A' }}>Paid to Date:</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', fontWeight: 700, color: '#16A34A' }}>₹{selectedBooking.financials.advancePaid.toLocaleString()}</td>
              </tr>
              <tr style={{ borderTop: '2px double #000' }}>
                <td colSpan={2} style={{ border: 'none' }}></td>
                <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', fontWeight: 800, color: '#B45309', backgroundColor: '#FFFBEB' }}>Balance Due:</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #CBD5E1', fontWeight: 800, color: '#B45309', backgroundColor: '#FFFBEB' }}>₹{selectedBooking.financials.balanceDue.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Mahal Specific Inclusions Pics (EB readings, damage photos) */}
          {selectedBooking.serviceType === 'mahal' && (
            <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '15px', marginTop: 'auto' }}>
              <div style={{ fontWeight: 800, color: '#0F2942', fontSize: '8.5pt', marginBottom: '8px', textTransform: 'uppercase' }}>MAHAL FIELD VERIFICATION LOGS:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                {selectedBooking.ebMeterCheckInPic && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '7.5pt', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>INITIAL EB READING</div>
                    <img src={selectedBooking.ebMeterCheckInPic} alt="Initial EB Meter" style={{ width: '100%', maxHeight: '110px', objectFit: 'contain', border: '1px solid #CBD5E1', borderRadius: '4px' }} />
                  </div>
                )}
                {selectedBooking.ebMeterCheckOutPic && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '7.5pt', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>FINAL EB READING</div>
                    <img src={selectedBooking.ebMeterCheckOutPic} alt="Final EB Meter" style={{ width: '100%', maxHeight: '110px', objectFit: 'contain', border: '1px solid #CBD5E1', borderRadius: '4px' }} />
                  </div>
                )}
                {selectedBooking.damagePic && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '7.5pt', color: '#DC2626', fontWeight: 700, marginBottom: '4px' }}>DAMAGE RECORD PHOTO</div>
                    <img src={selectedBooking.damagePic} alt="Damage Report" style={{ width: '100%', maxHeight: '110px', objectFit: 'contain', border: '1px solid #FCA5A5', borderRadius: '4px' }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- PAGE 2: GUEST ID ATTACHMENT --- */}
        <div className="print-break-before" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start', paddingTop: '15mm' }}>
          <div style={{ borderBottom: '2px solid #0F2942', paddingBottom: '4px', marginBottom: '20px' }}>
            <span style={{ fontSize: '10pt', fontWeight: 800, letterSpacing: '0.1em', color: '#0F2942' }}>{copyLabel} — GUEST ID & PROFILE ATTACHMENT</span>
          </div>

          <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '15px', backgroundColor: '#F8FAFC', fontSize: '9.5pt', marginBottom: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '10pt', color: '#0F2942', marginBottom: '8px' }}>PRIMARY GUEST DETAILS</div>
              <div><strong>Name:</strong> {selectedBooking.customerName.toUpperCase()}</div>
              <div><strong>Phone:</strong> {selectedBooking.customerPhone}</div>
              <div><strong>Address:</strong> {selectedBooking.customerAddress.toUpperCase()}</div>
            </div>
            {selectedBooking.companyName && (
              <div>
                <div style={{ fontWeight: 800, fontSize: '10pt', color: '#0F2942', marginBottom: '8px' }}>CORPORATE CREDENTIALS</div>
                <div><strong>Company:</strong> {selectedBooking.companyName.toUpperCase()}</div>
                <div><strong>GSTIN:</strong> {selectedBooking.companyGst || 'N/A'}</div>
                <div><strong>Company Contact:</strong> {selectedBooking.companyContact || 'N/A'}</div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h3 style={{ fontSize: '11pt', color: '#0F2942', fontWeight: 800, marginBottom: '15px', textTransform: 'uppercase' }}>UPLOADED AADHAAR / GOVERNMENT IDENTITY PROOF</h3>
            {selectedBooking.identityPic ? (
              <img
                src={selectedBooking.identityPic}
                alt="Aadhaar ID Card"
                style={{ maxWidth: '85%', maxHeight: '420px', objectFit: 'contain', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '5px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
              />
            ) : (
              <div style={{ border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '40px', color: '#94A3B8', fontSize: '10pt', fontStyle: 'italic' }}>
                No identity document uploaded to stay ledger.
              </div>
            )}
          </div>
        </div>

        {/* --- PAGE 3: TERMS & SIGNATURES --- */}
        <div className="print-break-before" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingTop: '15mm' }}>
          <div>
            <div style={{ borderBottom: '2px solid #0F2942', paddingBottom: '4px', marginBottom: '20px' }}>
              <span style={{ fontSize: '10pt', fontWeight: 800, letterSpacing: '0.1em', color: '#0F2942' }}>{copyLabel} — TERMS & CONDITIONS</span>
            </div>

            <div style={{ fontSize: '9pt', color: '#334155', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '10px' }}><strong>1. Jurisdiction:</strong> Any dispute, controversy or claim arising out of or relating to this stay/hall booking, including any questions regarding its existence, validity or termination, shall be subject to the exclusive jurisdiction of the courts located in Chengam, Tamil Nadu.</p>
              <p style={{ marginBottom: '10px' }}><strong>2. Security Deposit & Damage Policies:</strong> Guests are liable for any damages caused to rooms, furniture, hall amenities, decoration materials, or catering systems. The admin reserves the right to levy penalty charges dynamically during check-out based on audit. Damages must be settled immediately in full before check-out.</p>
              <p style={{ marginBottom: '10px' }}><strong>3. Billing & Taxes:</strong> GST invoices are auto-calculated inclusive of applicable SGST and CGST split rates based on type (5% for lodging, 18% for banquet events). Normal billing applies 0% GST. Round-off offsets are applied to keep totals clean.</p>
              <p style={{ marginBottom: '10px' }}><strong>4. Cancellation & Refunds:</strong> Advances paid for booking room stay or banquet space are non-refundable unless cancellation is requested at least 7 days prior to check-in/event date.</p>
              <p style={{ marginBottom: '10px' }}><strong>5. Stay Limits & Extension:</strong> Checking out past the designated check-out time without prior front-desk approval incurs additional day rates. Extension is subject to room/hall availability check.</p>
            </div>
          </div>

          {/* Signature Boxes at the bottom */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #CBD5E1' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ height: '60px', borderBottom: '1px dashed #CBD5E1', marginBottom: '8px' }}></div>
              <span style={{ fontSize: '9pt', fontWeight: 700, color: '#334155' }}>Customer / Guest Signature</span>
            </div>
            
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ height: '60px', borderBottom: '1px dashed #CBD5E1', marginBottom: '8px' }}></div>
              <span style={{ fontSize: '9pt', fontWeight: 700, color: '#0F2942' }}>Admin / Manager Signature</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleProceedCheckIn = () => {
    if (!selectedBooking) return;
  
    if (selectedBooking.serviceType === 'mahal' && !chkInEbPic) {
      alert('Mandatory Requirement: Please upload initial EB Meter picture.');
      return;
    }
  
    const updatedBooking: Booking = {
      ...selectedBooking,
      status: 'Checked-in' as const,
      actualCheckInTime: checkInInTime,
      ebMeterCheckInPic: chkInEbPic,
      ebMeterCheckInTime: chkInEbTime
    };
  
    const res = updateBooking(updatedBooking);
    if (res.success) {
      setSelectedBooking(updatedBooking);
      setIsCheckInPromptOpen(false);
      addToast('Check-in Successful', `Guest check-in finalized. Check-in time: ${checkInInTime}`, 'success');
    } else {
      alert(res.error || 'Failed to check in guest.');
    }
  };

  const handleProceedCheckout = () => {
    if (!selectedBooking) return;

    if (selectedBooking.serviceType === 'mahal' && !chkOutEbPic) {
      alert('Mandatory Requirement: Please upload checkout EB Meter picture.');
      return;
    }
    
    let finalFinancials;
    if (selectedBooking.serviceType === 'mahal') {
      const pkgPrice = selectedBooking.packageName === 'Basic' ? 100000 : (selectedBooking.packageName === 'Standard' ? 150000 : 220000);
      finalFinancials = invoiceService.calculateMahalFinancials(
        pkgPrice,
        selectedBooking.eventDetails?.decorator || false,
        selectedBooking.eventDetails?.catering || false,
        selectedBooking.guestCount,
        Number(checkoutDiscount),
        selectedBooking.financials.advancePaid,
        checkoutBillingType,
        {
          electricity: Number(chkElectricity),
          rooms: Number(chkRooms),
          generator: Number(chkGenerator),
          damages: Number(chkDamages),
          other: Number(chkOther)
        }
      );
    } else {
      const checkInDatePart = checkoutInTime.split(' ')[0];
      const checkOutDatePart = checkoutTime.split(' ')[0];
      
      const originalNights = Math.max(1, Math.ceil((new Date(selectedBooking.checkOutDate).getTime() - new Date(selectedBooking.checkInDate).getTime()) / (1000 * 60 * 60 * 24)));
      const rate = selectedBooking.financials.subtotal / ((selectedBooking.roomCount || 1) * originalNights) || 1500;
      
      finalFinancials = invoiceService.calculateRoomFinancials(
        checkInDatePart,
        checkOutDatePart,
        rate,
        selectedBooking.roomCount || 1,
        Number(checkoutDiscount),
        selectedBooking.financials.advancePaid,
        checkoutBillingType
      );
    }

    const updatedBooking: Booking = {
      ...selectedBooking,
      status: 'Completed' as const,
      actualCheckInTime: checkoutInTime,
      actualCheckOutTime: checkoutTime,
      checkInDate: checkoutInTime.split(' ')[0],
      checkOutDate: checkoutTime.split(' ')[0],
      billingType: checkoutBillingType,
      ebInitialUnits: chkEbInitialUnits,
      ebFinalUnits: chkEbFinalUnits,
      ebRate: chkEbRate,
      damageAmount: Number(chkDamages),
      mahalCharges: selectedBooking.serviceType === 'mahal' ? {
        electricity: Number(chkElectricity),
        rooms: Number(chkRooms),
        generator: Number(chkGenerator),
        damages: Number(chkDamages),
        other: Number(chkOther)
      } : undefined,
      ebMeterCheckOutPic: chkOutEbPic,
      ebMeterCheckOutTime: chkOutEbTime,
      damagePic: chkDamagePic,
      damagePicTime: chkDamagePicTime,
      damageReportText: chkDamageReport,
      financials: finalFinancials
    };

    const res = updateBooking(updatedBooking);
    if (res.success) {
      setSelectedBooking(updatedBooking);
      setIsCheckoutPromptOpen(false);
      addToast('Checkout Successful', `Guest checkout finalized. Checkout time: ${checkoutTime}`, 'success');
      
      setTimeout(() => {
        generateInvoicePdf(updatedBooking, filteredPayments);
      }, 500);
    } else {
      alert(res.error || 'Failed to check out guest due to system conflict.');
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(payAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (parsedAmount > selectedBooking.financials.balanceDue) {
      alert('Payment amount cannot exceed outstanding balance.');
      return;
    }

    addPayment({
      bookingId: selectedBooking.id,
      customerName: selectedBooking.customerName,
      amount: parsedAmount,
      method: payMethod,
      date: new Date().toISOString().split('T')[0],
      referenceNumber: payRef || 'N/A',
      recordedBy: currentUserRole === 'admin' ? 'admin@svmahal.com' : 'manager@svmahal.com',
      notes: payNotes
    });

    // Reset forms
    setPayAmount('');
    setPayRef('');
    setPayNotes('');
    setIsRecordPaymentOpen(false);

    // Refresh selected booking reference in context
    setTimeout(() => {
      // Fetch latest booking from state
      const totalPaid = filteredPayments.reduce((sum, p) => sum + p.amount, 0) + parsedAmount;
      const bal = selectedBooking.financials.total - totalPaid;
      const updatedObj: Booking = {
        ...selectedBooking,
        paymentStatus: totalPaid >= selectedBooking.financials.total ? 'Paid' : 'Partially Paid',
        financials: {
          ...selectedBooking.financials,
          advancePaid: totalPaid,
          balanceDue: Math.max(0, bal)
        }
      };
      setSelectedBooking(updatedObj);
    }, 100);
  };

  const handleSaveChanges = () => {
    let newFinancials;
    if (selectedBooking.serviceType === 'mahal') {
      const pkgPrice = selectedBooking.packageName === 'Basic' ? 100000 : (selectedBooking.packageName === 'Standard' ? 150000 : 220000);
      newFinancials = invoiceService.calculateMahalFinancials(
        pkgPrice,
        selectedBooking.eventDetails?.decorator || false,
        selectedBooking.eventDetails?.catering || false,
        Number(editGuests),
        Number(editDiscount),
        selectedBooking.financials.advancePaid,
        editBillingType,
        {
          electricity: Number(editElectricity),
          rooms: Number(editMahalRooms),
          generator: Number(editGenerator),
          damages: Number(editDamages),
          other: Number(editOther)
        }
      );
    } else {
      // Room financials
      const checkIn = new Date(selectedBooking.checkInDate);
      const checkOut = new Date(selectedBooking.checkOutDate);
      const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
      const rate = selectedBooking.financials.subtotal / ((selectedBooking.roomCount || 1) * nights);
      
      newFinancials = invoiceService.calculateRoomFinancials(
        selectedBooking.checkInDate,
        selectedBooking.checkOutDate,
        rate,
        selectedBooking.roomCount || 1,
        Number(editDiscount),
        selectedBooking.financials.advancePaid,
        editBillingType
      );
    }

    const updated: Booking = {
      ...selectedBooking,
      customerName: editCustName,
      customerPhone: editCustPhone,
      customerEmail: editCustEmail,
      customerAddress: editCustAddress,
      guestCount: Number(editGuests),
      status: editStatus,
      billingType: editBillingType,
      mahalCharges: {
        electricity: Number(editElectricity),
        rooms: Number(editMahalRooms),
        generator: Number(editGenerator),
        damages: Number(editDamages),
        other: Number(editOther)
      },
      financials: newFinancials
    };

    const res = updateBooking(updated);
    if (res.success) {
      setSelectedBooking(updated);
      setIsEditMode(false);
    } else {
      alert(res.error || 'Could not update booking due to date/room conflicts.');
    }
  };

  const handleBrowserPrint = () => {
    setIsPrintSelectorOpen(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'all 0.3s'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-slide-in"
        style={{
          width: '100%',
          maxWidth: '640px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-10px 0 25px -5px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#DFB943', fontWeight: 700 }}>
              {selectedBooking.serviceType === 'room' ? 'Room Booking' : 'Mahal Booking'} Details
            </span>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
              {selectedBooking.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
          {isEditMode ? (
            /* EDIT FORM VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', fontSize: '1rem', color: '#0F172A', fontWeight: 600 }}>
                Edit Booking Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>CUSTOMER NAME</label>
                  <input
                    type="text"
                    value={editCustName}
                    onChange={(e) => setEditCustName(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>PHONE NUMBER</label>
                  <input
                    type="text"
                    value={editCustPhone}
                    onChange={(e) => setEditCustPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={editCustEmail}
                    onChange={(e) => setEditCustEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>GUEST COUNT</label>
                  <input
                    type="number"
                    value={editGuests}
                    onChange={(e) => setEditGuests(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>ADDRESS</label>
                <textarea
                  value={editCustAddress}
                  onChange={(e) => setEditCustAddress(e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>DISCOUNT GIVEN (₹)</label>
                  <input
                    type="number"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>BOOKING STATUS</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Booking['status'])}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Inquiry">Inquiry</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked-in">Checked-in</option>
                    <option value="Checked-out">Checked-out</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No-show">No-show</option>
                  </select>
                </div>
              </div>

              {/* Additional Mahal charges (if Mahal) */}
              {selectedBooking.serviceType === 'mahal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: '1px dashed #CBD5E1', padding: '16px', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                  <span style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mahal Additional Usage Charges</span>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>Electricity (₹)</label>
                      <input
                        type="number"
                        value={editElectricity}
                        onChange={(e) => setEditElectricity(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>Mahal Rooms Stay (₹)</label>
                      <input
                        type="number"
                        value={editMahalRooms}
                        onChange={(e) => setEditMahalRooms(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>Generator (₹)</label>
                      <input
                        type="number"
                        value={editGenerator}
                        onChange={(e) => setEditGenerator(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>Damages (₹)</label>
                      <input
                        type="number"
                        value={editDamages}
                        onChange={(e) => setEditDamages(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>Other Charges (₹)</label>
                      <input
                        type="number"
                        value={editOther}
                        onChange={(e) => setEditOther(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Type Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>BILLING OPTIONS</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="billingType"
                      value="GST"
                      checked={editBillingType === 'GST'}
                      onChange={() => setEditBillingType('GST')}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>GST Bill (Tax Included)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="billingType"
                      value="Normal"
                      checked={editBillingType === 'Normal'}
                      onChange={() => setEditBillingType('Normal')}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Normal Bill (0% GST)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  onClick={handleSaveChanges}
                  style={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: '#C9A227',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Save size={16} /> Save Changes
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* DETAILS DISPLAY VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Status banner */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>STATUS: </span>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as Booking['status'];
                      const updated = { ...selectedBooking, status: newStatus };
                      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
                      if (newStatus === 'Checked-in' && !updated.actualCheckInTime) {
                        updated.actualCheckInTime = nowStr;
                      } else if ((newStatus === 'Checked-out' || newStatus === 'Completed') && !updated.actualCheckOutTime) {
                        updated.actualCheckOutTime = nowStr;
                      }
                      const res = updateBooking(updated);
                      if (res.success) {
                        setSelectedBooking(updated);
                        addToast('Status Updated', `Booking status set to ${newStatus}`, 'success');
                      } else {
                        alert(res.error || 'Failed to update status.');
                      }
                    }}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked-in">Checked-in</option>
                    <option value="Checked-out">Checked-out</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Inquiry">Inquiry</option>
                    <option value="No-show">No-show</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>PAYMENT: </span>
                  <select
                    value={selectedBooking.paymentStatus}
                    onChange={(e) => {
                      const newPayStatus = e.target.value as Booking['paymentStatus'];
                      const updated = { ...selectedBooking, paymentStatus: newPayStatus };
                      if (newPayStatus === 'Paid') {
                        updated.financials.advancePaid = updated.financials.total;
                        updated.financials.balanceDue = 0;
                      } else if (newPayStatus === 'Unpaid') {
                        updated.financials.advancePaid = 0;
                        updated.financials.balanceDue = updated.financials.total;
                      }
                      const res = updateBooking(updated);
                      if (res.success) {
                        setSelectedBooking(updated);
                        addToast('Payment Status Updated', `Payment status set to ${newPayStatus}`, 'success');
                      } else {
                        alert(res.error || 'Failed to update payment status.');
                      }
                    }}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Quick Status Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {selectedBooking.status === 'Confirmed' && (
                  <button
                    onClick={() => {
                      const now = new Date();
                      const nowStr = now.toISOString().replace('T', ' ').substring(0, 16);
                      if (selectedBooking.serviceType === 'room') {
                        if (window.confirm(`Check in guest now? Actual check-in time will be captured: ${nowStr}`)) {
                          const updated = {
                            ...selectedBooking,
                            status: 'Checked-in' as const,
                            actualCheckInTime: nowStr
                          };
                          const res = updateBooking(updated);
                          if (res.success) {
                            setSelectedBooking(updated);
                            addToast('Guest Checked-in', `Check-in time captured: ${nowStr}`, 'success');
                          } else {
                            alert(res.error || 'Check-in failed.');
                          }
                        }
                      } else {
                        setCheckInInTime(nowStr);
                        setChkInEbTime(nowStr);
                        setIsCheckInPromptOpen(true);
                      }
                    }}
                    style={{
                      flexGrow: 1,
                      padding: '12px',
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    🚀 Check-in Guest (Auto Capture)
                  </button>
                )}

                {selectedBooking.status === 'Checked-in' && (
                  <button
                    onClick={() => {
                      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
                      setCheckoutTime(nowStr);
                      setCheckoutInTime(selectedBooking.actualCheckInTime || selectedBooking.checkInDate + ' 12:00');
                      setCheckoutDiscount(selectedBooking.financials.discount);
                      setCheckoutBillingType(selectedBooking.billingType || 'GST');
                      setChkEbInitialUnits(selectedBooking.ebInitialUnits || 0);
                      
                      setChkRooms(selectedBooking.mahalCharges?.rooms || 0);
                      setChkGenerator(selectedBooking.mahalCharges?.generator || 0);
                      setChkDamages(selectedBooking.mahalCharges?.damages || selectedBooking.damageAmount || 0);
                      setChkOther(selectedBooking.mahalCharges?.other || 0);
                      
                      setChkOutEbPic(selectedBooking.ebMeterCheckOutPic || '');
                      setChkDamagePic(selectedBooking.damagePic || '');
                      setChkDamageReport(selectedBooking.damageReportText || '');
                      setIsCheckoutPromptOpen(true);
                    }}
                    style={{
                      flexGrow: 1,
                      padding: '12px',
                      backgroundColor: '#6366F1',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)'
                    }}
                  >
                    🔑 Check-out Guest & Bill (Capture Time)
                  </button>
                )}
              </div>

              {/* Customer Details */}
              <div>
                <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', fontSize: '0.95rem', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <User size={16} color="#C9A227" /> Customer Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Name: </span>
                    <span style={{ color: '#0F172A', fontWeight: 600 }}>{selectedBooking.customerName}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', fontWeight: 500 }}><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} /> Phone: </span>
                    <span style={{ color: '#0F172A', fontWeight: 600 }}>{selectedBooking.customerPhone}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', fontWeight: 500 }}><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} /> Email: </span>
                    <span style={{ color: '#0F172A' }}>{selectedBooking.customerEmail}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>ID Doc: </span>
                    <span style={{ color: '#0F172A' }}>{selectedBooking.idType} ({selectedBooking.idNumber})</span>
                  </div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> Address: </span>
                  <span style={{ color: '#334155' }}>{selectedBooking.customerAddress}</span>
                </div>
              </div>

              {/* Service Booking Details */}
              <div>
                <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', fontSize: '0.95rem', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Calendar size={16} color="#C9A227" /> Booking Schedule & Setup
                </h3>
                
                {selectedBooking.serviceType === 'room' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Check-in: </span>
                      <span style={{ color: '#0F172A', fontWeight: 600 }}>{selectedBooking.checkInDate}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Check-out: </span>
                      <span style={{ color: '#0F172A', fontWeight: 600 }}>{selectedBooking.checkOutDate}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Room Count: </span>
                      <span style={{ color: '#0F172A', fontWeight: 600 }}>{selectedBooking.roomCount} room(s)</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Guests: </span>
                      <span style={{ color: '#0F172A' }}>{selectedBooking.guestCount} Guest(s)</span>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Assigned Rooms: </span>
                      <span style={{ color: '#0F172A', fontWeight: 600 }}>
                        {selectedBooking.roomIds?.map(id => rooms.find(r => r.id === id)?.number).join(', ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Event Date: </span>
                      <span style={{ color: '#0F172A', fontWeight: 600 }}>{selectedBooking.checkInDate}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Event Type: </span>
                      <span style={{ color: '#0F172A', fontWeight: 600 }}>{selectedBooking.eventDetails?.eventType}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Package: </span>
                      <span style={{ color: '#0F172A', fontWeight: 600 }}>{selectedBooking.packageName}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Guests: </span>
                      <span style={{ color: '#0F172A' }}>{selectedBooking.guestCount} Guest(s)</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>In-house Decor: </span>
                      <span style={{ color: '#0F172A' }}>{selectedBooking.eventDetails?.decorator ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>In-house Catering: </span>
                      <span style={{ color: '#0F172A' }}>{selectedBooking.eventDetails?.catering ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                )}
                
                {selectedBooking.specialRequirements && (
                  <div style={{ marginTop: '10px', fontSize: '0.9rem', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', borderLeft: '3px solid #C9A227' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '2px' }}>SPECIAL REQUIREMENTS</div>
                    <div style={{ color: '#334155' }}>{selectedBooking.specialRequirements}</div>
                  </div>
                )}
              </div>

              {/* Timestamped Media Verification Gallery */}
              {(selectedBooking.identityPic || selectedBooking.membersPic || selectedBooking.ebInitialPic || selectedBooking.ebMeterCheckOutPic || selectedBooking.damagePic) && (
                <div>
                  <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', fontSize: '0.95rem', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Camera size={16} color="#C9A227" /> Timestamped Media Verification
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                    {selectedBooking.identityPic && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>Primary Identity</span>
                        <img src={selectedBooking.identityPic} alt="Identity" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                      </div>
                    )}
                    {selectedBooking.membersPic && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>Group / Members</span>
                        <img src={selectedBooking.membersPic} alt="Members" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                      </div>
                    )}
                    {selectedBooking.ebInitialPic && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>Initial EB ({selectedBooking.ebInitialUnits} U)</span>
                        <img src={selectedBooking.ebInitialPic} alt="Initial EB" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                      </div>
                    )}
                    {selectedBooking.ebMeterCheckOutPic && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>Final EB ({selectedBooking.ebFinalUnits} U)</span>
                        <img src={selectedBooking.ebMeterCheckOutPic} alt="Final EB" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                      </div>
                    )}
                    {selectedBooking.damagePic && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#DC2626' }}>Damage Report Pic</span>
                        <img src={selectedBooking.damagePic} alt="Damage" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #FCA5A5' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div>
                <h3 style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', fontSize: '0.95rem', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <DollarSign size={16} color="#C9A227" /> Financial Summary & Invoice
                </h3>
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Billing Mode</span>
                    <span style={{ fontWeight: 700, color: selectedBooking.billingType === 'Normal' ? '#475569' : '#C9A227' }}>
                      {selectedBooking.billingType === 'Normal' ? 'Normal Bill (No Tax)' : 'GST Invoice'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Subtotal</span>
                    <span style={{ color: '#0F172A', fontWeight: 500 }}>₹{selectedBooking.financials.subtotal.toLocaleString()}</span>
                  </div>
                  
                  {/* Detailed additional charges for Mahal */}
                  {selectedBooking.serviceType === 'mahal' && selectedBooking.mahalCharges && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px', borderLeft: '2px solid #CBD5E1', backgroundColor: '#FFFFFF', borderRadius: '4px', margin: '4px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Hall Base Rental:</span>
                        <span>₹{(selectedBooking.financials.subtotal - (
                          (selectedBooking.mahalCharges.electricity || 0) +
                          (selectedBooking.mahalCharges.rooms || 0) +
                          (selectedBooking.mahalCharges.generator || 0) +
                          (selectedBooking.mahalCharges.damages || 0) +
                          (selectedBooking.mahalCharges.other || 0)
                        )).toLocaleString()}</span>
                      </div>
                      {(selectedBooking.mahalCharges.electricity || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Electricity Bill:</span>
                          <span>+ ₹{(selectedBooking.mahalCharges.electricity || 0).toLocaleString()}</span>
                        </div>
                      )}
                      {(selectedBooking.mahalCharges.rooms || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Additional Rooms:</span>
                          <span>+ ₹{(selectedBooking.mahalCharges.rooms || 0).toLocaleString()}</span>
                        </div>
                      )}
                      {(selectedBooking.mahalCharges.generator || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Generator Fuel/Usage:</span>
                          <span>+ ₹{(selectedBooking.mahalCharges.generator || 0).toLocaleString()}</span>
                        </div>
                      )}
                      {(selectedBooking.mahalCharges.damages || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626' }}>
                          <span>Damages / Penalty:</span>
                          <span>+ ₹{(selectedBooking.mahalCharges.damages || 0).toLocaleString()}</span>
                        </div>
                      )}
                      {(selectedBooking.mahalCharges.other || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Other Charges:</span>
                          <span>+ ₹{(selectedBooking.mahalCharges.other || 0).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Discount</span>
                    <span style={{ color: '#EF4444', fontWeight: 500 }}>- ₹{selectedBooking.financials.discount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>GST ({selectedBooking.billingType === 'Normal' ? '0%' : (selectedBooking.serviceType === 'room' ? '12%' : '18%')})</span>
                    <span style={{ color: '#0F172A', fontWeight: 500 }}>₹{selectedBooking.financials.tax.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                    <span style={{ color: '#0F172A' }}>Grand Total</span>
                    <span style={{ color: '#0F172A' }}>₹{selectedBooking.financials.total.toLocaleString()}</span>
                  </div>
                  {selectedBooking.financials.razorpayPaymentId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '4px', padding: '6px', backgroundColor: '#F0FDF4', borderRadius: '4px', border: '1px dashed #22C55E' }}>
                      <span style={{ color: '#16A34A', fontWeight: 600 }}>Razorpay UPI:</span>
                      <span style={{ color: '#16A34A', fontFamily: 'monospace' }}>{selectedBooking.financials.razorpayPaymentId}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ color: '#16A34A', fontWeight: 600 }}>Total Paid</span>
                    <span style={{ color: '#16A34A', fontWeight: 700 }}>₹{selectedBooking.financials.advancePaid.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', padding: '8px 10px', backgroundColor: '#FFFBEB', borderRadius: '6px', marginTop: '4px' }}>
                    <span style={{ color: '#B45309', fontWeight: 700 }}>Outstanding Balance</span>
                    <span style={{ color: '#B45309', fontWeight: 800 }}>₹{selectedBooking.financials.balanceDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payments History log */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={16} color="#C9A227" /> Transaction Logs
                  </h3>
                  {selectedBooking.financials.balanceDue > 0 && (
                    <button
                      onClick={() => setIsRecordPaymentOpen(!isRecordPaymentOpen)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#C9A227',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#FFFFFF',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {isRecordPaymentOpen ? 'Close Panel' : 'Record Payment'}
                    </button>
                  )}
                </div>

                {isRecordPaymentOpen && (
                  <form onSubmit={handleRecordPayment} style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '16px', marginBottom: '16px' }} className="animate-fade-in">
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#B45309', marginBottom: '12px' }}>RECORD NEW PAYMENT</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>AMOUNT (₹)</label>
                        <input
                          type="number"
                          required
                          max={selectedBooking.financials.balanceDue}
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          placeholder={`Max ${selectedBooking.financials.balanceDue}`}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>METHOD</label>
                        <select
                          value={payMethod}
                          onChange={(e) => setPayMethod(e.target.value as any)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFFFFF' }}
                        >
                          <option value="UPI">UPI</option>
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>REFERENCE NUMBER / TXN ID</label>
                      <input
                        type="text"
                        value={payRef}
                        onChange={(e) => setPayRef(e.target.value)}
                        placeholder="UPI Transaction ID or Cheque No."
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>NOTES</label>
                      <input
                        type="text"
                        value={payNotes}
                        onChange={(e) => setPayNotes(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Submit Transaction
                    </button>
                  </form>
                )}

                {filteredPayments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#94A3B8', fontSize: '0.85rem', border: '1px dashed #CBD5E1', borderRadius: '6px' }}>
                    No payment logs recorded yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredPayments.map(p => (
                      <div
                        key={p.id}
                        style={{
                          padding: '10px 12px',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#334155' }}>
                            ₹{p.amount.toLocaleString()} ({p.method})
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            Ref: {p.referenceNumber} | Date: {p.date}
                          </div>
                          {p.notes && <div style={{ fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic' }}>Note: {p.notes}</div>}
                        </div>
                        {currentUserRole === 'admin' && (
                          <button
                            onClick={() => deletePayment(p.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Administrative Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '20px', marginTop: '10px' }}>
                <button
                  onClick={enterEditMode}
                  style={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Edit size={14} /> Edit Info
                </button>
                <button
                  onClick={() => generateInvoicePdf(selectedBooking, filteredPayments)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  onClick={handleBrowserPrint}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={14} /> Print
                </button>

                {selectedBooking.status !== 'Cancelled' && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this booking? This will release availability.')) {
                        cancelBooking(selectedBooking.id);
                        onClose();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 14px',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Ban size={14} /> Cancel Booking
                  </button>
                )}

                {currentUserRole === 'admin' && (
                  <button
                    onClick={() => {
                      if (window.confirm('WARNING: Permanently delete this booking and all associated payments? This action is irreversible.')) {
                        deleteBooking(selectedBooking.id);
                        onClose();
                      }
                    }}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
      
      {/* Hidden layout ONLY visible to print stylesheet */}
      <div className="print-only" style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '100%', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2>SV MAHAL & SV RESIDENCY</h2>
          <p>No.859/B, SV Thirumana mahal opposite, Bangalore Main Road, Chengam | Ph: 9500821550, 9043780215 | GSTIN: 33GTSPD9038L1Z1</p>
        </div>
        
        <table style={{ width: '100%', marginBottom: '20px' }}>
          <tbody>
            <tr>
              <td>
                <strong>Billed To:</strong><br />
                {selectedBooking.customerName}<br />
                {selectedBooking.customerPhone}<br />
                {selectedBooking.customerAddress}
              </td>
              <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                <strong>Invoice:</strong> {invoiceNumber}<br />
                <strong>Booking ID:</strong> {selectedBooking.id}<br />
                <strong>Date:</strong> {new Date(selectedBooking.createdAt).toLocaleDateString()}
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>HSN/SAC</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>GST Rate</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px' }}>
                {selectedBooking.serviceType === 'room' ? (
                  <>
                    <strong>{(selectedBooking.roomIds && selectedBooking.roomIds.length > 0) ? selectedBooking.roomIds.map(id => `ROOM ${id.replace('room-', '').toUpperCase()}`).join(', ') : 'ROOM STAY'}</strong>
                    <br />
                    Stay: {selectedBooking.actualCheckInTime || selectedBooking.checkInDate} to {selectedBooking.actualCheckOutTime || selectedBooking.checkOutDate}
                  </>
                ) : (
                  <>
                    <strong>SV MAHAL BANQUET HALL ({selectedBooking.packageName || 'STANDARD'} PACKAGE)</strong>
                    <br />
                    Event Date: {selectedBooking.checkInDate}
                  </>
                )}
              </td>
              <td style={{ textAlign: 'center', padding: '8px' }}>
                {selectedBooking.serviceType === 'room' ? '996311' : '996312'}
              </td>
              <td style={{ textAlign: 'center', padding: '8px' }}>
                {selectedBooking.billingType === 'Normal' ? '0%' : (selectedBooking.serviceType === 'room' ? '5%' : '18%')}
              </td>
              <td style={{ padding: '8px', textAlign: 'right' }}>
                ₹{(selectedBooking.financials.baseAmount ?? selectedBooking.financials.subtotal).toLocaleString()}
              </td>
            </tr>
            <tr style={{ borderTop: '1px solid #000' }}>
              <td colSpan={2}></td>
              <td style={{ padding: '8px', textAlign: 'right' }}><strong>Subtotal:</strong></td>
              <td style={{ padding: '8px', textAlign: 'right' }}>₹{selectedBooking.financials.subtotal.toLocaleString()}</td>
            </tr>
            {selectedBooking.financials.discount > 0 && (
              <tr>
                <td colSpan={2}></td>
                <td style={{ padding: '8px', textAlign: 'right' }}><strong>Discount:</strong></td>
                <td style={{ padding: '8px', textAlign: 'right' }}>- ₹{selectedBooking.financials.discount.toLocaleString()}</td>
              </tr>
            )}
            {selectedBooking.billingType === 'GST' ? (
              <>
                <tr>
                  <td colSpan={2}></td>
                  <td style={{ padding: '8px', textAlign: 'right' }}><strong>CGST ({selectedBooking.serviceType === 'room' ? '2.5%' : '9%'}):</strong></td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>₹{(selectedBooking.financials.cgst ?? 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={2}></td>
                  <td style={{ padding: '8px', textAlign: 'right' }}><strong>SGST ({selectedBooking.serviceType === 'room' ? '2.5%' : '9%'}):</strong></td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>₹{(selectedBooking.financials.sgst ?? 0).toLocaleString()}</td>
                </tr>
                {selectedBooking.financials.roundOff !== 0 && (
                  <tr>
                    <td colSpan={2}></td>
                    <td style={{ padding: '8px', textAlign: 'right' }}><strong>Round Off:</strong></td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{(selectedBooking.financials.roundOff ?? 0).toLocaleString()}</td>
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td colSpan={2}></td>
                <td style={{ padding: '8px', textAlign: 'right' }}><strong>GST (0%):</strong></td>
                <td style={{ padding: '8px', textAlign: 'right' }}>₹0</td>
              </tr>
            )}
            <tr style={{ backgroundColor: '#f0f0f0', borderTop: '1px solid #000' }}>
              <td colSpan={2}></td>
              <td style={{ padding: '8px', textAlign: 'right' }}><strong>Grand Total:</strong></td>
              <td style={{ padding: '8px', textAlign: 'right', fontSize: '1.2rem' }}><strong>₹{selectedBooking.financials.total.toLocaleString()}</strong></td>
            </tr>
            {selectedBooking.financials.razorpayPaymentId && (
              <tr>
                <td colSpan={2}></td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#16A34A' }}><strong>Razorpay UPI Ref:</strong></td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#16A34A', fontFamily: 'monospace' }}>{selectedBooking.financials.razorpayPaymentId}</td>
              </tr>
            )}
            <tr>
              <td colSpan={2}></td>
              <td style={{ padding: '8px', textAlign: 'right' }}><strong>Paid to Date:</strong></td>
              <td style={{ padding: '8px', textAlign: 'right', color: 'green' }}><strong>₹{selectedBooking.financials.advancePaid.toLocaleString()}</strong></td>
            </tr>
            <tr style={{ borderTop: '2px double #000' }}>
              <td colSpan={2}></td>
              <td style={{ padding: '8px', textAlign: 'right' }}><strong>Balance Due:</strong></td>
              <td style={{ padding: '8px', textAlign: 'right', color: 'red' }}><strong>₹{selectedBooking.financials.balanceDue.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '0.9rem', fontStyle: 'italic' }}>
          Thank you for choosing SV.MAHAL & SV.RESIDENCY.
        </div>
      </div>

      {/* Checkout finalization prompt */}
      {isCheckoutPromptOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="animate-scale-in"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              color: '#0F172A'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>
                Guest Checkout & Invoice Desk
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                Auto-captured checkout timestamp. Customize particulars before checking out.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '4px' }}>
              
              {/* Check-in editable */}
              <div>
                <label style={{ display: 'block', fontSize: '0.725rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>ACTUAL CHECK-IN TIME</label>
                <input
                  type="text"
                  value={checkoutInTime}
                  onChange={(e) => setCheckoutInTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              {/* Check-out editable */}
              <div>
                <label style={{ display: 'block', fontSize: '0.725rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>ACTUAL CHECK-OUT TIME</label>
                <input
                  type="text"
                  value={checkoutTime}
                  onChange={(e) => setCheckoutTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              {/* Billing type radio */}
              <div>
                <label style={{ display: 'block', fontSize: '0.725rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>BILLING METHOD</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="chkBillType"
                      value="GST"
                      checked={checkoutBillingType === 'GST'}
                      onChange={() => setCheckoutBillingType('GST')}
                    />
                    <span>GST Bill (Taxed)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="chkBillType"
                      value="Normal"
                      checked={checkoutBillingType === 'Normal'}
                      onChange={() => setCheckoutBillingType('Normal')}
                    />
                    <span>Normal Bill (0% Tax)</span>
                  </label>
                </div>
              </div>

              {/* Discount */}
              <div>
                <label style={{ display: 'block', fontSize: '0.725rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>DISCOUNT GIVEN (₹)</label>
                <input
                  type="number"
                  value={checkoutDiscount}
                  onChange={(e) => setCheckoutDiscount(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              {/* Mahal Charges if applicable */}
              {selectedBooking.serviceType === 'mahal' && (
                <div style={{ border: '1px dashed #CBD5E1', padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#0F172A', fontWeight: 700 }}>MAHAL ADDITIONAL PARTICULARS</span>
                  
                  <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#0F172A', fontWeight: 700 }}>EB METER CALCULATION</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>Initial Units</label>
                        <input type="number" value={chkEbInitialUnits} onChange={(e) => setChkEbInitialUnits(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>Final Units</label>
                        <input type="number" value={chkEbFinalUnits} onChange={(e) => setChkEbFinalUnits(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>Rate/Unit (₹)</label>
                        <input type="number" value={chkEbRate} onChange={(e) => setChkEbRate(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 800 }}>
                      Calculated Electricity Charge: ₹{chkElectricity}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>Mahal Rooms (₹)</label>
                      <input type="number" value={chkRooms} onChange={(e) => setChkRooms(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>Gen (₹)</label>
                      <input type="number" value={chkGenerator} onChange={(e) => setChkGenerator(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>Damage (₹)</label>
                      <input type="number" value={chkDamages} onChange={(e) => setChkDamages(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', color: '#DC2626' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>Other (₹)</label>
                      <input type="number" value={chkOther} onChange={(e) => setChkOther(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }} />
                    </div>
                  </div>

                  <div style={{ marginTop: '8px', borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.725rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                      FINAL EB METER PICTURE (MANDATORY FOR MAHAL)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleFileChange(e, setChkOutEbPic, setChkOutEbTime)}
                      style={{ fontSize: '0.8rem', width: '100%', marginBottom: '8px' }}
                    />
                    {chkOutEbPic && (
                      <img src={chkOutEbPic} alt="EB Final" style={{ width: '80px', height: '60px', objectFit: 'contain', border: '1px solid #CBD5E1', borderRadius: '4px', display: 'block', marginBottom: '8px' }} />
                    )}
                  </div>

                  <div style={{ marginTop: '8px', borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.725rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                      OPTIONAL DAMAGE PICTURE & REPORT
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleFileChange(e, setChkDamagePic, setChkDamagePicTime)}
                      style={{ fontSize: '0.8rem', width: '100%', marginBottom: '8px' }}
                    />
                    {chkDamagePic && (
                      <img src={chkDamagePic} alt="Damage Picture" style={{ width: '80px', height: '60px', objectFit: 'contain', border: '1px solid #CBD5E1', borderRadius: '4px', display: 'block', marginBottom: '8px' }} />
                    )}
                    <textarea
                      placeholder="Describe damage details if any..."
                      value={chkDamageReport}
                      onChange={(e) => setChkDamageReport(e.target.value)}
                      rows={2}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none', resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={handleProceedCheckout}
                style={{ flexGrow: 1, padding: '12px', backgroundColor: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Proceed & Print Bill
              </button>
              <button
                onClick={() => setIsCheckoutPromptOpen(false)}
                style={{ padding: '12px 20px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
