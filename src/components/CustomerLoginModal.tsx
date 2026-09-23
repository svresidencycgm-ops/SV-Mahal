import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Phone, ShieldCheck, Mail, User } from 'lucide-react';

interface CustomerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CustomerLoginModal: React.FC<CustomerLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginCustomer, addToast } = useApp();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // OTP inputs
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset when closed
      setStep('details');
      setName('');
      setPhone('');
      setEmail('');
      setOtpCode(['', '', '', '']);
      setGeneratedOtp('');
      setIsAutofilling(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.length < 10 || !email.trim()) {
      alert('Please enter valid contact details.');
      return;
    }

    // Generate 4 digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setStep('otp');

    // Display simulation toast
    setTimeout(() => {
      addToast(
        '🔑 Mock SMS Gateway',
        `OTP Code sent to ${phone}: ${code}`,
        'warning'
      );
    }, 400);

    // Simulate OTP autofill after 1.5 seconds
    setIsAutofilling(true);
    setTimeout(() => {
      // Type digits one by one
      code.split('').forEach((char, idx) => {
        setTimeout(() => {
          setOtpCode(prev => {
            const next = [...prev];
            next[idx] = char;
            return next;
          });
        }, idx * 250); // 250ms typing delay per digit
      });
      setIsAutofilling(false);
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpCode.join('');
    if (entered !== generatedOtp) {
      alert('Invalid OTP. Please try again or check the mock SMS toast.');
      return;
    }

    loginCustomer(name, phone, email);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
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
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '400px',
          overflow: 'hidden',
          border: '1px solid #D2E3F8',
          position: 'relative'
        }}
      >
        {/* Header decoration */}
        <div style={{ backgroundColor: '#0284C7', height: '4px', width: '100%' }} />

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
        >
          <X size={20} />
        </button>

        <div style={{ padding: '30px 24px' }}>
          {/* Logo element */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}
          >
            <Lock size={20} color="#0284C7" />
          </div>

          <h3
            style={{
              textAlign: 'center',
              fontSize: '1.25rem',
              color: '#0F2942',
              fontWeight: 800,
              fontFamily: 'var(--font-sans)',
              marginBottom: '6px'
            }}
          >
            Customer Stay Portal
          </h3>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748B', margin: '0 0 24px 0' }}>
            {step === 'details'
              ? 'Enter contact parameters to generate a mock OTP passcode.'
              : 'Verifying stay profile records.'}
          </p>

          {step === 'details' ? (
            /* STEP 1: CONTACT DETAILS */
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                  FULL NAME
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 12px', backgroundColor: '#FFFFFF' }}>
                  <User size={16} color="#94A3B8" style={{ marginRight: '8px' }} />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                  EMAIL ADDRESS
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 12px', backgroundColor: '#FFFFFF' }}>
                  <Mail size={16} color="#94A3B8" style={{ marginRight: '8px' }} />
                  <input
                    type="email"
                    required
                    placeholder="johndoe@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                  MOBILE NUMBER
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 12px', backgroundColor: '#FFFFFF' }}>
                  <Phone size={16} color="#94A3B8" style={{ marginRight: '8px' }} />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                    style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '10px',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0269A1')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284C7')}
              >
                Send OTP Verification
              </button>
            </form>
          ) : (
            /* STEP 2: ENTER OTP */
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpCode(prev => {
                        const next = [...prev];
                        next[idx] = val;
                        return next;
                      });
                      // Focus next field
                      if (val && idx < 3) {
                        const nextField = document.getElementById(`otp-${idx + 1}`);
                        nextField?.focus();
                      }
                    }}
                    id={`otp-${idx}`}
                    style={{
                      width: '48px',
                      height: '52px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#0F2942',
                      backgroundColor: '#F8FAFC'
                    }}
                  />
                ))}
              </div>

              {isAutofilling && (
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#0284C7', fontWeight: 600 }} className="animate-pulse">
                  ⚡ Simulating SMS Autofill...
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <ShieldCheck size={18} /> Verify & Log In
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B' }}>
                <span>OTP Code: {generatedOtp}</span>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 600, cursor: 'pointer' }}
                >
                  Change Details
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
