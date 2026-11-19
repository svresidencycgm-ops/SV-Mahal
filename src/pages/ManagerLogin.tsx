import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export const ManagerLogin: React.FC = () => {
  const { setView, setUserRole, addToast } = useApp();

  const [email, setEmail] = useState('manager@svmahal.com');
  const [password, setPassword] = useState('manager');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (email.trim().toLowerCase() === 'manager@svmahal.com' && password === 'manager') {
      setUserRole('manager');
      addToast('Duty Manager Authenticated', 'Welcome to Front Desk & Operations Management.', 'info');
      setView('crm/overview');
    } else if (email.trim().toLowerCase() === 'admin@svmahal.com' && password === 'admin') {
      // Also allow admin credentials to elevate to admin role
      setUserRole('admin');
      addToast('Executive Admin Authenticated', 'Elevated session to Executive Administration Center.', 'success');
      setView('crm/overview');
    } else {
      setErrorMsg('Invalid Manager credentials. Please check your work email and password.');
    }
  };

  const handleFillDemoManager = () => {
    setEmail('manager@svmahal.com');
    setPassword('manager');
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
                Manager Work Email *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@svmahal.com"
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
                Default: <strong>manager@svmahal.com</strong> / <strong>manager</strong>
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

          {/* Quick Switch to Admin or Customer */}
          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #F1F5F9',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginBottom: '8px' }}>
              Switch to another login portal:
            </span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setView('login/admin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#DC2626',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                🏛️ Executive Admin Portal
              </button>
              <span style={{ color: '#CBD5E1' }}>•</span>
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
