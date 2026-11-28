import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, Search, LogOut, LayoutDashboard, 
  Inbox, Users, Bed, Building, DollarSign, Settings, 
  History, BarChart3, Check, ShieldCheck, Globe,
  Bell, User, Camera, ChevronDown, ChevronRight, Plus, X,
  DoorOpen
} from 'lucide-react';
import { OnsiteBookingCrm } from './OnsiteBookingCrm';
import { MahalOnsiteBookingCrm } from './MahalOnsiteBookingCrm';
import { uploadToCloudinary } from '../services/cloudinary';
import { subscribeToOperationalEvents } from '../utils/operationalEvents';
import { playBellSound } from '../utils/soundEffects';
interface CrmLayoutProps {
  children: React.ReactNode;
}

export const CrmLayout: React.FC<CrmLayoutProps> = ({ children }) => {
  const { 
    currentView, setView, currentUserRole, authenticatedRole, setUserRole, 
    globalSearch, setSelectedBooking, bookings, rooms,
    currentLanguage, setLanguage, addToast
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(window.innerWidth <= 1024);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const compact = window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsTabletOrMobile(compact);
      if (compact) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-time operational audio notification listener for Admin & Manager panels
  useEffect(() => {
    if (currentUserRole !== 'admin' && currentUserRole !== 'manager') return;

    const unsubscribe = subscribeToOperationalEvents((event) => {
      // Ring small bell chime on Admin and Manager panel!
      playBellSound();

      if (event.type === 'NEW_BOOKING') {
        addToast('🛎️ New Booking Received!', event.message, 'success');
      } else if (event.type === 'USER_REGISTERED') {
        addToast('👤 New User Registered', event.message, 'info');
      }
    });

    return () => unsubscribe();
  }, [currentUserRole, addToast]);
  
  // Search state and dropdown refs
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
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

  // Categorized navigation buckets dynamically structured for Admin and Manager roles
  interface NavBucketItem {
    view: string;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
  }

  interface NavBucket {
    id: string;
    title: string;
    badge?: string;
    items: NavBucketItem[];
  }

  const getNavBuckets = (): NavBucket[] => {
    const invCount = rooms.length;

    if (currentUserRole === 'admin') {
      return [
        {
          id: 'executive',
          title: '📊 Executive & Analytics',
          badge: 'HQ',
          items: [
            { view: 'crm/overview', label: '📊 Dashboard Overview', icon: LayoutDashboard },
            { view: 'crm/reports', label: '📈 Analytics & Reports', icon: BarChart3 }
          ]
        },
        {
          id: 'finance',
          title: '💰 Revenue & Finance',
          badge: 'Admin',
          items: [
            { view: 'crm/finance', label: '💵 Cash Flow & Ledger', icon: DollarSign },
            { view: 'crm/bill-inventory', label: '🧾 Tax Invoices & Bills', icon: Inbox }
          ]
        },
        {
          id: 'rooms',
          title: '🏨 Residency Operations',
          badge: 'Hotel',
          items: [
            { view: 'crm/door-matrix', label: '🚪 Live Door Matrix', icon: DoorOpen, badge: 'Live' },
            { view: 'crm/bookings?service=room&source=offline', label: '🛎️ Front Desk Bookings', icon: Inbox },
            { view: 'crm/bookings?service=room&source=online', label: '🌐 Online Room Stays', icon: ShieldCheck },
            { view: 'crm/ota-channels', label: '✈️ MakeMyTrip & Goibibo', icon: Globe },
            { view: 'crm/onsite-booking', label: '✨ Walk-in Check-In', icon: Bed }
          ]
        },
        {
          id: 'mahal',
          title: '🏛️ SV Mahal Banquets',
          badge: 'Mandapam',
          items: [
            { view: 'crm/bookings?service=mahal&source=offline', label: '🏛️ Mahal Offline Bookings', icon: Building },
            { view: 'crm/bookings?service=mahal&source=online', label: '💍 Online Wedding Requests', icon: ShieldCheck },
            { view: 'crm/onsite-booking-mahal', label: '🎪 Mahal Walk-In Booking', icon: Building },
            { view: 'crm/mahal', label: '⚙️ Hall Configuration', icon: Settings }
          ]
        },
        {
          id: 'directory',
          title: '📋 Master Directory',
          badge: 'Inventory',
          items: [
            { view: 'crm/online-requests', label: '✅ Online Approvals', icon: ShieldCheck },
            { view: 'crm/customers', label: '👥 Guest Profiles', icon: Users },
            { view: 'crm/rooms', label: `🔑 Room Inventory (${invCount})`, icon: Bed }
          ]
        },
        {
          id: 'security',
          title: '🛡️ Security & System',
          badge: 'Logs',
          items: [
            { view: 'crm/audit', label: '📜 Security Audit Logs', icon: History },
            { view: 'crm/settings', label: '⚙️ System Settings', icon: Settings }
          ]
        }
      ];
    } else {
      // Manager role - focused operations, without admin ledger
      return [
        {
          id: 'operations',
          title: '📊 Operations Desk',
          badge: 'Daily',
          items: [
            { view: 'crm/overview', label: '📊 Dashboard Overview', icon: LayoutDashboard },
            { view: 'crm/reports', label: '📈 Daily Reports', icon: BarChart3 }
          ]
        },
        {
          id: 'rooms',
          title: '🏨 Residency Front Desk',
          badge: 'Hotel',
          items: [
            { view: 'crm/door-matrix', label: '🚪 Live Door Matrix', icon: DoorOpen, badge: 'Live' },
            { view: 'crm/bookings?service=room&source=offline', label: '🛎️ Front Desk Bookings', icon: Inbox },
            { view: 'crm/bookings?service=room&source=online', label: '🌐 Online Stays', icon: ShieldCheck },
            { view: 'crm/ota-channels', label: '✈️ OTAs (MMT/Goibibo)', icon: Globe },
            { view: 'crm/onsite-booking', label: '✨ Walk-in Check-In', icon: Bed }
          ]
        },
        {
          id: 'mahal',
          title: '🏛️ SV Mahal Banquets',
          badge: 'Events',
          items: [
            { view: 'crm/bookings?service=mahal&source=offline', label: '🏛️ Mahal Bookings', icon: Building },
            { view: 'crm/bookings?service=mahal&source=online', label: '💍 Event Requests', icon: ShieldCheck },
            { view: 'crm/onsite-booking-mahal', label: '🎪 Mahal Walk-In', icon: Building }
          ]
        },
        {
          id: 'directory',
          title: '📋 Directory & Inventory',
          badge: 'Database',
          items: [
            { view: 'crm/online-requests', label: '✅ Online Approvals', icon: ShieldCheck },
            { view: 'crm/customers', label: '👥 Guest Profiles', icon: Users },
            { view: 'crm/rooms', label: `🔑 Room Status (${invCount})`, icon: Bed }
          ]
        },
        {
          id: 'terminal',
          title: '⚙️ Terminal Settings',
          items: [
            { view: 'crm/settings', label: '⚙️ System Settings', icon: Settings }
          ]
        }
      ];
    }
  };

  const navBuckets = getNavBuckets();

  const getPageBreadcrumb = (view: string) => {
    if (view === 'crm/overview') return { category: 'Executive Suite', title: '📊 Dashboard Overview' };
    if (view === 'crm/door-matrix') return { category: 'Residency Operations', title: '🚪 Live Door Matrix' };
    if (view === 'crm/reports') return { category: 'Executive Suite', title: '📈 Analytics & Financial Reports' };
    if (view === 'crm/finance') return { category: 'Revenue & Accounts', title: '💵 Cash Flow & Ledger' };
    if (view === 'crm/bill-inventory') return { category: 'Revenue & Accounts', title: '🧾 Tax Invoices & Bill Inventory' };
    if (view.includes('service=room')) return { category: 'Residency Operations', title: '🛎️ Hotel Rooms & Stays Desk' };
    if (view.includes('service=mahal')) return { category: 'SV Mahal Banquets', title: '🏛️ Grand Mandapam Bookings' };
    if (view.includes('ota-channels')) return { category: 'Channel Manager', title: '✈️ MakeMyTrip & Goibibo OTAs' };
    if (view.includes('online-requests')) return { category: 'Master Directory', title: '✅ Online Approvals Queue' };
    if (view.includes('customers')) return { category: 'Master Directory', title: '👥 Guest Profiles & Directory' };
    if (view.includes('rooms')) return { category: 'Master Directory', title: `🔑 Room Inventory (${rooms.length} Keys)` };
    if (view.includes('mahal')) return { category: 'SV Mahal Banquets', title: '🎪 Hall Configuration & Tariffs' };
    if (view.includes('audit')) return { category: 'Security & System', title: '📜 Security Audit Logs' };
    if (view.includes('settings')) return { category: 'Security & System', title: '⚙️ System Configuration' };
    return { category: 'Administration', title: 'Operational Overview' };
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
      {isTabletOrMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', zIndex: 999, backdropFilter: 'blur(4px)' }} 
        />
      )}
      <aside
        style={{
          width: isSidebarOpen ? (isMobile ? '265px' : 'var(--sidebar-width)') : '0px',
          minWidth: isSidebarOpen ? (isMobile ? '265px' : 'var(--sidebar-width)') : '0px',
          maxWidth: isTabletOrMobile ? '85vw' : 'none',
          background: 'var(--sidebar-gradient)',
          color: '#FFFFFF',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          position: isTabletOrMobile ? 'fixed' : 'relative',
          left: isTabletOrMobile ? 0 : 'auto',
          top: isTabletOrMobile ? 0 : 'auto',
          height: '100vh',
          boxShadow: '4px 0 20px rgba(0,0,0,0.22)'
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #2563EB',
              boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)',
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
              style={{ width: '90%', height: '90%', objectFit: 'contain' }} 
            />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
              SV. MAHAL <span style={{ color: '#3B82F6' }}>&</span> RESIDENCY
            </div>
            <div style={{ fontSize: '0.62rem', color: '#93C5FD', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
              {currentUserRole === 'admin' ? 'Admin Operations Portal' : 'Manager Duty Portal'}
            </div>
          </div>
          </div>
          {isTabletOrMobile && (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setIsSidebarOpen(false)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Categorized Navigation Buckets - Strict Blue, Red & White Theme */}
        <nav style={{ flexGrow: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {navBuckets.map((bucket) => {
            const hasActiveItem = bucket.items.some(item => currentView === item.view);

            return (
              <div
                key={bucket.id}
                style={{
                  backgroundColor: hasActiveItem ? 'rgba(37, 99, 235, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: hasActiveItem ? '1px solid rgba(37, 99, 235, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '8px 6px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Bucket Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px 8px 8px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: hasActiveItem ? '#93C5FD' : 'rgba(255, 255, 255, 0.6)'
                  }}>
                    {bucket.title}
                  </span>
                  {bucket.badge && (
                    <span style={{
                      fontSize: '0.55rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      backgroundColor: bucket.badge === 'Admin' || bucket.badge === 'HQ' ? '#DC2626' : (hasActiveItem ? '#2563EB' : 'rgba(255, 255, 255, 0.1)'),
                      color: '#FFFFFF'
                    }}>
                      {bucket.badge}
                    </span>
                  )}
                </div>

                {/* Bucket Nav Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {bucket.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.view;

                    return (
                      <button
                        key={item.view}
                        onClick={() => {
                          setView(item.view);
                          if (isTabletOrMobile) setIsSidebarOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: isActive ? '#2563EB' : 'transparent',
                          color: '#FFFFFF',
                          borderLeft: isActive ? '3px solid #FFFFFF' : '3px solid transparent',
                          fontWeight: isActive ? 800 : 500,
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          transition: 'all 0.15s ease',
                          width: '100%',
                          whiteSpace: 'nowrap',
                          boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.35)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.16)';
                            e.currentTarget.style.color = '#FFFFFF';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#FFFFFF';
                          }
                        }}
                      >
                        <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.8, color: isActive ? '#FFFFFF' : '#93C5FD' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Command Box at bottom - Blue, Red, White */}
        <div style={{ padding: '16px', margin: '14px', borderRadius: '14px', background: 'linear-gradient(135deg, #1E3A8A 0%, #0F243E 100%)', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
            <h3 style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ADMIN FAST TRACK</h3>
          </div>
          <p style={{ fontSize: '0.66rem', color: '#93C5FD', lineHeight: 1.4, margin: '4px 0 12px 0' }}>
            Instant room check-ins, guest billing, and muhurtham scheduling active.
          </p>
          <button
            onClick={() => setView('crm/settings')}
            style={{ width: '100%', padding: '9px', border: 'none', borderRadius: '8px', backgroundColor: '#DC2626', color: '#FFFFFF', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B91C1C')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
          >
            SYSTEM CONTROLS
          </button>
        </div>
      </aside>
      {/* 2. MAIN LAYOUT AND HEADER */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, minWidth: 0, width: isTabletOrMobile ? '100%' : (isSidebarOpen ? 'calc(100% - var(--sidebar-width))' : '100%'), transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        
        {/* Header Bar - Modern Executive Blue/Red/White Module Header */}
        <header
          style={{
            height: isMobile ? '64px' : '76px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1.5px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 12px' : '0 28px',
            gap: isMobile ? '8px' : '20px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
          }}
        >
          {/* Left: Menu toggle & Hierarchy Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '16px', minWidth: 0, flex: 1 }}>
            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1E293B',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EFF6FF';
                e.currentTarget.style.borderColor = '#BFDBFE';
                e.currentTarget.style.color = '#2563EB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.color = '#1E293B';
              }}
            >
              <Menu size={19} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
              {!isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                  <span style={{ textTransform: 'uppercase', color: '#64748B' }}>
                    {getPageBreadcrumb(currentView).category}
                  </span>
                  <ChevronRight size={12} color="#94A3B8" />
                  <span style={{ color: '#2563EB' }}>
                    {getPageBreadcrumb(currentView).title}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <h1 style={{
                  fontSize: isMobile ? '1.05rem' : '1.32rem',
                  fontWeight: 850,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {getPageBreadcrumb(currentView).title}
                </h1>
                {!isMobile && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FEE2E2',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      color: '#DC2626',
                      flexShrink: 0
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
                    DESK LIVE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Interactive Omnisearch bar */}
          <div ref={searchRef} style={{ position: 'relative', width: 'clamp(200px, 20vw, 340px)', flexShrink: 1 }} className="desktop-only">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '12px',
                padding: '8px 14px',
                backgroundColor: '#F8FAFC',
                border: searchQuery ? '1.5px solid #2563EB' : '1.5px solid #E2E8F0',
                transition: 'all 0.2s ease',
                boxShadow: searchQuery ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none'
              }}
            >
              <Search size={16} color="#2563EB" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search bookings, rooms, guests, bills..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.82rem',
                  color: '#0F172A',
                  fontWeight: 600
                }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', color: '#64748B' }}
                >
                  <X size={15} />
                </button>
              ) : (
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 5px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#64748B', flexShrink: 0 }}>
                  ⌘K
                </span>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  left: 0,
                  right: 0,
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '14px',
                  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.12)',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '10px 14px', fontSize: '0.65rem', color: '#64748B', fontWeight: 800, borderBottom: '1px solid #F1F5F9', letterSpacing: '0.05em' }}>
                  SEARCH RESULTS ({searchResults.length})
                </div>
                {searchResults.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => handleSearchItemClick(item)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>{item.title}</span>
                      <span
                        style={{
                          fontSize: '0.64rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: item.type === 'Booking' ? '#EFF6FF' : (item.type === 'Invoice' ? '#FEF2F2' : '#F1F5F9'),
                          color: item.type === 'Booking' ? '#2563EB' : (item.type === 'Invoice' ? '#DC2626' : '#0F172A'),
                          fontWeight: 800
                        }}
                      >
                        {item.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{item.subtitle}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Controls: Quick Check-In + Alerts Bell + Language Switch + User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flexShrink: 0 }}>
            
            {/* 1. Quick Room Check-In Action Button */}
            <button
              type="button"
              onClick={() => {
                setOfflineServiceType('room');
                setIsOfflineModalOpen(true);
              }}
              className="desktop-only"
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Check-In</span>
            </button>

            <button
              type="button"
              title="New Room Check-In"
              onClick={() => {
                setOfflineServiceType('room');
                setIsOfflineModalOpen(true);
              }}
              className="mobile-only"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                flexShrink: 0
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>

            {/* 2. Interactive Operational Alerts Popover (Bell) */}
            <div ref={notificationRef} style={{ position: 'relative' }}>
              <button
                type="button"
                title="Operational Alerts"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: isNotificationsOpen ? '#EFF6FF' : '#FFFFFF',
                  border: isNotificationsOpen ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  color: '#2563EB',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isNotificationsOpen) e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  if (!isNotificationsOpen) e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <Bell size={18} />
                {bookings.filter(b => b.status === 'Inquiry').length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 4px',
                      borderRadius: '9999px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #FFFFFF'
                    }}
                  >
                    {bookings.filter(b => b.status === 'Inquiry').length}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: isMobile ? '-48px' : 0,
                    width: isMobile ? 'min(320px, calc(100vw - 24px))' : '330px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '14px',
                    boxShadow: '0 16px 36px rgba(15, 23, 42, 0.15)',
                    zIndex: 210,
                    overflow: 'hidden'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>Operational Alerts</span>
                      <span style={{ fontSize: '0.64rem', padding: '2px 6px', borderRadius: '9999px', backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: 800 }}>
                        {bookings.filter(b => b.status === 'Inquiry').length} Pending
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(false)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', display: 'flex', padding: 0 }}
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                    {bookings.filter(b => b.status === 'Inquiry').length > 0 ? (
                      bookings.filter(b => b.status === 'Inquiry').slice(0, 4).map((inq) => (
                        <div
                          key={inq.id}
                          onClick={() => {
                            setSelectedBooking(inq);
                            setView(inq.serviceType === 'mahal' ? 'crm/bookings?service=mahal' : 'crm/bookings?service=room');
                            setIsNotificationsOpen(false);
                          }}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid #F1F5F9',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>{inq.guestName || 'Inquiry Guest'}</span>
                            <span style={{ fontSize: '0.64rem', padding: '2px 6px', borderRadius: '6px', backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: 800 }}>
                              {inq.serviceType === 'mahal' ? 'Mahal' : 'Room'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            {inq.checkIn} • Needs front desk verification
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px 16px', textAlign: 'center', color: '#64748B', fontSize: '0.78rem' }}>
                        No pending inquiries. All desks are clear!
                      </div>
                    )}

                    {/* System Sync Note */}
                    <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>
                        Reception desk connected. {rooms.length} room inventory active.
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '8px 14px', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setView('crm/customers');
                        setIsNotificationsOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #DBEAFE',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      View Master Queue →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Professional Language Switch (Segmented Control - Desktop) */}
            <div
              className="desktop-only"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '3px'
              }}
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                style={{
                  border: 'none',
                  padding: '5px 9px',
                  borderRadius: '7px',
                  backgroundColor: currentLanguage === 'en' ? '#2563EB' : 'transparent',
                  color: currentLanguage === 'en' ? '#FFFFFF' : '#475569',
                  fontWeight: currentLanguage === 'en' ? 800 : 700,
                  fontSize: '0.73rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                style={{
                  border: 'none',
                  padding: '5px 9px',
                  borderRadius: '7px',
                  backgroundColor: currentLanguage === 'ta' ? '#2563EB' : 'transparent',
                  color: currentLanguage === 'ta' ? '#FFFFFF' : '#475569',
                  fontWeight: currentLanguage === 'ta' ? 800 : 700,
                  fontSize: '0.73rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                தமிழ்
              </button>
            </div>

            {/* 4. Executive User Profile & Role Switcher */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '4px 10px 4px 6px',
                  borderRadius: '12px',
                  border: isProfileOpen ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: isProfileOpen ? '#EFF6FF' : '#FFFFFF',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isProfileOpen) e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isProfileOpen) e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <div style={{ position: 'relative', width: '38px', height: '38px', flexShrink: 0 }}>
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="User Avatar"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563EB' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #2563EB'
                      }}
                    >
                      <User size={19} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '0', right: '0', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#2563EB', border: '2px solid #FFFFFF' }} />
                </div>

                <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                    {currentUserRole === 'admin' ? 'Superadmin' : 'Duty Manager'}
                  </span>
                  <span style={{ fontSize: '0.67rem', color: '#2563EB', fontWeight: 700 }}>
                    Chengam HQ
                  </span>
                </div>
                <ChevronDown size={14} color="#64748B" className="desktop-only" />
              </div>

              {isProfileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: 'min(240px, calc(100vw - 24px))',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '14px',
                    boxShadow: '0 16px 36px rgba(15, 23, 42, 0.14)',
                    zIndex: 220,
                    padding: '8px 0'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Profile Header & Upload Action */}
                  <div style={{ padding: '6px 14px 12px 14px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1.5px solid #2563EB' }}>
                        {userAvatar ? (
                          <img src={userAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {currentUserRole === 'admin' ? 'Superadmin' : 'Duty Manager'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#2563EB', fontWeight: 700 }}>
                          Chengam Desk Portal
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => profileFileInputRef.current?.click()}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        border: '1px solid #DBEAFE',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'background 0.2s',
                        marginBottom: userAvatar ? '6px' : '0'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DBEAFE')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                    >
                      <Camera size={14} /> {userAvatar ? 'Update Photo' : 'Upload Photo'}
                    </button>

                    <div className="mobile-only" style={{ marginTop: '8px', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: currentLanguage === 'en' ? '#2563EB' : '#F8FAFC', color: currentLanguage === 'en' ? '#FFFFFF' : '#475569', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('ta')}
                        style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: currentLanguage === 'ta' ? '#2563EB' : '#F8FAFC', color: currentLanguage === 'ta' ? '#FFFFFF' : '#475569', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        தமிழ்
                      </button>
                    </div>

                    {userAvatar && (
                      <button
                        onClick={handleRemoveProfilePic}
                        style={{
                          width: '100%',
                          padding: '5px 10px',
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          border: '1px solid #FEE2E2',
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        Reset Icon
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

                  {/* Switch Role Section — Only available when authenticated as Admin */}
                  {authenticatedRole === 'admin' ? (
                    <>
                      <div style={{ padding: '8px 14px 4px 14px', fontSize: '0.65rem', color: '#64748B', fontWeight: 800, letterSpacing: '0.05em' }}>
                        SWITCH OPERATIONAL ROLE
                      </div>
                      <button
                        onClick={() => {
                          setUserRole('admin');
                          setIsProfileOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '9px 14px',
                          border: 'none',
                          backgroundColor: currentUserRole === 'admin' ? '#EFF6FF' : 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          color: currentUserRole === 'admin' ? '#2563EB' : '#334155',
                          fontWeight: currentUserRole === 'admin' ? 800 : 600,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>Administrator (Full Access)</span>
                        {currentUserRole === 'admin' && <Check size={16} color="#2563EB" />}
                      </button>
                      <button
                        onClick={() => {
                          setUserRole('manager');
                          setIsProfileOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '9px 14px',
                          border: 'none',
                          backgroundColor: currentUserRole === 'manager' ? '#EFF6FF' : 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          color: currentUserRole === 'manager' ? '#2563EB' : '#334155',
                          fontWeight: currentUserRole === 'manager' ? 800 : 600,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>Duty Manager (Desk Access)</span>
                        {currentUserRole === 'manager' && <Check size={16} color="#2563EB" />}
                      </button>
                    </>
                  ) : (
                    <div style={{ padding: '8px 14px', fontSize: '0.76rem', color: '#2563EB', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>🛡️ Duty Manager (Desk Access)</span>
                      <Check size={15} color="#2563EB" />
                    </div>
                  )}

                  <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />

                  {/* System Settings Shortcut */}
                  <button
                    onClick={() => {
                      setView('crm/settings');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: '#475569',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Settings size={15} color="#2563EB" /> System Settings
                  </button>

                  {/* Exit CRM */}
                  <button
                    onClick={() => {
                      setUserRole('public');
                      setIsProfileOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: '#DC2626',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={15} color="#DC2626" /> Exit CRM View
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content viewport */}
        <main style={{ padding: isMobile ? '16px' : '26px 28px', flexGrow: 1, backgroundColor: '#F1F5F9', minHeight: 'calc(100vh - 76px)' }}>
          {children}
        </main>
      </div>

      {/* Offline Booking Modal Popup */}
      {isOfflineModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '10px' : '24px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOfflineModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: isMobile ? '16px' : '22px',
              width: '100%',
              maxWidth: '1080px',
              maxHeight: '94vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4)',
              position: 'relative',
              border: '1.5px solid #E2E8F0'
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
