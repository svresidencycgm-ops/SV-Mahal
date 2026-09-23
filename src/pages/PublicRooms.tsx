import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { bookingService } from '../services/bookingService';
import { Users, Bed, Check, Snowflake, Phone, MessageCircle, ShieldCheck, Camera, Sparkles } from 'lucide-react';
import type { Room } from '../types';
import { CustomerLoginModal } from '../components/CustomerLoginModal';


export const PublicRooms: React.FC = () => {
  const { rooms, bookings, setView, customerUser, addToast } = useApp();
  
  // States
  const [selectedType, setSelectedType] = useState<Room['type']>('Standard');
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Read URL query parameters if redirected from Quick Widget
  useEffect(() => {
    const parseUrlParams = () => {
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const query = hash.substring(hash.indexOf('?') + 1);
        const params = new URLSearchParams(query);
        
        const type = params.get('type') as Room['type'];
        const checkInVal = params.get('in');
        const checkOutVal = params.get('out');
        
        if (type) setSelectedType(type);
        if (checkInVal) setCheckIn(checkInVal);
        if (checkOutVal) setCheckOut(checkOutVal);
      }
    };
    parseUrlParams();
  }, []);

  // Filter unique room types for details display
  const roomTypesData = [
    {
      type: 'Standard' as const,
      price: 1500,
      capacity: 2,
      beds: 'Queen Bed',
      ac: 'Non-AC',
      desc: 'Comfortable standard room ideal for budget travelers, featuring essential stay amenities and a cozy queen bed.',
      amenities: ['Free Wi-Fi', 'TV', 'Intercom', 'Attached Bathroom', 'Housekeeping']
    },
    {
      type: 'Deluxe' as const,
      price: 2500,
      capacity: 2,
      beds: 'King Bed',
      ac: 'Air-conditioned',
      desc: 'Elegant air-conditioned deluxe room featuring a spacious king bed, premium linen, and writing desk.',
      amenities: ['AC', 'Free Wi-Fi', 'TV', 'Mini Fridge', 'Intercom', 'Hot Water', 'Coffee/Tea maker']
    },
    {
      type: 'Premium' as const,
      price: 3500,
      capacity: 3,
      beds: 'King + Single Bed',
      ac: 'Air-conditioned',
      desc: 'Luxurious premium room offering beautiful view balconies, coffee makers, and premium toilet amenities.',
      amenities: ['AC', 'Free Wi-Fi', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Box', 'Balcony', 'Luxury Toiletries']
    },
    {
      type: 'Family Room' as const,
      price: 4500,
      capacity: 4,
      beds: '2 Double Beds',
      ac: 'Air-conditioned',
      desc: 'Spacious family suite equipped with two double beds, dedicated lounge seating, and extra towels for group comfort.',
      amenities: ['AC', 'Free Wi-Fi', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Box', 'Separate Lounge', 'Luxury Toiletries']
    }
  ];

  // Calendar Math: Rolling 2 months
  const now = new Date();
  const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Helper to compile grid list for a month
  const getCalendarDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth(); // 0-indexed
    
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 6 = Sat
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: { dateStr: string; dayNum: number; isPadding: boolean }[] = [];
    
    // Padding days from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dateStr: '', dayNum: 0, isPadding: true });
    }
    
    // Days of current month
    for (let day = 1; day <= totalDays; day++) {
      const formattedMonth = String(month + 1).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
      days.push({ dateStr, dayNum: day, isPadding: false });
    }

    return days;
  };

  const getDayStatus = (dateStr: string) => {
    if (!dateStr) return 'none';
    
    // Filter rooms of selected type
    const roomsOfType = rooms.filter(r => r.type === selectedType);
    const total = roomsOfType.length;
    
    // Count global rooms in maintenance
    const maintenanceCount = roomsOfType.filter(r => r.status === 'Maintenance' || r.status === 'Blocked').length;
    
    // Calculate occupied rooms on this date
    let occupiedCount = 0;
    const targetTime = bookingService.parseLocalDate(dateStr).getTime();

    bookings.forEach(b => {
      if (b.serviceType !== 'room') return;
      if (['Cancelled', 'No-show', 'Checked-out', 'Completed'].includes(b.status)) return;
      
      // Match room type
      const firstRoomId = b.roomIds?.[0];
      const bRoomType = rooms.find(r => r.id === firstRoomId)?.type;
      if (bRoomType !== selectedType) return;
      
      const start = bookingService.parseLocalDate(b.checkInDate).getTime();
      const end = bookingService.parseLocalDate(b.checkOutDate).getTime();
      
      if (targetTime >= start && targetTime < end) {
        occupiedCount += b.roomCount || 1;
      }
    });

    const unavailable = occupiedCount + maintenanceCount;

    if (maintenanceCount === total) return 'maintenance';
    if (unavailable >= total) return 'booked';
    if (occupiedCount > 0) return 'partial';
    return 'available';
  };

  const handleDateClick = (dateStr: string) => {
    if (!dateStr) return;
    const status = getDayStatus(dateStr);
    if (status === 'booked' || status === 'maintenance') {
      alert(`Sorry, selected ${selectedType} is fully booked on this date.`);
      return;
    }

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else {
      // If selected check-out is before check-in, swap them
      if (dateStr <= checkIn) {
        setCheckIn(dateStr);
        setCheckOut('');
      } else {
        // Validate if intermediate dates have conflicts
        let hasConflict = false;
        let d = new Date(checkIn);
        const endD = new Date(dateStr);
        while (d < endD) {
          const checkStr = d.toISOString().split('T')[0];
          const checkStatus = getDayStatus(checkStr);
          if (checkStatus === 'booked' || checkStatus === 'maintenance') {
            hasConflict = true;
            break;
          }
          d.setDate(d.getDate() + 1);
        }

        if (hasConflict) {
          alert('Selected range contains dates that are fully booked. Please select another range.');
          setCheckIn(dateStr);
          setCheckOut('');
        } else {
          setCheckOut(dateStr);
        }
      }
    }
  };

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      alert('Please select both Check-in and Check-out dates on the calendar.');
      return;
    }
    if (!customerUser) {
      addToast('Authentication Required', 'Please verify your phone number via OTP to proceed with the booking.', 'info');
      setShowAuthModal(true);
      return;
    }
    setView(`public/book?service=room&type=${selectedType}&in=${checkIn}&out=${checkOut}`);
  };

  const renderMonthGrid = (monthDate: Date) => {
    const days = getCalendarDays(monthDate);
    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const weekdayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div style={{ flex: '1 1 300px', minWidth: '280px', backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
        <h4 style={{ textAlign: 'center', fontSize: '1.05rem', color: '#0F172A', marginBottom: '12px', fontWeight: 700 }}>
          {monthName}
        </h4>
        
        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', color: '#64748B', marginBottom: '8px' }}>
          {weekdayHeaders.map(day => <div key={day}>{day}</div>)}
        </div>

        {/* Grid Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {days.map((day, idx) => {
            if (day.isPadding) {
              return <div key={`pad-${idx}`} style={{ aspectRatio: 1 }} />;
            }

            const status = getDayStatus(day.dateStr);
            const isSelected = day.dateStr === checkIn || day.dateStr === checkOut;
            const isInRange = checkIn && checkOut && day.dateStr > checkIn && day.dateStr < checkOut;
            const isHoveredInRange = checkIn && !checkOut && hoveredDate && day.dateStr > checkIn && day.dateStr <= hoveredDate;

            let bg = '#FFFFFF';
            let border = '1px solid #D2E3F8';
            let dotColor = '#16A34A';
            let title = 'Available';
            let textColor = '#0F2942';

            if (status === 'booked') {
              bg = '#FEE2E2';
              border = '1px solid #FCA5A5';
              dotColor = '#DC2626';
              title = 'Fully Booked';
              textColor = '#991B1B';
            } else if (status === 'partial') {
              bg = '#E0F2FE';
              border = '1px solid #BAE6FD';
              dotColor = '#0284C7';
              title = 'Partially Available';
              textColor = '#0369A1';
            } else if (status === 'maintenance') {
              bg = '#F1F5F9';
              border = '1px solid #CBD5E1';
              dotColor = '#64748B';
              title = 'Maintenance';
              textColor = '#475569';
            }

            // Selection styles
            if (isSelected) {
              bg = '#0284C7';
              border = '1px solid #0284C7';
              textColor = '#FFFFFF';
            } else if (isInRange) {
              bg = '#E0F2FE';
              border = '1px dashed #38BDF8';
              textColor = '#0369A1';
            } else if (isHoveredInRange) {
              bg = '#F0F9FF';
              border = '1px dashed #0284C7';
              textColor = '#0284C7';
            }

            return (
              <div
                key={day.dateStr}
                onClick={() => handleDateClick(day.dateStr)}
                title={`${day.dateStr} — ${title}`}
                style={{
                  aspectRatio: 1,
                  borderRadius: '4px',
                  backgroundColor: bg,
                  border: border,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 800 : 500,
                  color: textColor,
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  transform: (hoveredDate === day.dateStr && (status === 'available' || status === 'partial')) ? 'scale(1.1)' : 'none',
                  zIndex: hoveredDate === day.dateStr ? 10 : 1
                }}
                onMouseEnter={() => {
                  if (checkIn && !checkOut && status !== 'booked' && status !== 'maintenance') {
                    setHoveredDate(day.dateStr);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredDate(null);
                }}
              >
                {day.dayNum}
                {!isSelected && (
                  <div
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: dotColor,
                      position: 'absolute',
                      bottom: '4px'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0' }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
            SV RESIDENCY • LODGING & ACCOMMODATION
          </span>
          <h2 style={{ fontSize: '2.5rem', color: '#0F172A', marginBottom: '8px' }}>Hotel Rooms & Stay Suites</h2>
          <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
            Choose from standard, deluxe, premium, and family room options with transparent availability, pristine hygiene, and simple rates.
          </p>
        </div>

        {/* Authentic Property Exterior Feature Banner */}
        <div
          style={{
            marginBottom: '40px',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#0F172A',
            border: '1px solid rgba(201, 162, 39, 0.3)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            alignItems: 'center'
          }}
        >
          <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
            <img
              src="/images/sv-residency-exterior.webp"
              alt="SV Residency Exterior Facade"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: '12px', left: '14px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)', padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Camera size={13} color="#C9A227" />
              <span style={{ fontSize: '0.72rem', color: '#FFFFFF', fontWeight: 600 }}>Authentic Exterior View</span>
            </div>
          </div>
          <div style={{ padding: '24px 28px', color: '#FFFFFF' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.35)', color: '#F1D675', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '10px' }}>
              <Sparkles size={12} /> SV RESIDENCY LODGING
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px 0', fontFamily: 'var(--font-sans)' }}>
              Spacious & Modern Accommodation in Chengam
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0 0 16px 0', lineHeight: 1.6 }}>
              Located right opposite SV Mahal, offering 24/7 front desk, elevator access, backup generator, and secured parking for temple yatris and wedding guests.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.78rem', color: '#CBD5E1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={14} color="#10B981" /> 100% Sanitized Rooms</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={14} color="#10B981" /> 24/7 Hot Water & Power</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={14} color="#10B981" /> Free High-Speed Wi-Fi</span>
            </div>
          </div>
        </div>

        {/* Dynamic Rooms Display Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '50px' }}>
          {roomTypesData.map(room => (
            <div
              key={room.type}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Image Frame with real exterior context */}
              <div style={{ height: '180px', backgroundColor: '#0F172A', position: 'relative', overflow: 'hidden' }}>
                <img
                  src="/images/sv-residency-exterior.webp"
                  alt={`SV Residency ${room.type}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '12px', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Bed size={13} color="#C9A227" /> {room.type} Suite
                </div>
                <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }}>
                  {room.ac}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', color: '#0F172A', margin: 0, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
                    {room.type} Room
                  </h3>
                  <div style={{ textAlign: 'right' }}>
                     <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284C7' }}>₹{room.price}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>/ Night</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '16px', flexGrow: 1 }}>
                  {room.desc}
                </p>

                {/* Info Badges */}
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#475569', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> Max {room.capacity} Guests</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bed size={14} /> {room.beds}</span>
                  {room.ac.includes('AC') && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Snowflake size={14} /> AC</span>}
                </div>

                {/* Amenities checklist */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {room.amenities.slice(0, 4).map(amenity => (
                    <span key={amenity} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.7rem', fontWeight: 500 }}>
                      <Check size={10} color="#16A34A" /> {amenity}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSelectedType(room.type);
                    // scroll to calendar
                    document.getElementById('rooms-calendar')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: selectedType === room.type ? 'none' : '1px solid #0284C7',
                    backgroundColor: selectedType === room.type ? '#0284C7' : 'transparent',
                    color: selectedType === room.type ? '#FFFFFF' : '#0284C7',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  {selectedType === room.type ? 'Selected for Availability' : 'Check Availability'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 2-MONTH AVAILABILITY CALENDAR BLOCK */}
        <section id="rooms-calendar" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: 700, margin: 0, fontFamily: 'var(--font-sans)' }}>
                Rolling 2-Month Availability: <span style={{ color: '#0284C7' }}>{selectedType} Room</span>
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '4px 0 0 0' }}>
                Select check-in and check-out dates on the calendar grids below.
              </p>
            </div>

            {/* Room Type Selector dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>ROOM TYPE:</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as any);
                  setCheckIn('');
                  setCheckOut('');
                }}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', backgroundColor: '#FFFFFF', fontWeight: 600 }}
              >
                <option value="Standard">Standard Room</option>
                <option value="Deluxe">Deluxe Room</option>
                <option value="Premium">Premium Room</option>
                <option value="Family Room">Family Room</option>
              </select>
            </div>
          </div>

          {/* Double Monthly Calendar Flexbox */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {renderMonthGrid(currentMonthDate)}
            {renderMonthGrid(nextMonthDate)}
          </div>

          {/* Color Coding legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '20px', marginTop: '24px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16A34A' }} /> Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} /> Partially Booked
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#DC2626' }} /> Fully Booked
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#64748B' }} /> Maintenance / Blocked
            </div>
          </div>

          {/* Selected info & Action widget */}
          {checkIn && (
            <div
              className="animate-fade-in"
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                marginTop: '30px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>SELECTED STAY PERIOD</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                  <span>Check-in: {checkIn}</span>
                  <span style={{ color: '#94A3B8' }}>➔</span>
                  <span>{checkOut ? `Check-out: ${checkOut}` : 'Select Check-out Date'}</span>
                </div>
                {checkIn && checkOut && (
                  <div style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 600, marginTop: '2px' }}>
                    Total: {Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))} Night(s) stay
                  </div>
                )}
              </div>

              <button
                onClick={handleBookNow}
                disabled={!checkOut}
                style={{
                  padding: '12px 30px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: checkOut ? 'pointer' : 'not-allowed',
                  opacity: checkOut ? 1 : 0.6,
                  transition: 'var(--transition)'
                }}
              >
                Proceed to Booking Details
              </button>
            </div>
          )}
        </section>

        {/* Instant Assistance & Help Desk Banner */}
        <section
          style={{
            marginTop: '30px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px 28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            border: '1px solid rgba(201, 162, 39, 0.4)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#C9A227', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              NEED GROUP ROOMS OR DIRECT ASSISTANCE?
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 6px 0', color: '#FFFFFF' }}>
              Contact Our 24/7 Front Desk Directly
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, maxWidth: '540px', lineHeight: 1.5 }}>
              For bulk wedding guest accommodations, temple yatra stay packages, or special check-in requests, reach us instantly.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <a
              href="tel:+919500821550"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Phone size={15} /> 95008 21550
            </a>
            <a
              href="tel:+919043780215"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                border: '1px solid #475569',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Phone size={15} /> 90437 80215
            </a>
            <a
              href="https://wa.me/919500821550?text=Hello%20SV%20Residency%2C%20I%20am%20looking%20to%20book%20rooms."
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
          </div>
        </section>

      </div>

      <CustomerLoginModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setView(`public/book?service=room&type=${selectedType}&in=${checkIn}&out=${checkOut}`)}
      />
    </div>
  );

};
