import React, { useState } from 'react';
import { QrCode, CheckCircle, X, ShieldCheck } from 'lucide-react';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  bookingId: string;
  customerName: string;
  onPaymentSuccess: (referenceNumber: string) => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  bookingId,
  customerName,
  onPaymentSuccess
}) => {
  const [upiRef, setUpiRef] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Standard UPI URI format
  const upiId = 'svresidency@ybl';
  const merchantName = 'SV Residency and Mahal';
  const transactionNote = `Booking Advance for ${bookingId}`;
  
  // Format deep link
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
  
  // Generate QR Code URL via free qrserver API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiDeepLink)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (upiRef.trim().length < 8) {
      alert('Please enter a valid UPI Ref No / UTR (typically 12 digits).');
      return;
    }

    setIsVerifying(true);
    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      
      // Complete booking step
      setTimeout(() => {
        onPaymentSuccess(upiRef);
        onClose();
        setIsSuccess(false);
        setUpiRef('');
      }, 1500);
    }, 1500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#334155')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div style={{ textAlign: 'center', padding: '30px 0' }} className="animate-fade-in">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <CheckCircle size={40} color="#16A34A" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Payment Verified!
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569' }}>
              Transaction reference logged. Finalizing booking details...
            </p>
          </div>
        ) : (
          /* PAYMENT FORM */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <QrCode size={18} color="#C9A227" /> UPI Instant Payment
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'center', marginBottom: '16px' }}>
              Scan the QR using BHIM, GPay, PhonePe, or Paytm to pay advance.
            </p>

            {/* QR Frame */}
            <div
              style={{
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '244px',
                height: '244px'
              }}
            >
              <img
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                style={{ width: '220px', height: '220px', display: 'block' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/220x220?text=Scan+to+Pay';
                }}
              />
            </div>

            {/* Price block */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>GUEST / PAYEE</div>
                <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>{customerName}</div>
                <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>VPA: {upiId}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>AMOUNT DUE</div>
                <div style={{ fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>₹{amount.toLocaleString()}</div>
              </div>
            </div>

            {/* Ref verification */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, alignSelf: 'flex-start' }}>
                UPI TRANSACTION ID / UTR (12 DIGITS)
              </label>
              <input
                type="text"
                required
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value.replace(/\D/g, '').substring(0, 12))}
                placeholder="Enter 12-digit transaction ID"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  letterSpacing: '0.05em'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isVerifying ? 0.7 : 1
              }}
            >
              <ShieldCheck size={16} />
              {isVerifying ? 'Verifying payment...' : 'Confirm Payment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
