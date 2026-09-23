import React from 'react';
import { Star, ShieldCheck, Check, Sparkles, ExternalLink, Phone } from 'lucide-react';
import { CONTACT_INFO } from '../config/contact';

export const OtaPartnersBanner: React.FC = () => {
  return (
    <section
      style={{
        padding: '50px 0',
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              color: '#0284C7',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '6px',
              display: 'block'
            }}
          >
            TRUSTED HOSPITALITY PARTNERS
          </span>
          <h2 style={{ fontSize: '2rem', color: '#0F172A', fontWeight: 800, margin: '0 0 10px 0' }}>
            Available on MakeMyTrip & Goibibo
          </h2>
          <p style={{ color: '#64748B', maxWidth: '640px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.6 }}>
            SV Residency is a verified and highly-rated stay destination across India's top travel platforms. Book via your preferred portal or book direct for maximum savings.
          </p>
        </div>

        {/* 2 OTA Cards + Direct Booking Callout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            alignItems: 'stretch'
          }}
        >
          {/* MakeMyTrip Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s',
              borderTop: '4px solid #E11D48'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: '#FFE4E6',
                      color: '#E11D48',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      border: '1px solid #FECDD3'
                    }}
                  >
                    MMT
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                      MakeMyTrip
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Verified Hotel Partner</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#FEF3C7',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#92400E'
                  }}
                >
                  <Star size={13} fill="#D97706" color="#D97706" /> 4.5 / 5
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                Book SV Residency on MakeMyTrip with instant booking voucher confirmation, assured amenities, and MMT traveler reviews.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '0.8rem', color: '#334155' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#16A34A" /> 100% Verified MMT Devotee Reviews
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#16A34A" /> Instant MMT Confirmation SMS & Email
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#16A34A" /> Deluxe AC & Standard Room Availability
                </span>
              </div>
            </div>

            <a
              href="https://www.makemytrip.com/hotels/hotel-listing/?city=Chengam"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 18px',
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#BE123C')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E11D48')}
            >
              <span>View on MakeMyTrip</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Goibibo Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s',
              borderTop: '4px solid #F97316'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: '#FFEDD5',
                      color: '#EA580C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      border: '1px solid #FED7AA'
                    }}
                  >
                    GIB
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                      Goibibo
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Goibibo Certified Stay</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#FEF3C7',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#92400E'
                  }}
                >
                  <Star size={13} fill="#D97706" color="#D97706" /> 4.4 / 5
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                Reserve your stay seamlessly via Goibibo app with goCash benefits, express check-in assurance, and highway convenience.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '0.8rem', color: '#334155' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#16A34A" /> Goibibo Verified Cleanliness Standards
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#16A34A" /> Free Extended Car Parking on Highway
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#16A34A" /> 24-Hour Hot Water & Generator Backup
                </span>
              </div>
            </div>

            <a
              href="https://www.goibibo.com/hotels/hotels-in-chengam/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 18px',
                backgroundColor: '#EA580C',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C2410C')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EA580C')}
            >
              <span>View on Goibibo</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Direct Booking Privilege Card */}
          <div
            style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '16px',
              border: '2px solid #C9A227',
              padding: '24px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Sparkles size={18} color="#C9A227" />
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#C9A227',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}
                >
                  SAVE MORE: BOOK DIRECT
                </span>
              </div>

              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                Why Book Direct on Our Site?
              </h3>

              <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '16px' }}>
                OTAs charge up to 15% booking fees. When you book directly through us, you receive our best price guarantee and personal hospitality.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '0.8rem', color: '#CBD5E1' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#C9A227" /> Guaranteed Lowest Rate (Zero OTA Fee)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#C9A227" /> Direct Front Desk Assistance: <strong>95008 21550</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#C9A227" /> Priority Check-in for Temple Pilgrims
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={CONTACT_INFO.phone1.telLink}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px 14px',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <Phone size={14} /> Call Desk
              </a>
              <a
                href={CONTACT_INFO.phone1.whatsappLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px 14px',
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
