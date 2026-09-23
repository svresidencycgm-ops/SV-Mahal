import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/Toast';
import { BookingDetailsModal } from './components/BookingDetailsModal';
import { CustomerLoginModal } from './components/CustomerLoginModal';

// Public pages
import { PublicHome } from './pages/PublicHome';
import { PublicLogin } from './pages/PublicLogin';
import { PublicRooms } from './pages/PublicRooms';
import { PublicMahal } from './pages/PublicMahal';
import { BookingFlow } from './pages/BookingFlow';

// CRM pages
import { CrmLayout } from './pages/CrmLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { BookingsCrm } from './pages/BookingsCrm';
import { CustomersCrm } from './pages/CustomersCrm';
import { RoomsCrm } from './pages/RoomsCrm';
import { MahalCrm } from './pages/MahalCrm';
import { FinanceCrm } from './pages/FinanceCrm';
import { BillInventoryCrm } from './pages/BillInventoryCrm';
import { ReportsCrm } from './pages/ReportsCrm';
import { SettingsCrm } from './pages/SettingsCrm';
import { AuditLogsCrm } from './pages/AuditLogsCrm';
import { OnsiteBookingCrm } from './pages/OnsiteBookingCrm';
import { MahalOnsiteBookingCrm } from './pages/MahalOnsiteBookingCrm';
import { OnlineRequestsCrm } from './pages/OnlineRequestsCrm';
import { OtaChannelsCrm } from './pages/OtaChannelsCrm';
import { PublicProfile } from './pages/PublicProfile';

import { Menu, X, ShieldAlert, Phone, MessageCircle, MapPin } from 'lucide-react';
import { FloatingContactWidget } from './components/FloatingContactWidget';
import { CONTACT_INFO } from './config/contact';

const AppContent: React.FC = () => {
  const { currentView, setView, selectedBooking, setSelectedBooking, customerUser, logoutCustomer, currentUserRole } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCustomerLoginOpen, setIsCustomerLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0F172A',
        color: '#FFFFFF'
      }}>
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '3px solid #C9A227',
            boxShadow: '0 0 25px rgba(201, 162, 39, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            overflow: 'hidden',
            animation: 'pulse 2s infinite'
          }}
        >
          <img 
            src="/logo.png" 
            alt="SV Logo" 
            style={{ width: '90%', height: '90%', objectFit: 'contain' }} 
          />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em', margin: 0 }}>
            SV. MAHAL <span style={{ color: '#C9A227' }}>&</span> RESIDENCY
          </h2>
          <span style={{ fontSize: '0.7rem', color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Chengam • Tamil Nadu
          </span>
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTop: '4px solid #C9A227',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0% { transform: scale(0.95); opacity: 0.8; }
              50% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(0.95); opacity: 0.8; }
            }
          `}
        </style>
      </div>
    );
  }

  // Switch public pages
  const renderPublicView = () => {
    const viewName = currentView.split('?')[0]; // Strip query parameters
    switch (viewName) {
      case 'public/rooms':
        return <PublicRooms />;
      case 'public/mahal':
        return <PublicMahal />;
      case 'public/book':
        return <BookingFlow />;
      case 'public/profile':
        return <PublicProfile />;
      case 'public/login':
        return <PublicLogin />;
      case 'public/home':
      default:
        return <PublicHome />;
    }
  };

  // Switch CRM pages
  const renderCrmView = () => {
    const viewName = currentView.split('?')[0];

    // Block managers from financial data pages
    if (currentUserRole === 'manager') {
      if (['crm/finance', 'crm/bill-inventory', 'crm/audit'].includes(viewName)) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={32} color="#DC2626" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0, fontFamily: 'var(--font-sans)' }}>Access Restrained</h2>
            <p style={{ color: '#64748B', maxWidth: '380px', margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
              Duty Managers do not have permission to access financial ledger manager, analytical expense logs, or system audit trails. Please request administrator assistance.
            </p>
          </div>
        );
      }
    }

    switch (viewName) {
      case 'crm/bookings':
        return <BookingsCrm />;
      case 'crm/customers':
        return <CustomersCrm />;
      case 'crm/rooms':
        return <RoomsCrm />;
      case 'crm/mahal':
        return <MahalCrm />;
      case 'crm/finance':
        return <FinanceCrm />;
      case 'crm/bill-inventory':
        return <BillInventoryCrm />;
      case 'crm/reports':
        return <ReportsCrm />;
      case 'crm/audit':
        return <AuditLogsCrm />;
      case 'crm/settings':
        return <SettingsCrm />;
      case 'crm/onsite-booking':
        return <OnsiteBookingCrm initialServiceType="room" />;
      case 'crm/onsite-booking-mahal':
        return <MahalOnsiteBookingCrm />;
      case 'crm/online-requests':
        return <OnlineRequestsCrm />;
      case 'crm/ota-channels':
        return <OtaChannelsCrm />;
      case 'crm/overview':
      default:
        return <DashboardOverview />;
    }
  };

  const isCrmRoute = currentView.startsWith('crm/');

  return (
    <>
      {isCrmRoute ? (
        /* CRM PORT viewport layout */
        <CrmLayout>{renderCrmView()}</CrmLayout>
      ) : (
        /* PUBLIC HOSPITALITY WEBSITE Layout */
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          
          {/* Top Micro Contact Bar (Desktop Only) */}
          <div
            className="no-print desktop-only"
            style={{
              backgroundColor: '#070D17',
              color: '#94A3B8',
              fontSize: '0.78rem',
              padding: '6px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <div
              className="container"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} color="#C9A227" />
                <span>Main Road, Thukkapet, Chengam, Tamil Nadu - 606701</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} color="#0284C7" />
                  <span>Desk:</span>
                  <a href={CONTACT_INFO.phone1.telLink} style={{ color: '#E2E8F0', textDecoration: 'none', fontWeight: 600 }}>
                    {CONTACT_INFO.phone1.display}
                  </a>
                </span>

                <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>

                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} color="#0284C7" />
                  <span>Support:</span>
                  <a href={CONTACT_INFO.phone2.telLink} style={{ color: '#E2E8F0', textDecoration: 'none', fontWeight: 600 }}>
                    {CONTACT_INFO.phone2.display}
                  </a>
                </span>

                <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>

                <a
                  href={CONTACT_INFO.phone1.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#4ADE80',
                    textDecoration: 'none',
                    fontWeight: 700
                  }}
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Header Navigation */}
          <header
            className="no-print"
            style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              position: 'sticky',
              top: 0,
              zIndex: 100,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              className="container"
              style={{
                height: '72px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {/* Logo block */}
              <div
                onClick={() => {
                  setView('public/home');
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #C9A227',
                    boxShadow: '0 0 12px rgba(201, 162, 39, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  <img 
                    src="/logo.png" 
                    alt="SV Logo" 
                    style={{ width: '92%', height: '92%', objectFit: 'contain' }} 
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      letterSpacing: '0.04em',
                      lineHeight: 1.15
                    }}
                  >
                    SV. MAHAL <span style={{ color: '#C9A227' }}>&</span> RESIDENCY
                  </div>
                  <div
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: '#94A3B8',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginTop: '2px'
                    }}
                  >
                    A Blend of Heritage & Comfort • Chengam
                  </div>
                </div>
              </div>

              {/* Nav links and actions */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span className="desktop-only" style={{ display: 'flex', gap: '20px', fontSize: '0.875rem', fontWeight: 600 }}>
                  <button onClick={() => setView('public/home')} style={{ background: 'none', border: 'none', color: currentView === 'public/home' ? '#C9A227' : '#CBD5E1', cursor: 'pointer' }}>Home</button>
                  <button onClick={() => setView('public/rooms')} style={{ background: 'none', border: 'none', color: currentView.startsWith('public/rooms') ? '#C9A227' : '#CBD5E1', cursor: 'pointer' }}>Residency Rooms</button>
                  <button onClick={() => setView('public/mahal')} style={{ background: 'none', border: 'none', color: currentView.startsWith('public/mahal') ? '#C9A227' : '#CBD5E1', cursor: 'pointer' }}>SV Mahal</button>
                  <button onClick={() => setView('public/book')} style={{ background: 'none', border: 'none', color: currentView.startsWith('public/book') ? '#C9A227' : '#CBD5E1', cursor: 'pointer' }}>Book Now</button>
                </span>

                {/* Customer Login / Welcome Greetings (Desktop) */}
                <div className="desktop-only">
                  {customerUser ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => setView('public/profile')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: currentView === 'public/profile' ? '#0284C7' : '#CBD5E1',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: currentView === 'public/profile' ? 'underline' : 'none'
                        }}
                      >
                        My Bookings
                      </button>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>|</span>
                      <span style={{ fontSize: '0.8rem', color: '#CBD5E1', fontWeight: 600 }}>Hi, {customerUser.name}!</span>
                      <button
                        onClick={logoutCustomer}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B91C1C')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setView('public/login')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        backgroundColor: '#0284C7',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0269A1')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284C7')}
                    >
                      Login / Staff Portal
                    </button>
                  )}
                </div>

                {/* Mobile Header Quick Actions (Call, WhatsApp, Hamburger) */}
                <div className="mobile-only" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
                  {/* Quick Call */}
                  <a
                    href={CONTACT_INFO.phone1.telLink}
                    title="Call Desk"
                    aria-label="Call Desk"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={17} />
                  </a>

                  {/* Quick WhatsApp */}
                  <a
                    href={CONTACT_INFO.phone1.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    title="WhatsApp Us"
                    aria-label="WhatsApp Us"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#25D366',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    <MessageCircle size={18} />
                  </a>

                  {/* Mobile Menu trigger */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle navigation menu"
                    style={{
                      border: 'none',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                  </button>
                </div>
              </nav>
            </div>

            {/* Mobile Navigation Drawer / Dropdown */}
            {isMobileMenuOpen && (
              <div
                className="mobile-only mobile-flex-col animate-fade-in"
                style={{
                  backgroundColor: '#0B1120',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Nav Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => { setView('public/home'); setIsMobileMenuOpen(false); }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: currentView === 'public/home' ? 'rgba(201, 162, 39, 0.15)' : 'transparent',
                      color: currentView === 'public/home' ? '#C9A227' : '#E2E8F0',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => { setView('public/rooms'); setIsMobileMenuOpen(false); }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: currentView.startsWith('public/rooms') ? 'rgba(201, 162, 39, 0.15)' : 'transparent',
                      color: currentView.startsWith('public/rooms') ? '#C9A227' : '#E2E8F0',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Residency Rooms
                  </button>
                  <button
                    onClick={() => { setView('public/mahal'); setIsMobileMenuOpen(false); }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: currentView.startsWith('public/mahal') ? 'rgba(201, 162, 39, 0.15)' : 'transparent',
                      color: currentView.startsWith('public/mahal') ? '#C9A227' : '#E2E8F0',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    SV Mahal (Banquet Hall)
                  </button>
                  <button
                    onClick={() => { setView('public/book'); setIsMobileMenuOpen(false); }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: currentView.startsWith('public/book') ? 'rgba(201, 162, 39, 0.15)' : 'transparent',
                      color: currentView.startsWith('public/book') ? '#C9A227' : '#E2E8F0',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Book Now
                  </button>

                  {customerUser ? (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => { setView('public/profile'); setIsMobileMenuOpen(false); }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#0284C7',
                          color: '#FFFFFF',
                          border: 'none',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        My Bookings ({customerUser.name})
                      </button>
                      <button
                        onClick={() => { logoutCustomer(); setIsMobileMenuOpen(false); }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setView('public/login'); setIsMobileMenuOpen(false); }}
                      style={{
                        marginTop: '8px',
                        padding: '12px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#0284C7',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Login / Staff Portal
                    </button>
                  )}
                </div>

                {/* Mobile Contact & WhatsApp Assistance Card */}
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(201, 162, 39, 0.3)',
                    marginTop: '8px'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: '#C9A227', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    24/7 HELPLINE & WHATSAPP
                  </div>

                  {/* Phone 1 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 700 }}>
                        {CONTACT_INFO.phone1.display}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Manager Desk</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a
                        href={CONTACT_INFO.phone1.telLink}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#0284C7',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Phone size={12} /> Call
                      </a>
                      <a
                        href={CONTACT_INFO.phone1.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#25D366',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <MessageCircle size={12} /> Chat
                      </a>
                    </div>
                  </div>

                  {/* Phone 2 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 700 }}>
                        {CONTACT_INFO.phone2.display}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Reservations & Support</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a
                        href={CONTACT_INFO.phone2.telLink}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#0284C7',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Phone size={12} /> Call
                      </a>
                      <a
                        href={CONTACT_INFO.phone2.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#25D366',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <MessageCircle size={12} /> Chat
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* Render Active Public Page */}
          <div style={{ flexGrow: 1 }}>{renderPublicView()}</div>

          {/* Floating Contact & WhatsApp Widget */}
          <FloatingContactWidget />

          {/* Page Footer */}
          <footer
            className="no-print"
            style={{
              backgroundColor: '#0F172A',
              color: '#CBD5E1',
              padding: '40px 0 20px 0',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              fontSize: '0.85rem'
            }}
          >
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px', marginBottom: '30px' }}>
              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '12px', fontFamily: 'var(--font-sans)' }}>SV.MAHAL & RESIDENCY</h4>
                <p style={{ color: '#94A3B8', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                  Chengam's luxury AC banquet facility and residency lodging stay destination. Memories begin here.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} color="#C9A227" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    Main Road, Thukkapet, Chengam, Tamil Nadu - 606701
                  </span>
                </div>
              </div>

              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '12px', fontFamily: 'var(--font-sans)' }}>Contact & Helplines</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Desk Phone */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#C9A227', fontSize: '0.9rem' }}>
                        {CONTACT_INFO.phone1.display}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Manager Desk (24/7)</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a
                        href={CONTACT_INFO.phone1.telLink}
                        title="Call Manager Desk"
                        style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#0284C7', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none' }}
                      >
                        Call
                      </a>
                      <a
                        href={CONTACT_INFO.phone1.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp Manager Desk"
                        style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#25D366', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none' }}
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Support Phone */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#C9A227', fontSize: '0.9rem' }}>
                        {CONTACT_INFO.phone2.display}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Reservations & Inquiries</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a
                        href={CONTACT_INFO.phone2.telLink}
                        title="Call Reservations"
                        style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#0284C7', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none' }}
                      >
                        Call
                      </a>
                      <a
                        href={CONTACT_INFO.phone2.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp Reservations"
                        style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#25D366', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none' }}
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '12px', fontFamily: 'var(--font-sans)' }}>Links</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button onClick={() => setView('public/home')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', textAlign: 'left' }}>Home</button>
                  <button onClick={() => setView('public/rooms')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', textAlign: 'left' }}>Rooms Stay</button>
                  <button onClick={() => setView('public/mahal')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', textAlign: 'left' }}>SV Mahal</button>
                  <button onClick={() => setView('public/book')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', textAlign: 'left' }}>Book Now</button>
                  <a href={CONTACT_INFO.address.googleMapsUrl} target="_blank" rel="noreferrer" style={{ color: '#0284C7', textDecoration: 'none', marginTop: '6px', fontSize: '0.8rem' }}>
                    Open Map Directions ↗
                  </a>
                </div>
              </div>
            </div>

            <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748B' }}>
              &copy; {new Date().getFullYear()} SV.MAHAL & SV.RESIDENCY. All rights reserved. | GSTIN: {CONTACT_INFO.gstin}
            </div>
          </footer>

        </div>
      )}

      {/* Stacked Toasts Alerts portal */}
      <ToastContainer />

      {/* Global Booking info modal */}
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Customer OTP Login Modal */}
      <CustomerLoginModal
        isOpen={isCustomerLoginOpen}
        onClose={() => setIsCustomerLoginOpen(false)}
      />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
