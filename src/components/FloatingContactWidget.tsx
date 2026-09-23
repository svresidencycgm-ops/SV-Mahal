import React, { useState, useEffect, useRef } from 'react';
import { Phone, MessageCircle, X, ChevronRight, MapPin, Headphones, Clock } from 'lucide-react';
import { CONTACT_INFO } from '../config/contact';

export const FloatingContactWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={widgetRef}
      className="no-print"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)'
      }}
    >
      {/* Expanded Quick Contact Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Quick Contact & WhatsApp"
          className="animate-fade-in"
          style={{
            position: 'absolute',
            bottom: '72px',
            right: 0,
            width: '340px',
            maxWidth: 'calc(100vw - 32px)',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.25), 0 10px 15px -5px rgba(15, 23, 42, 0.1)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              color: '#FFFFFF',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #C9A227'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(201, 162, 39, 0.2)',
                  border: '1px solid #C9A227',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C9A227'
                }}
              >
                <Headphones size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Quick Assistance
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#22C55E',
                      display: 'inline-block',
                      boxShadow: '0 0 6px #22C55E'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Desk Active • Instant Reply</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close contact popup"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#CBD5E1',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#CBD5E1';
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
            
            {/* WhatsApp Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span
                  style={{
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  WhatsApp Chat
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Fastest Response</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Desk WhatsApp */}
                <a
                  href={CONTACT_INFO.phone1.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: '#0F172A',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#DCFCE7';
                    e.currentTarget.style.borderColor = '#86EFAC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0FDF4';
                    e.currentTarget.style.borderColor = '#BBF7D0';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        flexShrink: 0
                      }}
                    >
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#14532D' }}>
                        {CONTACT_INFO.phone1.display}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#166534' }}>
                        {CONTACT_INFO.phone1.label}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#16A34A" />
                </a>

                {/* Support WhatsApp */}
                <a
                  href={CONTACT_INFO.phone2.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: '#0F172A',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#DCFCE7';
                    e.currentTarget.style.borderColor = '#86EFAC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0FDF4';
                    e.currentTarget.style.borderColor = '#BBF7D0';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        flexShrink: 0
                      }}
                    >
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#14532D' }}>
                        {CONTACT_INFO.phone2.display}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#166534' }}>
                        {CONTACT_INFO.phone2.label}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#16A34A" />
                </a>
              </div>
            </div>

            {/* Direct Call Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span
                  style={{
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Phone Helpline
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Direct Call</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <a
                  href={CONTACT_INFO.phone1.telLink}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E0F2FE';
                    e.currentTarget.style.borderColor = '#38BDF8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <Phone size={16} color="#0284C7" style={{ marginBottom: '4px' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                    {CONTACT_INFO.phone1.raw}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Manager Desk</span>
                </a>

                <a
                  href={CONTACT_INFO.phone2.telLink}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E0F2FE';
                    e.currentTarget.style.borderColor = '#38BDF8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <Phone size={16} color="#0284C7" style={{ marginBottom: '4px' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                    {CONTACT_INFO.phone2.raw}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Support</span>
                </a>
              </div>
            </div>

            {/* Timings and Location */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.75rem',
                color: '#64748B',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                border: '1px solid #F1F5F9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} color="#C9A227" />
                <span>24/7 Front Desk & Check-in Support</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} color="#C9A227" />
                <a
                  href={CONTACT_INFO.address.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}
                >
                  Open in Google Maps (Chengam) ↗
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact and WhatsApp support"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          border: '2px solid #C9A227',
          borderRadius: '9999px',
          boxShadow: '0 10px 25px -3px rgba(15, 23, 42, 0.3), 0 4px 6px -2px rgba(15, 23, 42, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.backgroundColor = '#1E293B';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.backgroundColor = '#0F172A';
        }}
      >
        {/* Dual WhatsApp + Phone Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#25D366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <MessageCircle size={18} />
          </div>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginLeft: '-10px',
              border: '2px solid #0F172A'
            }}
          >
            <Phone size={13} />
          </div>
        </div>

        {/* Text Label on desktop & mobile */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.72rem', color: '#C9A227', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Direct Contact
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
            Call / WhatsApp
          </div>
        </div>
      </button>
    </div>
  );
};
