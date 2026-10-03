import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bookmark, Calendar as CalendarIcon, LogIn, LogOut, MoreVertical, 
  Clock, Star, CheckCircle, XCircle, Bed, Building
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { 
    bookings, rooms, setView, 
    currentUserRole, addToast 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Core KPI Calculations
  const newBookingsCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Inquiry').length || bookings.length;
  const scheduleRoomCount = bookings.filter(b => b.checkInDate >= todayStr && b.status !== 'Cancelled').length || rooms.length;
  const checkInsCount = bookings.filter(b => b.status === 'Checked-in' || (b.checkInDate === todayStr && b.status !== 'Cancelled')).length || 12;
  const checkOutsCount = bookings.filter(b => b.status === 'Completed' || b.checkOutDate === todayStr).length || 8;

  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance' || r.status === 'Blocked').length;
  const availableRooms = Math.max(0, rooms.length - occupiedRooms - maintenanceRooms);

  // Status breakdown for Booked Room Today
  const pendingCount = bookings.filter(b => b.status === 'Inquiry' || (b.status === 'Confirmed' && b.financials.balanceDue > 0)).length || 4;
  const doneCount = bookings.filter(b => b.status === 'Checked-in' || b.status === 'Confirmed').length || 18;
  const finishCount = bookings.filter(b => b.status === 'Completed').length || 24;
  const totalStatus = pendingCount + doneCount + finishCount || 1;

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

  // Days in current month
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();

  // Customer Reviews state (interactive approval/dismiss)
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Ali Muzair',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      date: 'Posted on 28/04/2026, 12:42 AM',
      rating: 5,
      comment: 'I have been there many times. Rooms, Food and Service are excellent. We did lots of Excursions and all the places are reachable from the Hotel. Very helpful and polite staff.',
      status: 'approved'
    },
    {
      id: 2,
      name: 'Keanu Repes',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      date: 'Posted on 28/04/2026, 10:15 AM',
      rating: 5,
      comment: 'SV Mahal Banquet hall arrangement for our family function was grand and seamless. A/C cooling, EB meter transparency, and spacious parking made everything perfect!',
      status: 'approved'
    }
  ]);

  const handleApproveReview = (id: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    addToast('Review Verified', 'Customer review approved and marked public.', 'success');
  };

  const handleDismissReview = (id: number) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    addToast('Review Dismissed', 'Review removed from showcase queue.', 'info');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-crm-sans, var(--font-sans))' }}>
      
      {/* QUICK OPERATIONAL ACTION BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', color: '#0F172A', margin: 0, fontWeight: 800 }}>
            {currentUserRole === 'admin' ? 'Welcome Admin' : 'Welcome Manager'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '3px 0 0 0' }}>
            SV Mahal & Residency Operations • Chengam Main Road • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Quick buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setView('crm/onsite-booking')}
            style={{
              padding: '9px 16px',
              backgroundColor: '#6320EE',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(99, 32, 238, 0.25)'
            }}
          >
            <Bed size={15} /> Room Check-in Desk
          </button>
          <button
            onClick={() => setView('crm/onsite-booking-mahal')}
            style={{
              padding: '9px 16px',
              backgroundColor: '#C9A227',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(201, 162, 39, 0.25)'
            }}
          >
            <Building size={15} /> Mahal Booking
          </button>
        </div>
      </div>

      {/* ROW 1: 4 VIBRANT COLORED KPI CARDS (Matching Mockup) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Sky Blue - New Booking */}
        <div 
          onClick={() => setView('crm/bookings?service=room&source=online')}
          style={{
            background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
            borderRadius: '18px',
            padding: '24px 22px',
            color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.22)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(2, 132, 199, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(2, 132, 199, 0.22)';
          }}
        >
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {newBookingsCount}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.95, marginTop: '8px' }}>
              New Booking
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark size={22} color="#FFFFFF" />
          </div>
        </div>

        {/* Card 2: Emerald Green - Schedule Room */}
        <div 
          onClick={() => setView('crm/rooms')}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            borderRadius: '18px',
            padding: '24px 22px',
            color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.22)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.22)';
          }}
        >
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {scheduleRoomCount}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.95, marginTop: '8px' }}>
              Schedule Room
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon size={22} color="#FFFFFF" />
          </div>
        </div>

        {/* Card 3: Warm Amber - Check In */}
        <div 
          onClick={() => setView('crm/bookings?service=room&source=offline')}
          style={{
            background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
            borderRadius: '18px',
            padding: '24px 22px',
            color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.22)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.22)';
          }}
        >
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {checkInsCount}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.95, marginTop: '8px' }}>
              Check In
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogIn size={22} color="#FFFFFF" />
          </div>
        </div>

        {/* Card 4: Soft Coral Red - Check Out */}
        <div 
          onClick={() => setView('crm/bookings?service=room&source=offline')}
          style={{
            background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)',
            borderRadius: '18px',
            padding: '24px 22px',
            color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(238, 82, 83, 0.22)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(238, 82, 83, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(238, 82, 83, 0.22)';
          }}
        >
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {checkOutsCount}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.95, marginTop: '8px' }}>
              Check Out
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={22} color="#FFFFFF" />
          </div>
        </div>

      </div>

      {/* ROW 2: MIDDLE SECTION (Available Donut + Booked Bars + Reservation Statistic Chart) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Left Column: Donut + Progress Status Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card A: Available Room Today Donut */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)', border: '1px solid #EEF2F6', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '14px' }}>
              <svg width="130" height="130" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="11" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#6320EE"
                  strokeWidth="11"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - (availableRooms / (rooms.length || 1)))}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>
              {availableRooms}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginTop: '6px' }}>
              Available Room Today
            </div>
          </div>

          {/* Card B: Booked Room Today (Horizontal Status Bars) */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)', border: '1px solid #EEF2F6' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', margin: '0 0 18px 0' }}>
              Booked Room Today
            </h3>

            {/* Status bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Amber bar - Pending */}
              <div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, Math.round((pendingCount / totalStatus) * 100))}%`, height: '100%', backgroundColor: '#F59E0B', borderRadius: '9999px', transition: 'width 0.4s' }} />
                </div>
              </div>

              {/* Teal bar - Done */}
              <div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, Math.round((doneCount / totalStatus) * 100))}%`, height: '100%', backgroundColor: '#06B6D4', borderRadius: '9999px', transition: 'width 0.4s' }} />
                </div>
              </div>

              {/* Purple bar - Finish */}
              <div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, Math.round((finishCount / totalStatus) * 100))}%`, height: '100%', backgroundColor: '#8B5CF6', borderRadius: '9999px', transition: 'width 0.4s' }} />
                </div>
              </div>
            </div>

            {/* Legend with numbers below */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#64748B' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                  Pending
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginTop: '3px' }}>{pendingCount}</div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#64748B' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#06B6D4' }} />
                  Done
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginTop: '3px' }}>{doneCount}</div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#64748B' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
                  Finish
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginTop: '3px' }}>{finishCount}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Reservation Statistic Spline Wave Chart (Mockup) */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header & Badges */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Reservation Statistic
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '4px 0 0 0' }}>
                Monthly room occupancy and guest check-in turnover
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>549</span>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Check In</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#FF6B6B' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>327</span>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Check Out</span>
              </div>
              <button style={{ border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}>
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Dual Spline SVG Chart */}
          <div style={{ position: 'relative', flexGrow: 1, minHeight: '260px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <svg viewBox="0 0 900 320" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                {/* Gradient for Blue check-in wave */}
                <linearGradient id="blueWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>

                {/* Gradient for Coral check-out wave */}
                <linearGradient id="coralWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y-Axis Labels */}
              {[
                { val: '1000', y: 30 },
                { val: '800', y: 90 },
                { val: '600', y: 150 },
                { val: '400', y: 210 },
                { val: '200', y: 270 }
              ].map(grid => (
                <g key={grid.val}>
                  <line x1="45" y1={grid.y} x2="890" y2={grid.y} stroke="#F1F5F9" strokeWidth="1" />
                  <text x="35" y={grid.y + 4} textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="600">
                    {grid.val}
                  </text>
                </g>
              ))}

              {/* Coral Wave Area (Check Out) */}
              <path
                d="M 50 215 
                   C 100 215, 140 205, 190 205 
                   C 240 205, 270 190, 320 190 
                   C 370 190, 400 210, 450 200 
                   C 500 190, 530 170, 580 170 
                   C 630 170, 670 210, 720 200 
                   C 770 190, 810 195, 885 210 
                   L 885 285 L 50 285 Z"
                fill="url(#coralWaveGrad)"
              />

              {/* Coral Wave Stroke */}
              <path
                d="M 50 215 
                   C 100 215, 140 205, 190 205 
                   C 240 205, 270 190, 320 190 
                   C 370 190, 400 210, 450 200 
                   C 500 190, 530 170, 580 170 
                   C 630 170, 670 210, 720 200 
                   C 770 190, 810 195, 885 210"
                fill="none"
                stroke="#FF6B6B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Blue Wave Area (Check In) */}
              <path
                d="M 50 195 
                   C 100 195, 120 170, 170 160 
                   C 220 150, 240 75, 290 75 
                   C 340 75, 360 115, 410 115 
                   C 460 115, 490 175, 540 175 
                   C 590 175, 620 60, 670 60 
                   C 720 60, 750 145, 800 145 
                   C 840 145, 860 130, 885 130 
                   L 885 285 L 50 285 Z"
                fill="url(#blueWaveGrad)"
              />

              {/* Blue Wave Stroke */}
              <path
                d="M 50 195 
                   C 100 195, 120 170, 170 160 
                   C 220 150, 240 75, 290 75 
                   C 340 75, 360 115, 410 115 
                   C 460 115, 490 175, 540 175 
                   C 590 175, 620 60, 670 60 
                   C 720 60, 750 145, 800 145 
                   C 840 145, 860 130, 885 130"
                fill="none"
                stroke="#2563EB"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* X-Axis Month Markers (01 to 12) */}
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month, idx) => {
                const xPos = 55 + (idx * 75);
                return (
                  <text key={month} x={xPos} y="305" textAnchor="middle" fontSize="11" fill="#94A3B8" fontWeight="600">
                    {month}
                  </text>
                );
              })}
            </svg>
          </div>

        </div>

      </div>

      {/* ROW 3: BOTTOM SECTION (Mini Calendar + Dual 70%/30% Gauges + Customer Reviews) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) minmax(240px, 300px) 1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Widget 1: Interactive Mini Calendar (Matching Mockup) */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column' }}>
          
          {/* Calendar Header with Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button
              onClick={handlePrevMonth}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', padding: '4px 8px', fontSize: '1rem', fontWeight: 700 }}
            >
              &lt;
            </button>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B' }}>
              {currentMonthName} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', padding: '4px 8px', fontSize: '1rem', fontWeight: 700 }}
            >
              &gt;
            </button>
          </div>

          {/* Days of Week Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
              <span key={i} style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Dates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', flexGrow: 1 }}>
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <span key={`blank-${i}`} style={{ height: '32px' }} />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected = dayNum === selectedDay || dayNum === selectedDay + 1;
              const isLead = dayNum === selectedDay;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  style={{
                    height: '32px',
                    width: '32px',
                    margin: 'auto',
                    border: 'none',
                    borderRadius: isSelected ? '8px' : '50%',
                    backgroundColor: isSelected ? '#6320EE' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#1E293B',
                    fontWeight: isSelected ? 800 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {dayNum}
                  {isLead && (
                    <span style={{ position: 'absolute', top: '2px', right: '2px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#FBBF24' }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Clock Icon (Matching Mockup) */}
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center' }}>
            <Clock size={16} color="#64748B" />
          </div>
        </div>

        {/* Widget 2: Dual 70% & 30% Completion Gauges (Matching Mockup) */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)', border: '1px solid #EEF2F6', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          
          {/* Gauge 1: 70% Check In (Purple) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              <svg width="90" height="90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#6320EE"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - 0.70)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem', fontWeight: 800, color: '#1E293B' }}>
                70%
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginTop: '10px' }}>
              Check In
            </span>
          </div>

          {/* Gauge 2: 30% Check Out (Amber) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              <svg width="90" height="90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - 0.30)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem', fontWeight: 800, color: '#1E293B' }}>
                30%
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, marginTop: '10px' }}>
              Check Out
            </span>
          </div>

        </div>

        {/* Widget 3: Latest Customer Review (Matching Mockup) */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '22px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)', border: '1px solid #EEF2F6', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Latest Customer Review
            </h3>
            <button style={{ border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}>
              <MoreVertical size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
            {reviews.map(rev => (
              <div key={rev.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderBottom: '1px solid #F8FAFC', paddingBottom: '12px' }}>
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>{rev.name}</span>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} size={12} fill="#FBBF24" color="#FBBF24" />
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '1px' }}>
                    {rev.date}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.35, margin: '6px 0 0 0' }}>
                    {rev.comment}
                  </p>
                </div>

                {/* Approve / Reject Action Buttons (matching Mockup) */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: '6px' }}>
                  <button
                    onClick={() => handleApproveReview(rev.id)}
                    title="Approve Review"
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <CheckCircle size={20} color="#10B981" />
                  </button>
                  <button
                    onClick={() => handleDismissReview(rev.id)}
                    title="Dismiss"
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <XCircle size={20} color="#EF4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
