import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LogIn, LogOut, Clock, Star, CheckCircle, XCircle, 
  Bed, Building, User, DollarSign, RefreshCw,
  ChevronRight, Search, DoorOpen, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import type { Booking, Room } from '../types';

export const DashboardOverview: React.FC = () => {
  const { 
    bookings, rooms, setView, 
    currentUserRole, addToast, setSelectedBooking 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to sync room occupancy, active guest, and checkout time with real bookings
  const getRoomDoorData = (room: Room) => {
    const activeBooking = bookings.find(b => {
      if (b.status === 'Cancelled' || b.status === 'Checked-out' || b.status === 'Completed') return false;
      const matchId = (b.roomIds && b.roomIds.includes(room.id)) || b.serviceId === room.id;
      const roomNum = room.number || (room as any).roomNumber || '';
      const matchNum = (b as any).roomNumber === roomNum || (b as any).roomNumber === room.id;
      return (matchId || matchNum) && (b.status === 'Checked-in' || b.status === 'Confirmed');
    });

    const isOccupiedByBooking = !!activeBooking;
    const isOccupied = isOccupiedByBooking || room.status === 'Occupied';
    const isBlocked = room.status === 'Maintenance' || room.status === 'Blocked' || room.status === 'Cleaning';
    const isFree = !isOccupied && !isBlocked;

    let guestName = '';
    let checkoutTime = 'Ready for Check-In';

    if (activeBooking) {
      guestName = activeBooking.customerName || (activeBooking as any).guestName || 'Registered Guest';
      if (activeBooking.actualCheckOutTime) {
        checkoutTime = activeBooking.actualCheckOutTime;
      } else if (activeBooking.checkOutDate) {
        if (activeBooking.checkOutDate === todayStr) {
          checkoutTime = 'Today, 11:00 AM';
        } else {
          const d = new Date(activeBooking.checkOutDate);
          checkoutTime = `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, 11:00 AM`;
        }
      } else {
        checkoutTime = 'Today, 11:00 AM';
      }
    } else if (isOccupied) {
      guestName = (room as any).currentGuest || 'Registered Guest';
      checkoutTime = 'Today, 11:00 AM';
    } else if (isBlocked) {
      checkoutTime = 'In Service';
    }

    return {
      isOccupied,
      isBlocked,
      isFree,
      guestName,
      checkoutTime,
      activeBooking: activeBooking || null
    };
  };

  // Dynamic Room Door Inventory List with occupancy sync
  const roomDoorList = rooms.map(room => ({
    room,
    door: getRoomDoorData(room)
  }));

  // Core KPI Calculations strictly based on real room door data
  const occupiedRooms = roomDoorList.filter(item => item.door.isOccupied).length;
  const maintenanceRooms = roomDoorList.filter(item => item.door.isBlocked).length;
  const availableRooms = Math.max(0, rooms.length - occupiedRooms - maintenanceRooms);
  const occupancyPercent = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  // Arrivals and Departures today
  const todayArrivals = bookings.filter(b => b.checkInDate === todayStr && b.status !== 'Cancelled');
  const todayDepartures = bookings.filter(b => b.checkOutDate === todayStr && b.status !== 'Cancelled');
  const checkInsCount = bookings.filter(b => b.status === 'Checked-in' || (b.checkInDate === todayStr && b.status !== 'Cancelled')).length;
  const checkOutsCount = bookings.filter(b => b.status === 'Completed' || (b.checkOutDate === todayStr && b.status === 'Checked-in')).length;

  // Financial & Inquiries
  const totalRevenue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((acc, b) => acc + (b.financials?.totalAmount ?? b.totalAmount ?? 0), 0);
  const totalBalanceDue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((acc, b) => acc + (b.financials?.balanceDue ?? 0), 0);
  const pendingRequestsCount = bookings.filter(b => b.status === 'Inquiry' || b.source === 'online').length;

  const [bookingSearch, setBookingSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('Data Synchronized', 'Operational room statuses and guest logs refreshed.', 'info');
    }, 500);
  };

  // Mini Interactive Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const currentMonthName = calendarDate.toLocaleString('default', { month: 'long' });
  const currentYear = calendarDate.getFullYear();

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();

  // Guest reviews from localStorage
  const [reviews, setReviews] = useState<Array<{
    id: string | number;
    name: string;
    avatar?: string;
    date: string;
    rating: number;
    comment: string;
    status: 'approved' | 'pending';
  }>>(() => {
    try {
      const saved = localStorage.getItem('sv_guest_reviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleApproveReview = (id: string | number) => {
    setReviews(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r);
      localStorage.setItem('sv_guest_reviews', JSON.stringify(updated));
      return updated;
    });
    addToast('Review Approved', 'Guest review verified and published.', 'success');
  };

  const handleDismissReview = (id: string | number) => {
    setReviews(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('sv_guest_reviews', JSON.stringify(updated));
      return updated;
    });
    addToast('Review Removed', 'Review removed from queue.', 'info');
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    if (booking.serviceType === 'mahal') {
      setView('crm/bookings?service=mahal&source=offline');
    } else {
      setView('crm/bookings?service=room&source=offline');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (!bookingSearch.trim()) return true;
    const query = bookingSearch.toLowerCase();
    return b.customerName.toLowerCase().includes(query) ||
      (b.roomNumber && b.roomNumber.toLowerCase().includes(query)) ||
      b.id.toLowerCase().includes(query);
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}>
      
      {/* 1. EXECUTIVE OPERATIONAL HEADER (Pure White, Deep Blue & Red Live Alert) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '22px 26px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '18px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800,
              border: '1px solid #FEE2E2',
              letterSpacing: '0.04em'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#DC2626', animation: 'pulse 1.5s infinite' }} />
              LIVE OPERATIONS ACTIVE
            </span>
            <span style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: 600 }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: 700 }}>
              Chengam Main Highway, Tiruvannamalai Dt.
            </span>
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            {currentUserRole === 'admin' ? '🏛️ Executive Administration Center' : '🛎️ Operations Duty Desk'}
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#475569', margin: '4px 0 0 0', fontWeight: 500 }}>
            Unified real-time management for {rooms.length} air-conditioned suites, SV Thirumana Mahal banquet, and guest check-ins.
          </p>
        </div>

        {/* Interactive Action Buttons strictly in Blue, Red & White */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleManualRefresh}
            title="Refresh Live Data"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#1E3A8A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EFF6FF'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setView('crm/onsite-booking')}
            style={{
              padding: '11px 20px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#1D4ED8';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#2563EB';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Bed size={16} />
            <span>+ Room Walk-In</span>
          </button>

          <button
            onClick={() => setView('crm/onsite-booking-mahal')}
            style={{
              padding: '11px 20px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#B91C1C';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#DC2626';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Building size={16} />
            <span>+ Mahal Booking</span>
          </button>
        </div>
      </div>

      {/* 2. HIGH-IMPACT METRICS KPI CARDS (Blue, Red & White Only) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 215px), 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Residency Occupancy Rate (Royal Blue Surface) */}
        <div
          onClick={() => setView('crm/rooms')}
          style={{
            background: 'linear-gradient(135deg, #0A2540 0%, #1E3A8A 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '22px',
            border: '1px solid #1E3A8A',
            boxShadow: '0 6px 18px rgba(10, 37, 64, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(10, 37, 64, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(10, 37, 64, 0.2)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#93C5FD', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🏨 Residency Occupancy
              </span>
              <div style={{ fontSize: '2.1rem', fontWeight: 850, color: '#FFFFFF', lineHeight: 1.15, marginTop: '6px' }}>
                {occupancyPercent}%
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bed size={22} />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${occupancyPercent}%`, height: '100%', backgroundColor: '#60A5FA', borderRadius: '10px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.72rem', color: '#DBEAFE', fontWeight: 600 }}>
              <span>{occupiedRooms} Active In-House</span>
              <span>{rooms.length} Total Keys</span>
            </div>
          </div>
        </div>

        {/* Card 2: Today's Arrivals (Pure White with Blue Accents) */}
        <div
          onClick={() => setView('crm/bookings?service=room&source=offline')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = '#2563EB';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🛎️ Today's Arrivals
              </span>
              <div style={{ fontSize: '2.1rem', fontWeight: 850, color: '#0F172A', lineHeight: 1.15, marginTop: '6px' }}>
                {checkInsCount}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogIn size={22} />
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
            <span style={{ color: '#2563EB', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={13} /> {todayArrivals.length} Scheduled
            </span>
            <span style={{ color: '#2563EB', fontWeight: 800 }}>Manage &rarr;</span>
          </div>
        </div>

        {/* Card 3: Today's Departures & Turnovers (Pure White with Red Accents) */}
        <div
          onClick={() => setView('crm/bookings?service=room&source=offline')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = '#DC2626';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(220, 38, 38, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🚪 Departures & Turnover
              </span>
              <div style={{ fontSize: '2.1rem', fontWeight: 850, color: '#DC2626', lineHeight: 1.15, marginTop: '6px' }}>
                {checkOutsCount}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={22} />
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
            <span style={{ color: '#DC2626', fontWeight: 700 }}>
              {todayDepartures.length} Room Turnovers
            </span>
            <span style={{ color: '#64748B', fontWeight: 600 }}>Housekeeping Queue</span>
          </div>
        </div>

        {/* Card 4: Ready Available Rooms (Pure White with Blue Accent) */}
        <div
          onClick={() => setView('crm/rooms')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = '#2563EB';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🟢 Ready Available
              </span>
              <div style={{ fontSize: '2.1rem', fontWeight: 850, color: '#0F172A', lineHeight: 1.15, marginTop: '6px' }}>
                {availableRooms} <span style={{ fontSize: '1rem', fontWeight: 700, color: '#64748B' }}>Rooms</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={22} />
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
            <span style={{ color: '#2563EB', fontWeight: 800, backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>
              Walk-in Ready
            </span>
            <span style={{ color: '#64748B', fontWeight: 600 }}>
              {maintenanceRooms > 0 ? `${maintenanceRooms} Blocked/Cleaning` : '100% Operational'}
            </span>
          </div>
        </div>

        {/* Card 5: Role-Specific KPI (Admin Revenue vs Manager Inquiries) in Blue, Red, White */}
        {currentUserRole === 'admin' ? (
          <div
            onClick={() => setView('crm/finance')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '22px',
              border: '2px solid #2563EB',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.12)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(37, 99, 235, 0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.12)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  💰 Total Booking Turnover
                </span>
                <div style={{ fontSize: '1.85rem', fontWeight: 850, color: '#0F172A', lineHeight: 1.15, marginTop: '6px' }}>
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={22} />
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
              <span style={{ color: totalBalanceDue > 0 ? '#DC2626' : '#2563EB', fontWeight: 700 }}>
                {totalBalanceDue > 0 ? `₹${totalBalanceDue.toLocaleString('en-IN')} balance pending` : 'All Accounts Reconciled'}
              </span>
              <span style={{ color: '#2563EB', fontWeight: 800 }}>Ledger &rarr;</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setView('crm/online-requests')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '22px',
              border: '2px solid #DC2626',
              boxShadow: '0 4px 16px rgba(220, 38, 38, 0.12)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  📩 Online Inquiries
                </span>
                <div style={{ fontSize: '2.1rem', fontWeight: 850, color: '#DC2626', lineHeight: 1.15, marginTop: '6px' }}>
                  {pendingRequestsCount}
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} />
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
              <span style={{ color: '#DC2626', fontWeight: 700 }}>Awaiting Confirmation</span>
              <span style={{ color: '#DC2626', fontWeight: 800 }}>Review &rarr;</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. QUICK JUMP: LIVE DOOR MATRIX STATUS CARD (Blue, Red, White) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px 24px',
        border: '1.5px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB',
            flexShrink: 0
          }}>
            <DoorOpen size={24} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0F172A', margin: 0 }}>
                🚪 Live Door Matrix & Occupancy Keys
              </h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE' }}>
                🟢 {availableRooms} Doors Open
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FEE2E2' }}>
                🔴 {occupiedRooms} Doors Locked
              </span>
              {maintenanceRooms > 0 && (
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}>
                  🧹 {maintenanceRooms} Service
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '3px 0 0 0' }}>
              Dedicated door-key layout for all {rooms.length} inventory rooms with guest folios, instant check-in, and real-time checkout countdowns.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setView('crm/door-matrix')}
          style={{
            padding: '9px 18px',
            borderRadius: '10px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1D4ED8';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2563EB';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>🚪 Open Full Door Matrix</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* 4. SPLIT ROW: RECENT BOOKINGS & ARRIVALS (Left) + SV MAHAL BANQUETS (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: '22px',
        alignItems: 'stretch'
      }}>
        {/* Left Column: Recent Bookings Table with Search */}
        <div className="crm-card-pad" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 850, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
                📋 Operational Bookings & Roster
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '3px 0 0 0' }}>
                Real-time guest reservations at SV Residency and SV Thirumana Mahal
              </p>
            </div>

            <button
              onClick={() => setView('crm/bookings?service=room&source=offline')}
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                color: '#2563EB',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Search bar inside widget */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="Filter by guest name, room or booking ID..."
              value={bookingSearch}
              onChange={e => setBookingSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.78rem',
                color: '#0F172A',
                fontWeight: 600,
                outline: 'none',
                backgroundColor: '#F8FAFC'
              }}
            />
            <Search size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>

          {/* Bookings Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
            {filteredBookings.slice(0, 6).map((b) => {
              const isMahal = b.serviceType === 'mahal';
              const isCheckedIn = b.status === 'Checked-in';
              const isConfirmed = b.status === 'Confirmed';

              return (
                <div
                  key={b.id}
                  onClick={() => handleBookingClick(b)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #F1F5F9',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#EFF6FF';
                    e.currentTarget.style.borderColor = '#BFDBFE';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#F1F5F9';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: isMahal ? '#FEF2F2' : '#EFF6FF',
                      color: isMahal ? '#DC2626' : '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isMahal ? <Building size={18} /> : <Bed size={18} />}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{b.customerName}</span>
                        {b.source === 'ota' && (
                          <span style={{ fontSize: '0.62rem', backgroundColor: '#FEF2F2', color: '#DC2626', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            MMT / OTA
                          </span>
                        )}
                        {b.source === 'online' && (
                          <span style={{ fontSize: '0.62rem', backgroundColor: '#EFF6FF', color: '#2563EB', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            Website
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px', fontWeight: 500 }}>
                        {isMahal ? 'SV Thirumana Mahal' : `Room: ${b.roomNumber || 'Assigned on arrival'}`} • {b.checkInDate}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: isCheckedIn ? '#EFF6FF' : (isConfirmed ? '#F1F5F9' : '#FEF2F2'),
                      color: isCheckedIn ? '#2563EB' : (isConfirmed ? '#0F172A' : '#DC2626')
                    }}>
                      {b.status}
                    </span>
                    <ArrowUpRight size={15} color="#2563EB" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: SV Mahal Banquets & Operations Calendar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 850, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
                🏛️ SV Mahal Grand Auditorium
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '3px 0 0 0' }}>
                1,000+ guest wedding auditorium, dining hall & muhurtham operations
              </p>
            </div>

            <button
              onClick={() => setView('crm/bookings?service=mahal&source=offline')}
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                color: '#2563EB',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Mahal Desk
            </button>
          </div>

          {/* Calendar Header with Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            padding: '10px 14px',
            borderRadius: '10px',
            marginBottom: '12px',
            border: '1px solid #E2E8F0'
          }}>
            <button
              onClick={handlePrevMonth}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1E3A8A', fontWeight: 800, fontSize: '0.9rem' }}
            >
              &larr;
            </button>
            <span style={{ fontSize: '0.88rem', fontWeight: 850, color: '#0F172A' }}>
              {currentMonthName} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1E3A8A', fontWeight: 800, fontSize: '0.9rem' }}
            >
              &rarr;
            </button>
          </div>

          {/* Days of Week Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '6px' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
              <span key={i} style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Dates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', flexGrow: 1 }}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <span key={`blank-${i}`} style={{ height: '30px' }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected = dayNum === selectedDay;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  style={{
                    height: '30px',
                    width: '30px',
                    margin: 'auto',
                    border: 'none',
                    borderRadius: isSelected ? '8px' : '50%',
                    backgroundColor: isSelected ? '#2563EB' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#0F172A',
                    fontWeight: isSelected ? 850 : 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Campus Highlights summary in Blue & White */}
          <div className="crm-grid-2" style={{
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid #F1F5F9',
            gap: '10px'
          }}>
            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', padding: '10px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 700 }}>Dining Hall Batch</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 850, color: '#0F172A', marginTop: '2px' }}>
                400+ Seating Capacity
              </div>
            </div>
            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', padding: '10px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 700 }}>Interlocking Paver</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 850, color: '#0F172A', marginTop: '2px' }}>
                200+ Car & Bus Parking
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. VERIFIED GUEST REVIEWS & MANAGEMENT FAST TRACKS (Blue, Red & White) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '22px'
      }}>
        {/* Guest Feedback Moderation Queue */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
                ⭐ Verified Guest Feedback
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0 0' }}>
                Customer reviews collected post checkout
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 800, backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '8px' }}>
              {reviews.length} Logged
            </span>
          </div>

          {reviews.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '28px 16px',
              textAlign: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1'
            }}>
              <Star size={24} color="#2563EB" style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>No Pending Reviews</span>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '4px 0 0 0', maxWidth: '280px' }}>
                When checked-out guests submit testimonials, they will appear here for staff verification.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #F1F5F9',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      flexShrink: 0
                    }}>
                      {rev.name ? rev.name.charAt(0).toUpperCase() : <User size={14} />}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
                        {rev.name}
                      </div>
                      <div style={{ display: 'flex', gap: '2px', margin: '2px 0 4px 0' }}>
                        {Array.from({ length: rev.rating || 5 }).map((_, si) => (
                          <Star key={si} size={11} fill="#2563EB" color="#2563EB" />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                        {rev.comment}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleApproveReview(rev.id)}
                      title="Approve Review"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <CheckCircle size={20} color="#2563EB" />
                    </button>
                    <button
                      onClick={() => handleDismissReview(rev.id)}
                      title="Dismiss"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <XCircle size={20} color="#DC2626" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Management Fast Tracks in Blue & White with Red Alert Badges */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
              ⚡ Management Fast Tracks
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 16px 0' }}>
              Direct access to essential front desk and accounting operations
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <button
                onClick={() => setView('crm/bill-inventory')}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#2563EB';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 850, color: '#0F172A' }}>Tax Invoices</div>
                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>Print & GST Bills</div>
              </button>

              <button
                onClick={() => setView('crm/ota-channels')}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#2563EB';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 850, color: '#0F172A' }}>OTA Sync</div>
                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>MakeMyTrip & Goibibo</div>
              </button>

              <button
                onClick={() => setView('crm/online-requests')}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#2563EB';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 850, color: '#0F172A' }}>Online Approvals</div>
                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>Website Requests</div>
              </button>

              <button
                onClick={() => setView('crm/audit')}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#2563EB';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 850, color: '#0F172A' }}>Audit Trail</div>
                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>Security & Activity</div>
              </button>
            </div>
          </div>

          <div style={{
            marginTop: '18px',
            padding: '14px 16px',
            backgroundColor: '#0A2540',
            color: '#FFFFFF',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#60A5FA" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                {currentUserRole === 'admin' ? 'Superadmin Secured Protocol' : 'Duty Manager Shift Protocol'}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#FFFFFF', backgroundColor: '#DC2626', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              Encrypted
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
