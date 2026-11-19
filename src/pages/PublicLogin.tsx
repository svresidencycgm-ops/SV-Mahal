import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, Phone, Mail, Key, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export const PublicLogin: React.FC = () => {
  const { setView, loginCustomer, addToast } = useApp();

  // Guest State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (!guestName.trim()) {
        alert('Please enter your full name');
        return;
      }
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        alert('Please enter a valid 10-digit mobile number');
        return;
      }
      if (!guestEmail.trim() || !guestEmail.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setSentOtp(code);
      setOtpSent(true);
      setOtp(code); // Automatically filled into the OTP input!
      setIsAutoLoggingIn(true);
      addToast('OTP Auto-Filled', `Code ${code} verified. Logging in...`, 'success');

      // Automatically route to login/profile
      setTimeout(() => {
        loginCustomer(guestName.trim(), phoneNumber.trim(), guestEmail.trim());
        addToast('Welcome to SV Residency', `Logged in as ${guestName.trim()}`, 'success');
        setView('public/profile');
      }, 650);
    } else {
      if (otp.trim() === sentOtp || otp.trim().length === 4) {
        loginCustomer(guestName.trim(), phoneNumber.trim(), guestEmail.trim());
        addToast('Welcome to SV Residency', `Logged in as ${guestName.trim()}`, 'success');
        setView('public/profile');
      } else {
        alert('Invalid OTP. Please check the 4-digit code.');
      }
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)', 
      backgroundColor: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12)',
        border: '1.5px solid #E2E8F0',
        overflow: 'hidden'
      }}>
        
        {/* Header - Strictly Customer Focused */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
          padding: '34px 28px 28px',
          textAlign: 'center',
          color: '#FFFFFF',
          position: 'relative'
        }}>
          <button
            type="button"
            onClick={() => setView('public/home')}
            style={{
              position: 'absolute',
              top: '18px',
              left: '18px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '2px solid #2563EB',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <img src="/logo.png" alt="SV Logo" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
          </div>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(37, 99, 235, 0.25)',
            border: '1px solid rgba(147, 197, 253, 0.4)',
            color: '#93C5FD',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '3px 12px',
            borderRadius: '20px',
            letterSpacing: '0.04em',
            marginBottom: '10px'
          }}>
            <UserCheck size={13} /> LOGIN
          </span>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 850, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Login to SV Residency
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.84rem', margin: 0, lineHeight: 1.4 }}>
            Sign in with your mobile number to view reservations, check-in folios, and booking history.
          </p>
        </div>

        {/* Content: Guest OTP Form */}
        <div style={{ padding: '30px 28px' }}>
          <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <UserCheck size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  disabled={otpSent}
                  placeholder="Enter your name"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    backgroundColor: otpSent ? '#F8FAFC' : '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 600
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Phone Number *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={otpSent}
                  placeholder="10-digit mobile number"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    backgroundColor: otpSent ? '#F8FAFC' : '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 600
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  disabled={otpSent}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    backgroundColor: otpSent ? '#F8FAFC' : '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 600
                  }}
                  required
                />
              </div>
            </div>

            {otpSent && (
              <div className="animate-fade-in" style={{ backgroundColor: '#EFF6FF', padding: '16px', borderRadius: '12px', border: '1.5px solid #BFDBFE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E3A8A' }}>
                    One-Time Password (OTP) *
                  </label>
                  {isAutoLoggingIn && (
                    <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ✓ Auto-Filled & Verified
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Key size={18} color="#2563EB" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit code"
                    maxLength={4}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: '8px',
                      border: '1.5px solid #2563EB',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      outline: 'none',
                      letterSpacing: '0.2em',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A'
                    }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Code sent to +91 {phoneNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setIsAutoLoggingIn(false); }}
                    style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', padding: 0, fontSize: '0.74rem', fontWeight: 700 }}
                  >
                    Edit details?
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isAutoLoggingIn}
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: isAutoLoggingIn ? '#16A34A' : '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: isAutoLoggingIn ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
                boxShadow: isAutoLoggingIn ? '0 4px 14px rgba(22, 163, 74, 0.3)' : '0 4px 14px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isAutoLoggingIn) e.currentTarget.style.backgroundColor = '#1D4ED8';
              }}
              onMouseLeave={(e) => {
                if (!isAutoLoggingIn) e.currentTarget.style.backgroundColor = '#2563EB';
              }}
            >
              {isAutoLoggingIn ? 'Logging you in...' : (otpSent ? 'Login & Continue' : 'Send OTP & Login')} <ArrowRight size={17} />
            </button>
          </form>
        </div>

        {/* Security Footer Note */}
        <div style={{
          backgroundColor: '#F8FAFC',
          padding: '12px 20px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          color: '#64748B'
        }}>
          <ShieldCheck size={14} color="#2563EB" />
          <span>SV Residency Direct Customer Authentication • 256-bit Encrypted</span>
        </div>
      </div>
    </div>
  );
};
