import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, Bell, Search, LogOut, LayoutDashboard, 
  Inbox, Users, Bed, Building, DollarSign, Settings, 
  History, BarChart3, Check, ShieldCheck, Globe 
} from 'lucide-react';
import { OnsiteBookingCrm } from './OnsiteBookingCrm';
import { MahalOnsiteBookingCrm } from './MahalOnsiteBookingCrm';
interface CrmLayoutProps {
  children: React.ReactNode;
}

export const CrmLayout: React.FC<CrmLayoutProps> = ({ children }) => {
  const { 
    currentView, setView, currentUserRole, setUserRole, 
    notifications, markNotificationRead, clearNotifications, 
    globalSearch, setSelectedBooking,
    currentLanguage, setLanguage, translate
  } = useApp();

  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [offlineServiceType, setOfflineServiceType] = useState<'room' | 'mahal'>('room');

  // Intercept view navigation for onsite booking
  useEffect(() => {
    if (currentView === 'crm/onsite-booking') {
      setOfflineServiceType('room');
      setIsOfflineModalOpen(true);
      setView('crm/overview');
    } else if (currentView === 'crm/onsite-booking-mahal') {
      setOfflineServiceType('mahal');
      setIsOfflineModalOpen(true);
      setView('crm/overview');
    }
  }, [currentView, setView]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      setSearchResults(globalSearch(val));
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchItemClick = (item: any) => {
    setSearchQuery('');
    setSearchResults([]);
    
    if (item.type === 'Booking' || item.type === 'Invoice') {
      // Find the booking and select it
      // Let's rely on BookingDetailsModal opening automatically by setting context state
      const { bookings } = useApp();
      const bObj = bookings.find(b => b.id === item.id);
      if (bObj) {
        setSelectedBooking(bObj);
      }
    }
    setView(item.hash);
  };

  const unreadNotifs = notifications.filter(n => !n.read);

  // We build navItems dynamically based on role
  const getNavItems = () => {
    if (currentUserRole === 'admin') {
      return [
        { type: 'section', label: translate('section.dashboard') },
        { view: 'crm/overview', label: translate('page.overview'), icon: LayoutDashboard },
        { view: 'crm/reports', label: translate('page.reports'), icon: BarChart3 },

        { type: 'section', label: 'Finance & Billing' },
        { view: 'crm/finance', label: translate('page.finance'), icon: DollarSign },
        { view: 'crm/bill-inventory', label: 'Bill Inventory', icon: Inbox },

        { type: 'section', label: translate('section.hotel_rooms') },
        { view: 'crm/bookings?service=room&source=offline', label: translate('page.offline_bookings'), icon: Inbox },
        { view: 'crm/bookings?service=room&source=online', label: translate('page.online_bookings'), icon: ShieldCheck },
        { view: 'crm/ota-channels', label: 'MakeMyTrip & Goibibo', icon: Globe },
        { view: 'crm/onsite-booking', label: translate('page.onsite_booking'), icon: Bed },

        { type: 'section', label: translate('section.mahal_booking') },
        { view: 'crm/bookings?service=mahal&source=offline', label: translate('page.offline_bookings'), icon: Inbox },
        { view: 'crm/bookings?service=mahal&source=online', label: translate('page.online_bookings'), icon: ShieldCheck },
        { view: 'crm/onsite-booking-mahal', label: 'Onsite Booking', icon: Building },
        { view: 'crm/mahal', label: translate('page.mahal_settings'), icon: Building },

        { type: 'section', label: translate('section.global_data') },
        { view: 'crm/online-requests', label: 'Online Approvals', icon: ShieldCheck },
        { view: 'crm/customers', label: translate('page.customers'), icon: Users },
        { view: 'crm/rooms', label: translate('page.rooms'), icon: Bed },

        { type: 'section', label: 'Security & Settings' },
        { view: 'crm/audit', label: translate('page.audit'), icon: History },
        { view: 'crm/settings', label: translate('page.settings'), icon: Settings }
      ];
    } else {
      // Manager role - no financial data, structured pages
      return [
        { type: 'section', label: translate('section.dashboard') },
        { view: 'crm/overview', label: translate('page.overview'), icon: LayoutDashboard },
        { view: 'crm/reports', label: translate('page.reports'), icon: BarChart3 },
        
        { type: 'section', label: translate('section.hotel_rooms') },
        { view: 'crm/bookings?service=room&source=offline', label: translate('page.offline_bookings'), icon: Inbox },
        { view: 'crm/bookings?service=room&source=online', label: translate('page.online_bookings'), icon: ShieldCheck },
        { view: 'crm/ota-channels', label: 'MakeMyTrip & Goibibo', icon: Globe },
        
        { type: 'section', label: translate('section.mahal_booking') },
        { view: 'crm/bookings?service=mahal&source=offline', label: translate('page.offline_bookings'), icon: Inbox },
        { view: 'crm/bookings?service=mahal&source=online', label: translate('page.online_bookings'), icon: ShieldCheck },
        { view: 'crm/onsite-booking-mahal', label: 'Onsite Booking', icon: Building },
        
        { type: 'section', label: translate('section.global_data') },
        { view: 'crm/online-requests', label: 'Online Approvals', icon: ShieldCheck },
        { view: 'crm/customers', label: translate('page.customers'), icon: Users },
        { view: 'crm/rooms', label: translate('page.rooms'), icon: Bed },
        { view: 'crm/settings', label: translate('page.settings'), icon: Settings }
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="grid-dashboard no-print" style={{ backgroundColor: '#F1F5F9', minHeight: '100vh', display: 'flex', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      
      {/* 1. SIDEBAR PANEL */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 90, backdropFilter: 'blur(4px)' }} 
        />
      )}
      <aside
        style={{
          width: isSidebarOpen ? 'var(--sidebar-width)' : '0px',
          minWidth: isSidebarOpen ? 'var(--sidebar-width)' : '0px',
          background: 'var(--sidebar-gradient)',
          color: '#FFFFFF',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          overflow: 'hidden',
          position: isMobile ? 'fixed' : 'relative',
          left: isMobile ? 0 : 'auto',
          top: isMobile ? 0 : 'auto',
          height: '100vh',
          boxShadow: '4px 0 15px rgba(0,0,0,0.1)'
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '16px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '2px solid #C9A227',
              boxShadow: '0 0 10px rgba(201, 162, 39, 0.4)',
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
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
              SV. MAHAL <span style={{ color: '#C9A227' }}>&</span> RESIDENCY
            </div>
            <div style={{ fontSize: '0.62rem', color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Management Portal
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ flexGrow: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item, index) => {
            if ('type' in item && item.type === 'section') {
              return (
                <div
                  key={`sec-${index}`}
                  style={{
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '16px 16px 4px 16px',
                    whiteSpace: 'nowrap',
                    marginTop: index > 0 ? '8px' : '0'
                  }}
                >
                  {item.label}
                </div>
              );
            }

            const navItem = item as { view: string; label: string; icon: React.ComponentType<any> };
            const Icon = navItem.icon;
            const isActive = currentView === navItem.view;

            return (
              <button
                key={navItem.view}
                onClick={() => {
                  setView(navItem.view);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: '#FFFFFF',
                  fontWeight: isActive ? 700 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  width: '100%',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={18} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                <span>{navItem.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Floating SV Command Box (Lorem Ipsum box from mockup) */}
        <div style={{ padding: '16px', margin: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 style={{ fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SV COMMAND</h3>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.4, marginBottom: '12px' }}>
            Fast guest search, Mugurtham scheduling, and billing controls active.
          </p>
          <button
            onClick={() => setView('crm/settings')}
            style={{ width: '100%', padding: '8px', border: 'none', borderRadius: '8px', backgroundColor: '#FACC15', color: '#0F172A', fontWeight: 750, fontSize: '0.75rem', cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            CRM CONTROLS
          </button>
        </div>
      </aside>
      {/* 2. MAIN LAYOUT AND HEADER */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', flexGrow: 1, width: isMobile ? '100%' : (isSidebarOpen ? 'calc(100% - var(--sidebar-width))' : '100%'), transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        
        {/* Header Bar */}
        <header
          style={{
            height: '68px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Left search & menu toggle & pill tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <Menu size={18} />
            </button>

            {/* Global Search box */}
            <div ref={searchRef} style={{ position: 'relative', width: '240px' }} className="desktop-only">
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '6px 14px', backgroundColor: '#F8FAFC', transition: 'border-color 0.2s' }}>
                <Search size={14} color="#94A3B8" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Global Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.8rem', color: '#1E293B', fontWeight: 600 }}
                />
              </div>

              {/* Suggestions Dropdown */}
              {searchResults.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '42px',
                    left: 0,
                    right: 0,
                    width: '320px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.05)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 200
                  }}
                >
                  <div style={{ padding: '10px 14px', fontSize: '0.65rem', color: '#94A3B8', fontWeight: 800, borderBottom: '1px solid #F1F5F9', letterSpacing: '0.05em' }}>
                    SEARCH SUGGESTIONS
                  </div>
                  {searchResults.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => handleSearchItemClick(item)}
                      style={{
                        padding: '12px 14px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{item.title}</span>
                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 700 }}>{item.type}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.subtitle}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right widgets (Notifications & Profiles) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* LANGUAGE SELECTOR */}
            <div style={{ position: 'relative' }}>
              <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ta')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  paddingRight: '28px',
                  backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\'%3E%3Cpath d=\'M7 9l3 3 3-3\' stroke=\'%23475569\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  backgroundSize: '14px'
                }}
              >
                <option value="en">🇬🇧 EN</option>
                <option value="ta">🇮🇳 தமிழ்</option>
              </select>
            </div>
            
            {/* NOTIFICATIONS BELL DROPDOWN */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  color: '#475569',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <Bell size={18} />
                {unreadNotifs.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    {unreadNotifs.length}
                  </div>
                )}
              </button>

              {isNotifOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: '-10px',
                    width: '320px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                    zIndex: 200,
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>Notifications</span>
                    <button type="button" onClick={clearNotifications} style={{ border: 'none', background: 'none', color: '#4F46E5', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                      Clear All
                    </button>
                  </div>
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            setIsNotifOpen(false);
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: n.read ? '#FFFFFF' : '#F0F9FF',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: n.read ? 600 : 700, color: '#1E293B' }}>{n.title}</span>
                            <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', lineHeight: 1.3 }}>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar with Online indicator */}
            <div style={{ position: 'relative', width: '38px', height: '38px', cursor: 'pointer' }} onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                alt="User Profile"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6C28D9', boxShadow: '0 2px 6px rgba(108, 40, 217, 0.15)' }}
              />
              <div style={{ position: 'absolute', bottom: '0', right: '0', width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid #FFFFFF' }} />
              
              {isProfileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '180px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                    zIndex: 200,
                    padding: '6px 0'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '8px 12px', fontSize: '0.65rem', color: '#94A3B8', fontWeight: 800, borderBottom: '1px solid #F1F5F9', letterSpacing: '0.05em' }}>
                    SWITCH ROLE
                  </div>
                  <button
                    onClick={() => {
                      setUserRole('admin');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: '#334155',
                      fontWeight: currentUserRole === 'admin' ? 700 : 500,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>Administrator</span>
                    {currentUserRole === 'admin' && <Check size={14} color="#16A34A" />}
                  </button>
                  <button
                    onClick={() => {
                      setUserRole('manager');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: '#334155',
                      fontWeight: currentUserRole === 'manager' ? 700 : 500,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>Duty Manager</span>
                    {currentUserRole === 'manager' && <Check size={14} color="#16A34A" />}
                  </button>
                  <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />
                  <button
                    onClick={() => {
                      setUserRole('public');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: '#DC2626',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <LogOut size={14} /> Exit CRM view
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content viewport */}
        <main style={{ padding: '24px', flexGrow: 1, backgroundColor: '#F1F5F9' }}>
          {children}
        </main>
      </div>

      {/* Offline Booking Modal Popup */}
      {isOfflineModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOfflineModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '1000px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
          >
            {offlineServiceType === 'mahal' ? (
              <MahalOnsiteBookingCrm onClose={() => setIsOfflineModalOpen(false)} />
            ) : (
              <OnsiteBookingCrm 
                initialServiceType={offlineServiceType}
                onClose={() => setIsOfflineModalOpen(false)} 
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
};
