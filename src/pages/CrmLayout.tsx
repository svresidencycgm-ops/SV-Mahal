import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, Search, LogOut, LayoutDashboard, 
  Inbox, Users, Bed, Building, DollarSign, Settings, 
  History, BarChart3, Check, ShieldCheck, Globe,
  MessageSquare, Heart, Droplets, User, Camera
} from 'lucide-react';
import { OnsiteBookingCrm } from './OnsiteBookingCrm';
import { MahalOnsiteBookingCrm } from './MahalOnsiteBookingCrm';
import { uploadToCloudinary } from '../services/cloudinary';
interface CrmLayoutProps {
  children: React.ReactNode;
}

export const CrmLayout: React.FC<CrmLayoutProps> = ({ children }) => {
  const { 
    currentView, setView, currentUserRole, setUserRole, 
    globalSearch, setSelectedBooking, bookings,
    currentLanguage, setLanguage, translate, addToast
  } = useApp();

  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem('sv_user_avatar') || '';
  });
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUserAvatar(base64);
      localStorage.setItem('sv_user_avatar', base64);
      addToast('Profile Updated', 'Profile photo updated successfully.', 'success');
      try {
        const res = await uploadToCloudinary(base64, 'sv_residency_profiles');
        if (res.isCloudinary && res.url) {
          setUserAvatar(res.url);
          localStorage.setItem('sv_user_avatar', res.url);
        }
      } catch (err) {
        console.warn('Profile image Cloudinary upload deferred:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePic = () => {
    setUserAvatar('');
    localStorage.removeItem('sv_user_avatar');
    addToast('Profile Updated', 'Profile photo removed. Showing default icon.', 'info');
  };

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
      const bObj = bookings.find(b => b.id === item.id);
      if (bObj) {
        setSelectedBooking(bObj);
      }
    }
    setView(item.hash);
  };

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

  const getPageTitle = (view: string) => {
    if (view === 'crm/overview') return 'Dashboard';
    if (view === 'crm/reports') return 'Analytics & Reports';
    if (view === 'crm/finance') return 'Finance & Ledger';
    if (view === 'crm/bill-inventory') return 'Bill Inventory';
    if (view.includes('service=room')) return 'Hotel Rooms Desk';
    if (view.includes('service=mahal')) return 'SV Mahal Banquet';
    if (view.includes('ota-channels')) return 'MakeMyTrip & Goibibo';
    if (view.includes('online-requests')) return 'Online Approvals';
    if (view.includes('customers')) return 'Guest Profiles';
    if (view.includes('rooms')) return 'Room Inventory';
    if (view.includes('mahal')) return 'Mahal Settings';
    if (view.includes('audit')) return 'Security Audit Logs';
    if (view.includes('settings')) return 'System Settings';
    return 'Dashboard';
  };

  return (
    <div 
      className="grid-dashboard no-print admin-crm-page crm-portal" 
      style={{ 
        backgroundColor: '#F1F5F9', 
        minHeight: '100vh', 
        display: 'flex', 
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: "var(--font-crm-sans, 'Aptos', 'Times New Roman', Times, serif)"
      }}
    >
      
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
        
        {/* Header Bar matching Mockup */}
        <header
          style={{
            height: '76px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #EEF2F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
          }}
        >
          {/* Left: Menu toggle & Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            >
              <Menu size={18} />
            </button>

            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1E293B', margin: 0, letterSpacing: '-0.02em' }}>
                {getPageTitle(currentView)}
              </h1>
            </div>
          </div>

          {/* Center: Search Here pill input */}
          <div ref={searchRef} style={{ position: 'relative', width: '380px' }} className="desktop-only">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '9999px',
                padding: '10px 20px',
                backgroundColor: '#F4F7FE',
                border: '1px solid transparent',
                transition: 'all 0.2s ease',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              <input
                type="text"
                placeholder="Search here"
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.85rem',
                  color: '#1E293B',
                  fontWeight: 500
                }}
              />
              <Search size={18} color="#6320EE" style={{ marginLeft: '8px', cursor: 'pointer', flexShrink: 0 }} />
            </div>

            {/* Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  left: 0,
                  right: 0,
                  width: '380px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.05)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '10px 16px', fontSize: '0.65rem', color: '#94A3B8', fontWeight: 800, borderBottom: '1px solid #F1F5F9', letterSpacing: '0.05em' }}>
                  SEARCH SUGGESTIONS
                </div>
                {searchResults.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => handleSearchItemClick(item)}
                    style={{
                      padding: '12px 16px',
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

          {/* Right widgets (Mockup pill icons & User Profile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* LANGUAGE SELECTOR */}
            <div style={{ position: 'relative' }}>
              <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ta')}
                style={{
                  padding: '7px 12px',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  paddingRight: '24px',
                  backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\'%3E%3Cpath d=\'M7 9l3 3 3-3\' stroke=\'%23475569\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '12px'
                }}
              >
                <option value="en">🇬🇧 EN</option>
                <option value="ta">🇮🇳 தமிழ்</option>
              </select>
            </div>

            {/* MESSAGE ICON PILL (Mockup) */}
            <button
              type="button"
              title="Guest Inquiries"
              onClick={() => setView('crm/customers')}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                color: '#6320EE',
                boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <MessageSquare size={17} />
              <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            </button>



            {/* HEART / FAVORITES PILL (Mockup) */}
            <button
              type="button"
              title="Quick Action"
              onClick={() => setView('crm/overview')}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                color: '#6320EE',
                boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <Heart size={17} />
              <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            </button>

            {/* USER PROFILE PILL - "Welcome Admin" or "Welcome Manager" (Mockup) */}
            <div
              style={{ position: 'relative' }}
            >
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '4px 10px 4px 6px',
                  borderRadius: '30px',
                  transition: 'background 0.2s',
                  marginLeft: '4px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="User Avatar"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6320EE' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        backgroundColor: '#EDE9FE',
                        color: '#6320EE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #6320EE'
                      }}
                      title="Default Admin / Manager Icon"
                    >
                      <User size={20} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid #FFFFFF' }} />
                </div>

                <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
                    {currentUserRole === 'admin' ? 'Welcome Admin' : 'Welcome Manager'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>
                    {currentUserRole === 'admin' ? 'Superadmin' : 'Duty Manager'}
                  </span>
                </div>
              </div>

              {isProfileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '230px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                    zIndex: 200,
                    padding: '10px 0'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Profile Header & Upload Action */}
                  <div style={{ padding: '4px 14px 12px 14px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6320EE', border: '1.5px solid #6320EE' }}>
                        {userAvatar ? (
                          <img src={userAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1E293B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {currentUserRole === 'admin' ? 'Welcome Admin' : 'Welcome Manager'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                          {currentUserRole === 'admin' ? 'Superadmin' : 'Duty Manager'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => profileFileInputRef.current?.click()}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        backgroundColor: '#F3E8FF',
                        color: '#6320EE',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'background 0.2s',
                        marginBottom: userAvatar ? '6px' : '0'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E9D5FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F3E8FF')}
                    >
                      <Camera size={14} /> {userAvatar ? 'Update Photo (Cloudinary)' : 'Upload Photo (Cloudinary)'}
                    </button>

                    {userAvatar && (
                      <button
                        onClick={handleRemoveProfilePic}
                        style={{
                          width: '100%',
                          padding: '5px 10px',
                          backgroundColor: 'transparent',
                          color: '#EF4444',
                          border: '1px solid #FEE2E2',
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        Reset to Dummy Icon
                      </button>
                    )}

                    <input
                      type="file"
                      ref={profileFileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleProfilePicChange}
                    />
                  </div>

                  <div style={{ padding: '8px 14px 4px 14px', fontSize: '0.65rem', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.05em' }}>
                    SWITCH ROLE
                  </div>
                  <button
                    onClick={() => {
                      setUserRole('admin');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
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
                      padding: '10px 14px',
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
                      padding: '10px 14px',
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

        {/* Floating Settings & Theme Tab (matching Mockup) */}
        <div
          style={{
            position: 'fixed',
            right: 0,
            top: '240px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            backgroundColor: '#2563EB',
            padding: '4px',
            borderTopLeftRadius: '10px',
            borderBottomLeftRadius: '10px',
            boxShadow: '-2px 4px 12px rgba(37, 99, 235, 0.3)'
          }}
        >
          <button
            type="button"
            title="System Settings"
            onClick={() => setView('crm/settings')}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              background: 'transparent',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '6px'
            }}
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            title="Toggle Language"
            onClick={() => setLanguage(currentLanguage === 'en' ? 'ta' : 'en')}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              background: 'transparent',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '6px'
            }}
          >
            <Droplets size={18} />
          </button>
        </div>

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
