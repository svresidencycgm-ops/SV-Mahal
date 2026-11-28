import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, User, Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { verifyManagerLogin, verifyAdminLogin, getManagerCredentials } from '../services/authCredentials';

export const ManagerLogin: React.FC = () => {
  const { setView, loginStaff, addToast } = useApp();
  const currentCreds = getManagerCredentials();

  const [username, setUsername] = useState(currentCreds.username || 'manager');
  const [password, setPassword] = useState(currentCreds.password || 'manager');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (verifyManagerLogin(username, password)) {
      loginStaff('manager');
      addToast('Duty Manager Authenticated', 'Welcome to Front Desk & Operations Management.', 'info');
    } else if (verifyAdminLogin(username, password)) {
      // Admin can access the Manager profile directly
      loginStaff('admin', 'manager');
      addToast('Admin Viewing Manager Desk', 'Logged into Duty Manager profile with Executive session.', 'success');
    } else {
      setErrorMsg('Invalid Manager credentials. Please check your username and password.');
    }
  };

  const handleFillDemoManager = () => {
    const creds = getManagerCredentials();
    setUsername(creds.username);
    setPassword(creds.password);
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)', 
      backgroundColor: '#F1F5F9',
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
        border: '1.5px solid #CBD5E1',
        overflow: 'hidden'
      }}>
        
        {/* Header - Operations / Duty Manager Branding (Navy & Royal Blue) */}
        <div style={{
          background: 'linear-gradient(135deg, #0A2540 0%, #1E3A8A 100%)',
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
              background: 'rgba(255,255,255,0.12)',
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
            backgroundColor: 'rgba(37, 99, 235, 0.3)',
            border: '1px solid rgba(147, 197, 253, 0.4)',
            color: '#93C5FD',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '3px 12px',
            borderRadius: '20px',
            letterSpacing: '0.04em',
            marginBottom: '10px'
          }}>
            <Shield size={13} /> OPERATIONS DUTY DESK
          </span>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 850, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Duty Manager Sign-In
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.84rem', margin: 0, lineHeight: 1.4 }}>
            Front desk reservations, live door key matrix, housekeeping turnover, and guest arrivals.
          </p>
        </div>

        {/* Content: Manager Credentials Form */}
        <div style={{ padding: '30px 28px' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Manager Username or Email *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="manager or manager@svmahal.com"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 600
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter manager password"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 600
                  }}
                  required
                />
              </div>
            </div>

            <div style={{
              backgroundColor: '#EFF6FF',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#1E3A8A', fontWeight: 600 }}>
                Username: <strong>{currentCreds.username}</strong> / Password: <strong>••••••</strong>
              </div>
              <button
                type="button"
                onClick={handleFillDemoManager}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Auto-fill
              </button>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
            >
              Sign In to Duty Desk <ArrowRight size={17} />
            </button>
          </form>

          {/* Quick Switch to Customer */}
          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #F1F5F9',
            textAlign: 'center'
          }}>
            <button
              type="button"
              onClick={() => setView('public/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#475569',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              👤 Guest / Customer Login
            </button>
          </div>
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
          <span>Operational Duty Role • Restricted from Master Financial Ledgers</span>
        </div>
      </div>
    </div>
  );
};
