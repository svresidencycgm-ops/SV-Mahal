import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldAlert } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.464L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.451 5.375 0 9.752-4.37 9.755-9.743.002-2.602-1.005-5.048-2.839-6.883-1.832-1.832-4.274-2.84-6.877-2.841-5.38 0-9.76 4.374-9.764 9.75-.002 1.9.492 3.754 1.433 5.365L1.47 21.847l5.177-1.893zm11.758-5.326c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
  </svg>
);

export const OnlineRequestsCrm: React.FC = () => {
  const { bookings, updateBooking, addPayment, addToast } = useApp();

  // Selected booking for approval panel
  const [selectedReq, setSelectedReq] = useState<any>(null);

  // Approval payment update fields
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [receivedAdvance, setReceivedAdvance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('UPI');
  const [txnRef, setTxnRef] = useState('');

  // Filter only online pending requests (Inquiry or Pending)
  const pendingRequests = bookings.filter(
    b => ['Inquiry', 'Pending'].includes(b.status) && b.idNumber === 'VERIFIED-OTP'
  );

  const openApprovalDialog = (req: any) => {
    setSelectedReq(req);
    setReceivedAdvance(req.financials.advancePaid || 30000);
    // Attempt to extract reference from special requirements
    const match = req.specialRequirements?.match(/\[Payment Ref: ([^\]]+)\]/);
    setTxnRef(match ? match[1] : '');
    setShowApprovalDialog(true);
  };

  const handleApprove = () => {
    if (!selectedReq) return;

    // Update booking status to Confirmed
    const updated: any = {
      ...selectedReq,
      status: 'Confirmed',
      financials: {
        ...selectedReq.financials,
        advancePaid: Number(receivedAdvance),
        balanceDue: Math.max(0, selectedReq.financials.total - Number(receivedAdvance))
      },
      paymentStatus: Number(receivedAdvance) >= selectedReq.financials.total ? 'Paid' : 'Partially Paid',
      specialRequirements: selectedReq.specialRequirements + `\n[Approved Onsite] Method: ${paymentMethod}. Txn Ref: ${txnRef || 'N/A'}`
    };

    const res = updateBooking(updated);
    if (res.success) {
      // Record payment transaction
      addPayment({
        bookingId: selectedReq.id,
        customerName: selectedReq.customerName,
        amount: Number(receivedAdvance),
        method: paymentMethod,
        referenceNumber: txnRef || `REF-APP-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        recordedBy: 'Staff',
        notes: 'Online booking deposit approval'
      });

      addToast('Request Approved', `Booking ${selectedReq.id} approved successfully!`, 'success');
      setShowApprovalDialog(false);
      setSelectedReq(null);
    } else {
      alert(res.error || 'Failed to approve booking request.');
    }
  };

  const handleReject = (req: any) => {
    if (confirm(`Are you sure you want to reject and cancel booking request ${req.id}?`)) {
      const updated: any = {
        ...req,
        status: 'Cancelled',
        specialRequirements: req.specialRequirements + '\n[Rejected by Front-Desk Manager]'
      };
      const res = updateBooking(updated);
      if (res.success) {
        addToast('Request Cancelled', `Booking ${req.id} has been rejected.`, 'info');
      }
    }
  };

  // WhatsApp share link generator
  const sendWhatsAppConfirmation = (req: any) => {
    const cleanPhone = req.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    
    const balance = Math.max(0, req.financials.total - req.financials.advancePaid);

    const message = `*SV MAHAL & SV RESIDENCY*
---------------------------------------
Hello *${req.customerName}*,

Your booking request for *${req.serviceType === 'mahal' ? 'SV Mahal Banquet Hall' : 'SV Residency Lodging Stay'}* on *${req.checkInDate}* has been approved and confirmed.

*Summary Details:*
- Service: ${req.serviceType === 'mahal' ? 'SV Mahal Hall' : `${req.packageName || 'Rooms Stay'}`}
- Total Cost: ₹${req.financials.total.toLocaleString()}
- Deposit Paid: ₹${req.financials.advancePaid.toLocaleString()}
- Outstanding Balance: ₹${balance.toLocaleString()}
- Ref Code: ${req.id}

Thank you for choosing us!
SV.MAHAL & SV.RESIDENCY
Chengam, Tamil Nadu.
Phone / WhatsApp: 95008 21550 / 90437 80215`;

    const link = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      
      {/* Title Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#0F2942', fontWeight: 800, margin: 0 }}>Online Booking Approvals</h2>
        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
          Approve customer inquiries, verify advance payments, and dispatch WhatsApp confirmations.
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <ShieldAlert size={48} color="#64748B" style={{ marginBottom: '12px', margin: '0 auto 12px auto' }} />
          <h4 style={{ margin: 0, color: '#0F2942', fontWeight: 800 }}>No Pending Requests</h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
            All online booking submissions are currently processed and up-to-date.
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#0F2942', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>BOOKING ID</th>
                <th style={{ padding: '12px 16px' }}>CUSTOMER</th>
                <th style={{ padding: '12px 16px' }}>SERVICE</th>
                <th style={{ padding: '12px 16px' }}>EVENT DATE</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>TOTAL</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>DEPOSIT</th>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'var(--transition)' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0284C7' }}>{req.id}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0F2942' }}>{req.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{req.customerPhone}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: req.serviceType === 'mahal' ? '#FEF3C7' : '#E0F2FE', color: req.serviceType === 'mahal' ? '#B45309' : '#0369A1' }}>
                      {req.serviceType === 'mahal' ? 'SV Mahal' : 'Stay Rooms'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{req.checkInDate}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>₹{req.financials.total.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16A34A', fontWeight: 700 }}>₹{req.financials.advancePaid.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#FFFBEB', color: '#D97706' }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => openApprovalDialog(req)}
                        title="Approve Booking"
                        style={{ padding: '6px 12px', backgroundColor: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req)}
                        title="Reject Request"
                        style={{ padding: '6px 12px', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => sendWhatsAppConfirmation(req)}
                        title="Share via WhatsApp"
                        style={{ padding: '6px 12px', backgroundColor: '#25D366', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <WhatsAppIcon /> WhatsApp
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve Dialog Modal */}
      {showApprovalDialog && selectedReq && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 41, 66, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          className="animate-fade-in"
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #D2E3F8',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative'
            }}
            className="animate-scale-bounce"
          >
            <button
              onClick={() => setShowApprovalDialog(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#0F2942', fontWeight: 800 }}>
              Verify & Approve Booking
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 16px 0' }}>
              Confirm advance payment ledger details for booking ID: <strong>{selectedReq.id}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                  CONFIRMED ADVANCE PAYMENT (INR)
                </label>
                <input
                  type="number"
                  value={receivedAdvance}
                  onChange={(e) => setReceivedAdvance(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                  PAYMENT CHANNEL
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px', outline: 'none', backgroundColor: '#FFFFFF' }}
                >
                  <option value="UPI">UPI Transfer</option>
                  <option value="Cash">Cash Counter</option>
                  <option value="Card">Credit Card</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                  TRANSACTION REFERENCE NUMBER
                </label>
                <input
                  type="text"
                  placeholder="Txn ID ref code"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowApprovalDialog(false)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: '6px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
              >
                Go Back
              </button>
              <button
                onClick={handleApprove}
                style={{ flex: 1, padding: '10px', backgroundColor: '#16A34A', border: 'none', borderRadius: '6px', fontWeight: 700, color: '#FFFFFF', cursor: 'pointer' }}
              >
                Approve Request
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
