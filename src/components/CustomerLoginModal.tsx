import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, ShieldCheck, Mail, User, Sparkles, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { playBellSound } from '../utils/soundEffects';

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
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!isOpen) {
      // Reset when closed
      setStep('details');
      setName('');
      setPhone('');
      setEmail('');
      setOtpCode(['', '', '', '']);
      setGeneratedOtp('');
      setCountdown(30);
    }
  }, [isOpen]);

  // Resend countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.length < 10 || !email.trim()) {
      addToast('Validation', 'Please provide your Full Name, 10-digit Phone, and Email.', 'warning');
      return;
    }

    // Generate 4 digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setStep('otp');
    setCountdown(30);

    // AUTO-FILL the OTP directly into input state as requested!
    setOtpCode(code.split(''));

    // Sound notification
    playBellSound();

    addToast(
      'OTP Auto-Generated',
      `Verification code sent & autofilled: ${code}`,
      'success'
    );
  };

  const handleResendOtp = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpCode(code.split(''));
    setCountdown(30);
    playBellSound();
    addToast('OTP Resent', `New verification code autofilled: ${code}`, 'info');
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entered = otpCode.join('');
    if (entered !== generatedOtp && entered.length < 4) {
      addToast('Invalid OTP', 'Please enter the 4-digit verification code.', 'danger');
      return;
    }

    loginCustomer(name, phone, email);
    playBellSound();
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      className="animate-fade-in"
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          width: '100%',
          maxWidth: '430px',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top vibrant brand gradient banner */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #0F2942 0%, #6320EE 100%)', 
            padding: '28px 24px 24px 24px', 
            color: '#FFFFFF',
            position: 'relative',
            textAlign: 'center'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
          >
            <X size={18} />
          </button>

          {/* Logo badge */}
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(4px)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }}
          >
            <Lock size={24} color="#C9A227" />
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '0.01em',
              fontFamily: 'var(--font-crm-sans, var(--font-sans))'
            }}
          >
            SV Guest Portal Login
          </h3>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#E2E8F0', opacity: 0.9 }}>
            {step === 'details'
              ? 'Instant verification with automatic OTP autofill'
              : `Verification code sent to +91 ${phone}`}
          </p>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '26px 24px 28px 24px' }}>
          {step === 'details' ? (
            /* STEP 1: CONTACT DETAILS */
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '6px' }}>
                  FULL NAME *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#F8FAFC', transition: 'border-color 0.2s' }}>
                  <User size={18} color="#6320EE" style={{ marginRight: '10px', flexShrink: 0 }} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#1E293B', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '6px' }}>
                  MOBILE NUMBER *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#F8FAFC' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F2942', paddingRight: '8px', borderRight: '1px solid #CBD5E1', marginRight: '10px' }}>
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#1E293B', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '6px' }}>
                  EMAIL ADDRESS *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#F8FAFC' }}>
                  <Mail size={18} color="#6320EE" style={{ marginRight: '10px', flexShrink: 0 }} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#1E293B', fontWeight: 600 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #6320EE 0%, #4F14D6 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.925rem',
                  cursor: 'pointer',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(99, 32, 238, 0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                Send & Autofill OTP <ArrowRight size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                <ShieldCheck size={14} color="#16A34A" /> 256-Bit SSL Encrypted Guest Portal Access
              </div>
            </form>
          ) : (
            /* STEP 2: ENTER & AUTOFILL OTP */
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Highlighted Autofill Notice Badge */}
              <div 
                style={{ 
                  backgroundColor: '#F3E8FF', 
                  border: '1.5px solid #D8B4FE', 
                  borderRadius: '12px', 
                  padding: '12px 14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#6320EE" />
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4C1D95', display: 'block' }}>
                      OTP Code Auto-Filled
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#6B21A8' }}>
                      Simulated code: <strong>{generatedOtp}</strong>
                    </span>
                  </div>
                </div>
                <span 
                  style={{ 
                    backgroundColor: '#10B981', 
                    color: '#FFFFFF', 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    padding: '3px 8px', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px' 
                  }}
                >
                  <CheckCircle2 size={12} /> Ready
                </span>
              </div>

              {/* 4 Box OTP Digits */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpCode((prev) => {
                        const next = [...prev];
                        next[idx] = val;
                        return next;
                      });
                      if (val && idx < 3) {
                        const nextField = document.getElementById(`login-otp-${idx + 1}`);
                        nextField?.focus();
                      }
                    }}
                    id={`login-otp-${idx}`}
                    style={{
                      width: '54px',
                      height: '58px',
                      borderRadius: '12px',
                      border: '2px solid #6320EE',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: '#0F2942',
                      backgroundColor: '#FAF5FF',
                      boxShadow: '0 4px 10px rgba(99, 32, 238, 0.1)',
                      outline: 'none'
                    }}
                  />
                ))}
              </div>

              {/* Verify & Login Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.28)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <ShieldCheck size={20} /> Verify & Access Profile
              </button>

              {/* Resend & Change Number footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  style={{ background: 'none', border: 'none', color: '#6320EE', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  ← Edit Phone / Email
                </button>

                {countdown > 0 ? (
                  <span style={{ color: '#94A3B8' }}>Resend code in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{ background: 'none', border: 'none', color: '#10B981', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                  >
                    <RefreshCw size={13} /> Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
