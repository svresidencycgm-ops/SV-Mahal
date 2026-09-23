import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Key, Mail, Phone, ArrowRight, UserCheck, Lock } from 'lucide-react';

export const PublicLogin: React.FC = () => {
  const { setView, setUserRole, loginCustomer } = useApp();
  const [activeTab, setActiveTab] = useState<'guest' | 'staff'>('guest');

  // Guest State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Staff State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (phoneNumber.length >= 10) {
        setOtpSent(true);
        // Simulate OTP sending
        alert(`OTP sent to ${phoneNumber}`);
      } else {
        alert('Please enter a valid phone number');
      }
    } else {
      if (otp === '1234') { // Mock OTP
        loginCustomer('Demo User', phoneNumber, 'demo@example.com');
        setView('public/profile');
      } else {
        alert('Invalid OTP. Use 1234 for demo.');
      }
    }
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@svmahal.com' && password === 'admin') {
      setUserRole('admin');
      setView('crm/overview');
    } else if (email === 'manager@svmahal.com' && password === 'manager') {
      setUserRole('manager');
      setView('crm/overview');
    } else {
      alert('Invalid credentials. Use admin@svmahal.com / admin or manager@svmahal.com / manager');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)', 
      backgroundColor: '#FDFBF7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'var(--font-sans)'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: '#0F172A',
          padding: '30px',
          textAlign: 'center',
          color: '#FFFFFF'
        }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '2px solid #C9A227',
              boxShadow: '0 0 15px rgba(201, 162, 39, 0.5)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <img src="/logo.png" alt="SV Logo" style={{ width: '92%', height: '92%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>Welcome Back</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>Sign in to continue to SV Residency & Mahal</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
          <button
            onClick={() => setActiveTab('guest')}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'guest' ? '3px solid #C9A227' : '3px solid transparent',
              color: activeTab === 'guest' ? '#0F172A' : '#64748B',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <UserCheck size={18} /> Guest Login
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'staff' ? '3px solid #0F172A' : '3px solid transparent',
              color: activeTab === 'staff' ? '#0F172A' : '#64748B',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Shield size={18} /> Staff Portal
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          {activeTab === 'guest' ? (
            <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={otpSent}
                    placeholder="Enter 10-digit number"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '1rem',
                      outline: 'none',
                      backgroundColor: otpSent ? '#F8FAFC' : '#FFFFFF'
                    }}
                    required
                  />
                </div>
              </div>

              {otpSent && (
                <div className="animate-fade-in">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>One-Time Password (OTP)</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 1234 for demo"
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        borderRadius: '8px',
                        border: '1px solid #C9A227',
                        fontSize: '1rem',
                        outline: 'none',
                        boxShadow: '0 0 0 3px rgba(201, 162, 39, 0.1)'
                      }}
                      required
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '8px', textAlign: 'right' }}>
                    <button type="button" onClick={() => setOtpSent(false)} style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer', padding: 0 }}>Change Number?</button>
                  </p>
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#C9A227',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '10px'
                }}
              >
                {otpSent ? 'Verify & Login' : 'Send OTP'} <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Staff Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@svmahal.com"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '10px'
                }}
              >
                Secure Login <Shield size={18} />
              </button>
              
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '0.75rem', color: '#64748B' }}>
                <strong>Demo Credentials:</strong><br/>
                Admin: admin@svmahal.com / admin<br/>
                Manager: manager@svmahal.com / manager
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
