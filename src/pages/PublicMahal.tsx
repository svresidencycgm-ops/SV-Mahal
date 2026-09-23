import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Star, Check, ChevronLeft, ChevronRight, X, QrCode, Sparkles, Compass, Phone, MessageCircle } from 'lucide-react';
import { CustomerLoginModal } from '../components/CustomerLoginModal';
import { MahalDecorsGallery } from '../components/MahalDecorsGallery';

export const PublicMahal: React.FC = () => {
  const { bookings, mahalConfig, customerUser, addToast, loginCustomer, addBooking } = useApp();

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<string>('');
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Calendar View Toggles
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [holidays, setHolidays] = useState<{ date: string; localName: string; name: string }[]>([]);
  const [showBookingPopup, setShowBookingPopup] = useState(false);

  // Booking Form State Variables
  const [bookingDate, setBookingDate] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [packageName, setPackageName] = useState('Standard');
  const [estimatedGuests, setEstimatedGuests] = useState(500);
  const [hasDecor, setHasDecor] = useState(true);
  const [hasCatering, setHasCatering] = useState(false);

  // Local Guest Details & OTP Checkout
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [otpStep, setOtpStep] = useState<'details' | 'otp' | 'verified'>('details');
  const [localOtp, setLocalOtp] = useState<string[]>(['', '', '', '']);
  const [sentOtp, setSentOtp] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);

  // Local checkout payment details
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI'>('UPI');
  const [refNum, setRefNum] = useState('');
  const [isBookedSuccess, setIsBookedSuccess] = useState(false);

  // Calendar filter state
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'mugurtham' | 'holiday' | 'available'>('all');

  const getTamilDateStr = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const m = parts[1];
    const d = parseInt(parts[2], 10);
    
    if (m === '01') {
      if (d < 14) return `மார்கழி ${d + 17}`;
      return `தை ${d - 13}`;
    }
    if (m === '02') {
      if (d < 13) return `தை ${d + 18}`;
      return `மாசி ${d - 12}`;
    }
    if (m === '03') {
      if (d < 14) return `மாசி ${d + 16}`;
      return `பங்குனி ${d - 13}`;
    }
    if (m === '04') {
      if (d < 14) return `பங்குனி ${d + 18}`;
      return `சித்திரை ${d - 13}`;
    }
    if (m === '05') {
      if (d < 15) return `சித்திரை ${d + 17}`;
      return `வைகாசி ${d - 14}`;
    }
    if (m === '06') {
      if (d < 15) return `வைகாசி ${d + 16}`;
      return `ஆனி ${d - 14}`;
    }
    if (m === '07') {
      if (d < 16) return `ஆனி ${d + 16}`;
      return `ஆடி ${d - 15}`;
    }
    if (m === '08') {
      if (d < 17) return `ஆடி ${d + 16}`;
      return `ஆவணி ${d - 16}`;
    }
    if (m === '09') {
      if (d < 17) return `ஆவணி ${d + 15}`;
      return `புரட்டாசி ${d - 16}`;
    }
    if (m === '10') {
      if (d < 18) return `புரட்டாசி ${d + 14}`;
      return `ஐப்பசி ${d - 17}`;
    }
    if (m === '11') {
      if (d < 17) return `ஐப்பசி ${d + 14}`;
      return `கார்த்திகை ${d - 16}`;
    }
    if (m === '12') {
      if (d < 16) return `கார்த்திகை ${d + 14}`;
      return `மார்கழி ${d - 15}`;
    }
    return '';
  };

  // Birth Chart Compatibility states
  const [birthDate, setBirthDate] = useState('1990-05-15');
  const [birthTime, setBirthTime] = useState('10:30');
  const [birthPlace, setBirthPlace] = useState('New Delhi');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.209);
  const [astroData, setAstroData] = useState<any>(null);
  const [isAstroLoading, setIsAstroLoading] = useState(false);
  const [selectedChartStyle, setSelectedChartStyle] = useState<'southIndian' | 'northIndian'>('southIndian');

  const handleCityChange = (city: string) => {
    setBirthPlace(city);
    if (city === 'New Delhi') { setLatitude(28.6139); setLongitude(77.209); }
    else if (city === 'Chennai') { setLatitude(13.0827); setLongitude(80.2707); }
    else if (city === 'Bangalore') { setLatitude(12.9716); setLongitude(77.5946); }
    else if (city === 'Mumbai') { setLatitude(19.0760); setLongitude(72.8777); }
    else if (city === 'Kolkata') { setLatitude(22.5726); setLongitude(88.3639); }
    else if (city === 'Madurai') { setLatitude(9.9252); setLongitude(78.1198); }
  };

  const handleFetchBirthChart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAstroLoading(true);
    setAstroData(null);
    try {
      const datetimeStr = `${birthDate}T${birthTime}:00+05:30`;
      const response = await fetch('https://api.vedika.io/sandbox/birth-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          datetime: datetimeStr,
          latitude: Number(latitude),
          longitude: Number(longitude),
          timezone: 'Asia/Kolkata'
        })
      });
      const result = await response.json();
      if (result.success) {
        setAstroData(result.data);
        addToast('Astro Chart Generated', 'Successfully compiled Vedic birth chart and compatibility statistics.', 'success');
      } else {
        alert(result.error || 'Failed to generate birth chart from sandbox.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching birth chart from sandbox API.');
    } finally {
      setIsAstroLoading(false);
    }
  };

  // Handle URL query parameters from Quick Widget
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const query = hash.substring(hash.indexOf('?') + 1);
      const params = new URLSearchParams(query);
      const dateVal = params.get('date');
      if (dateVal) {
        setSelectedDate(dateVal);
        setBookingDate(dateVal);
        const yr = parseInt(dateVal.split('-')[0], 10);
        if (!isNaN(yr)) setSelectedYear(yr);
        const mn = parseInt(dateVal.split('-')[1], 10) - 1;
        if (!isNaN(mn)) setCurrentMonth(mn);
        
        // Open booking directly
        const status = getMahalDayStatus(dateVal);
        if (status === 'available' || status === 'pending') {
          setShowBookingPopup(true);
        }
      }
    }
  }, []);

  // Fetch Public Holidays from Nager.date free API
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${selectedYear}/IN`);
        if (res.ok) {
          const data = await res.json();
          setHolidays(data);
        }
      } catch (err) {
        console.error('Failed to fetch public holidays:', err);
      }
    };
    fetchHolidays();
  }, [selectedYear]);

  // Synchronize Guest Details based on login state
  useEffect(() => {
    if (showBookingPopup) {
      if (customerUser) {
        setOtpStep('verified');
        setGuestName(customerUser.name);
        setGuestPhone(customerUser.phone);
        setGuestEmail(customerUser.email);
      } else {
        setOtpStep('details');
        setGuestName('');
        setGuestPhone('');
        setGuestEmail('');
        setLocalOtp(['', '', '', '']);
        setSentOtp('');
      }
      setIsBookedSuccess(false);
      setRefNum('');
    }
  }, [showBookingPopup, customerUser]);

  const years = [2025, 2026, 2027];

  const packagesData = mahalConfig.packages || [
    {
      name: 'Basic',
      price: 100000,
      description: 'Banquet Hall rental only. Cleaning and basic setup included. Ideal for conferences.',
      amenities: ['AC Hall Access', 'Standard Chairs (1000)', 'Basic Stage Lighting', 'Two Green Rooms', 'Generator Backup']
    },
    {
      name: 'Standard',
      price: 150000,
      description: 'Hall rental with basic stage floral decoration, premium chair covers, and sound system support.',
      amenities: ['AC Hall Access', 'Premium Seat Covers', 'Standard Floral Stage Decoration', 'Two Green Rooms', 'Sound System', 'Generator Backup']
    },
    {
      name: 'Premium',
      price: 220000,
      description: 'All-inclusive premium experience featuring luxury theme floral decoration, stage LED screen, and buffet tables.',
      amenities: ['AC Hall Access', 'Luxury Sofa Seating', 'Premium Theme Floral Decor', 'Two AC Green Rooms', 'Stage LED Screen (16x9)', 'Professional Sound System', 'Buffet Warming Tables', 'Welcome Desk Service']
    }
  ];

  // Calendar Math: Days compiler
  const getDaysInMonth = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 6 = Sat
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: { dateStr: string; dayNum: number; isPadding: boolean }[] = [];
    
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dateStr: '', dayNum: 0, isPadding: true });
    }
    
    for (let day = 1; day <= totalDays; day++) {
      const formattedMonth = String(month + 1).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      days.push({
        dateStr: `${year}-${formattedMonth}-${formattedDay}`,
        dayNum: day,
        isPadding: false
      });
    }
    
    return days;
  };

  const getMahalDayStatus = (dateStr: string): 'available' | 'booked' | 'blocked' | 'maintenance' | 'pending' | 'none' => {
    if (!dateStr) return 'none';
    
    const booking = bookings.find(b => {
      if (b.serviceType !== 'mahal') return false;
      if (['Cancelled', 'No-show'].includes(b.status)) return false;
      return b.checkInDate === dateStr;
    });

    if (!booking) return 'available';

    switch (booking.status) {
      case 'Blocked':
        return 'blocked';
      case 'Maintenance':
        return 'maintenance';
      case 'Confirmed':
      case 'Completed':
      case 'Checked-in':
      case 'Checked-out':
        return 'booked';
      case 'Inquiry':
      case 'Pending':
      default:
        return 'pending';
    }
  };

  // Check Mugurtham/Divine/Holiday status programmatically
  const getDayInfo = (dateStr: string) => {
    if (!dateStr) return null;
    
    // Check API Indian holidays
    const apiHoliday = holidays.find(h => h.date === dateStr);
    if (apiHoliday) {
      return { type: 'holiday' as const, name: apiHoliday.localName || apiHoliday.name };
    }

    // Check Tamil Divine Festival Dates (Festival Calendar)
    const divineMatches: { [key: string]: string } = {
      '01-14': 'Thai Pongal 🌾',
      '01-15': 'Mattu Pongal 🐂',
      '01-16': 'Thiruvalluvar Day ✍️',
      '02-15': 'Mahashivaratri 🔱',
      '04-14': 'Tamil New Year 🌸',
      '05-01': 'Chitra Pournami 🌕',
      '09-15': 'Vinayagar Chaturthi 🐘',
      '10-20': 'Ayudha Pooja 🛠️',
      '10-21': 'Vijaya Dasami 🏹',
      '11-08': 'Diwali Festival 🪔',
      '12-25': 'Christmas Day 🎄'
    };

    const monthDay = dateStr.substring(5); // "MM-DD"
    if (divineMatches[monthDay]) {
      return { type: 'divine' as const, name: divineMatches[monthDay] };
    }

    // Seed Mugurtham days for 2026
    const mugurthamDays2026: { [key: string]: number[] } = {
      '01': [18, 25, 29],
      '02': [5, 11, 22],
      '03': [8, 15, 20],
      '04': [12, 19, 26],
      '05': [3, 10, 18, 24],
      '06': [7, 14, 21, 28],
      '07': [5, 12, 19],
      '08': [16, 23, 30],
      '09': [6, 13, 27],
      '10': [11, 18, 25],
      '11': [8, 15, 22],
      '12': [6, 13, 20]
    };

    const m = dateStr.substring(5, 7); // "MM"
    const d = parseInt(dateStr.substring(8, 10), 10); // "DD"
    
    if (mugurthamDays2026[m] && mugurthamDays2026[m].includes(d)) {
      return { type: 'mugurtham' as const, name: 'Valarpirai Mugurtham 🌟' };
    }

    return null;
  };

  const handleCellClick = (dateStr: string) => {
    if (!dateStr) return;
    
    const status = getMahalDayStatus(dateStr);
    
    if (status === 'booked') {
      alert('Sorry, this date is already booked.');
      return;
    }
    if (status === 'blocked') {
      alert('Sorry, this date is blocked for management reservations.');
      return;
    }
    if (status === 'maintenance') {
      alert('Sorry, this date is unavailable due to scheduled hall maintenance.');
      return;
    }
    if (status === 'pending') {
      alert('This date has a pending inquiry. However, you can still place your check-out details.');
    }

    setSelectedDate(dateStr);
    setBookingDate(dateStr);
    setShowBookingPopup(true);
  };

  const handleBookClick = () => {
    if (!selectedDate) {
      alert('Please select an available event date from the calendar.');
      return;
    }
    setBookingDate(selectedDate);
    setShowBookingPopup(true);
  };

  // Mock OTP handlers inside booking popup
  const handleSendLocalOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!guestName.trim() || guestPhone.length < 10 || !guestEmail.trim()) {
      alert('Please fill in your name, 10-digit mobile number, and email.');
      return;
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setSentOtp(code);
    setOtpStep('otp');

    setTimeout(() => {
      addToast('🔑 Mock SMS Gateway', `OTP Sent to ${guestPhone}: ${code}`, 'warning');
    }, 400);

    setIsAutofilling(true);
    setTimeout(() => {
      code.split('').forEach((char, idx) => {
        setTimeout(() => {
          setLocalOtp(prev => {
            const next = [...prev];
            next[idx] = char;
            return next;
          });
        }, idx * 250);
      });
      setIsAutofilling(false);
    }, 1500);
  };

  const handleVerifyLocalOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    const entered = localOtp.join('');
    if (entered !== sentOtp) {
      alert('Invalid OTP. Please check the code in the mock gateway toast.');
      return;
    }
    loginCustomer(guestName, guestPhone, guestEmail);
    setOtpStep('verified');
  };

  // Checkout submission
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (payMethod === 'UPI' && !refNum.trim()) {
      alert('Please enter your UPI transaction reference number.');
      return;
    }

    const pkgPrice = packageName === 'Basic' ? 100000 : (packageName === 'Standard' ? 150000 : 220000);
    const decorPrice = hasDecor ? 25000 : 0;
    const cateringPrice = hasCatering ? (estimatedGuests * 350) : 0;
    const subtotal = pkgPrice + decorPrice + cateringPrice;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    const advanceAmount = 30000; // fixed advance

    const res = addBooking({
      customerName: guestName,
      customerPhone: guestPhone,
      customerEmail: guestEmail,
      customerAddress: 'Verified online customer check-out',
      serviceType: 'mahal',
      serviceId: 'mahal-sv',
      checkInDate: bookingDate,
      checkOutDate: bookingDate,
      guestCount: Number(estimatedGuests),
      idType: 'Aadhaar Card',
      idNumber: 'VERIFIED-OTP',
      specialRequirements: `Mugurtham/Divine Booking Inquiry via Calendar Checkout.\n[Payment Ref: ${refNum || 'Cash Counter'}]`,
      packageName: packageName,
      eventDetails: {
        eventType: eventType,
        decorator: hasDecor,
        catering: hasCatering
      },
      financials: {
        subtotal: subtotal,
        discount: 0,
        tax: tax,
        total: total,
        advancePaid: advanceAmount,
        balanceDue: Math.max(0, total - advanceAmount)
      },
      status: 'Confirmed'
    });

    if (res.success) {
      setIsBookedSuccess(true);
      addToast('🎉 Booking Confirmed', `Grand SV Mahal is reserved for you on ${bookingDate}!`, 'success');
      setTimeout(() => {
        setShowBookingPopup(false);
        setIsBookedSuccess(false);
        setSelectedDate('');
      }, 2500);
    } else {
      alert(res.error || 'Failed to create booking.');
    }
  };

  // Render Mini Month View (Year view grids)
  const renderMiniMonth = (monthIdx: number) => {
    const days = getDaysInMonth(selectedYear, monthIdx);
    const dateObj = new Date(selectedYear, monthIdx, 1);
    const monthName = dateObj.toLocaleString('default', { month: 'long' });
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <div
        key={monthIdx}
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <h5 style={{ textAlign: 'center', margin: '0 0 10px 0', fontSize: '0.9rem', color: '#0F172A', fontWeight: 700 }}>
          {monthName}
        </h5>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', marginBottom: '4px' }}>
          {weekdays.map((w, idx) => <div key={idx}>{w}</div>)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map((day, idx) => {
            if (day.isPadding) {
              return <div key={`pad-${idx}`} />;
            }

            const status = getMahalDayStatus(day.dateStr);
            const isSelected = day.dateStr === selectedDate;
            const dayInfo = getDayInfo(day.dateStr);

            let cellBg = '#FFFFFF';
            let cellBorder = '1px solid #F1F5F9';
            let cellColor = '#334155';

            if (status === 'booked') {
              cellBg = '#FEE2E2';
              cellBorder = '1px solid #FCA5A5';
              cellColor = '#B91C1C';
            } else if (status === 'pending') {
              cellBg = '#FEF3C7';
              cellBorder = '1px solid #FDE68A';
              cellColor = '#B45309';
            } else if (status === 'blocked') {
              cellBg = '#E2E8F0';
              cellBorder = '1px solid #CBD5E1';
              cellColor = '#475569';
            } else if (status === 'maintenance') {
              cellBg = '#DBEAFE';
              cellBorder = '1px solid #BFDBFE';
              cellColor = '#1D4ED8';
            } else {
              // Check Auspicious Types
              if (dayInfo) {
                if (dayInfo.type === 'mugurtham') {
                  cellBg = '#FEF3C7'; // Gold
                  cellBorder = '1px solid #FCD34D';
                  cellColor = '#92400E';
                } else if (dayInfo.type === 'divine') {
                  cellBg = '#FCE7F3'; // Pink
                  cellBorder = '1px solid #F9A8D4';
                  cellColor = '#9D174D';
                } else if (dayInfo.type === 'holiday') {
                  cellBg = '#FEE2E2'; // Red
                  cellBorder = '1px solid #FCA5A5';
                  cellColor = '#991B1B';
                }
              } else {
                // Regular Available
                cellBg = '#DCFCE7';
                cellBorder = '1px solid #A7F3D0';
                cellColor = '#15803D';
              }
            }

            if (isSelected) {
              cellBg = '#0284C7';
              cellBorder = '1px solid #0284C7';
              cellColor = '#FFFFFF';
            }

            const isDimmed = calendarFilter === 'mugurtham' && (!dayInfo || dayInfo.type !== 'mugurtham')
              || calendarFilter === 'holiday' && (!dayInfo || (dayInfo.type !== 'holiday' && dayInfo.type !== 'divine'))
              || calendarFilter === 'available' && status !== 'available';

            return (
              <div
                key={day.dateStr}
                onClick={() => handleCellClick(day.dateStr)}
                style={{
                  aspectRatio: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 800 : 600,
                  borderRadius: '3px',
                  backgroundColor: cellBg,
                  border: cellBorder,
                  color: cellColor,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  transform: hoveredDate === day.dateStr ? 'scale(1.2)' : 'none',
                  zIndex: hoveredDate === day.dateStr ? 10 : 1,
                  opacity: isDimmed ? 0.25 : 1
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPos({ x: rect.left + window.scrollX + rect.width / 2, y: rect.top + window.scrollY - 8 });
                  setHoveredDate(day.dateStr);
                  setHoveredStatus(status);
                }}
                onMouseLeave={() => {
                  setHoveredDate(null);
                }}
              >
                {day.dayNum}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Large Month View (Default View)
  const renderLargeMonth = (monthIdx: number) => {
    const days = getDaysInMonth(selectedYear, monthIdx);
    const dateObj = new Date(selectedYear, monthIdx, 1);
    const monthName = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
      <div 
        style={{ 
          backgroundColor: '#FFFFFF', 
          border: '1px solid #D2E3F8', 
          borderRadius: '12px', 
          padding: '24px', 
          boxShadow: 'var(--shadow-md)' 
        }} 
        className="animate-scale-bounce"
      >
        {/* Large Month Selector Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)}
            style={{ border: 'none', background: '#F1F5F9', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={20} color="#0F2942" />
          </button>
          
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F2942', margin: 0 }}>
            {monthName}
          </h4>
          
          <button 
            onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)}
            style={{ border: 'none', background: '#F1F5F9', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronRight size={20} color="#0F2942" />
          </button>
        </div>

        {/* Weekdays Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#64748B', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', marginBottom: '10px' }}>
          {weekdays.map((w, i) => (
            <div key={i} style={{ color: i === 0 || i === 6 ? '#DC2626' : '#64748B' }}>
              {w.substring(0, 3)}
            </div>
          ))}
        </div>

        {/* Large Cells Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {days.map((day, idx) => {
            if (day.isPadding) {
              return <div key={`pad-${idx}`} style={{ minHeight: '80px', backgroundColor: '#FAFAFA', borderRadius: '6px' }} />;
            }

            const status = getMahalDayStatus(day.dateStr);
            const isSelected = day.dateStr === selectedDate;
            const dayInfo = getDayInfo(day.dateStr);

            let cellBg = '#FFFFFF';
            let cellBorder = '1px solid #E2E8F0';
            let cellColor = '#0F2942';
            let badgeText = '';
            let badgeBg = '';
            let badgeColor = '';

            if (status === 'booked') {
              cellBg = '#FEE2E2';
              cellBorder = '1px solid #FCA5A5';
              cellColor = '#991B1B';
              badgeText = '🔴 Booked';
              badgeBg = '#FEE2E2';
              badgeColor = '#991B1B';
            } else if (status === 'blocked' || status === 'maintenance') {
              cellBg = '#F1F5F9';
              cellBorder = '1px solid #CBD5E1';
              cellColor = '#475569';
              badgeText = '⚪ Blocked';
              badgeBg = '#E2E8F0';
              badgeColor = '#475569';
            } else {
              // Check Auspicious Badges
              if (dayInfo) {
                if (dayInfo.type === 'mugurtham') {
                  cellBg = '#FEF3C7';
                  cellBorder = '1px solid #FCD34D';
                  cellColor = '#92400E';
                  badgeText = '🌟 Mugurtham';
                  badgeBg = '#FEF3C7';
                  badgeColor = '#92400E';
                } else if (dayInfo.type === 'divine') {
                  cellBg = '#FCE7F3';
                  cellBorder = '1px solid #F9A8D4';
                  cellColor = '#9D174D';
                  badgeText = dayInfo.name;
                  badgeBg = '#FCE7F3';
                  badgeColor = '#9D174D';
                } else if (dayInfo.type === 'holiday') {
                  cellBg = '#FEE2E2';
                  cellBorder = '1px solid #FCA5A5';
                  cellColor = '#991B1B';
                  badgeText = dayInfo.name;
                  badgeBg = '#FEE2E2';
                  badgeColor = '#991B1B';
                }
              } else {
                // Available
                cellBg = '#E8F5E9';
                cellBorder = '1px solid #A5D6A7';
                cellColor = '#2E7D32';
                badgeText = '🟢 Available';
                badgeBg = '#E8F5E9';
                badgeColor = '#2E7D32';
              }
            }

            if (isSelected) {
              cellBg = '#0284C7';
              cellBorder = '1px solid #0284C7';
              cellColor = '#FFFFFF';
            }

            const isDimmed = calendarFilter === 'mugurtham' && (!dayInfo || dayInfo.type !== 'mugurtham')
              || calendarFilter === 'holiday' && (!dayInfo || (dayInfo.type !== 'holiday' && dayInfo.type !== 'divine'))
              || calendarFilter === 'available' && status !== 'available';

            return (
              <div
                key={day.dateStr}
                onClick={() => handleCellClick(day.dateStr)}
                style={{
                  minHeight: '80px',
                  borderRadius: '6px',
                  backgroundColor: cellBg,
                  border: cellBorder,
                  color: cellColor,
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  transform: hoveredDate === day.dateStr ? 'translateY(-2px)' : 'none',
                  boxShadow: hoveredDate === day.dateStr ? '0 4px 8px rgba(2, 132, 199, 0.1)' : 'none',
                  zIndex: hoveredDate === day.dateStr ? 5 : 1,
                  opacity: isDimmed ? 0.25 : 1
                }}
                onMouseEnter={() => setHoveredDate(day.dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>{day.dayNum}</span>
                  <span style={{ fontSize: '0.66rem', color: isSelected ? 'rgba(255,255,255,0.7)' : '#64748B', fontWeight: 600 }}>
                    {getTamilDateStr(day.dateStr)}
                  </span>
                </div>
                {badgeText && (
                  <div
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      padding: '2px 4px',
                      borderRadius: '3px',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : badgeBg,
                      color: isSelected ? '#FFFFFF' : badgeColor,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {badgeText}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Compute pricing totals for summary checkout
  const pkgPrice = packageName === 'Basic' ? 100000 : (packageName === 'Standard' ? 150000 : 220000);
  const decorPrice = hasDecor ? 25000 : 0;
  const cateringPrice = hasCatering ? (estimatedGuests * 350) : 0;
  const subtotalPrice = pkgPrice + decorPrice + cateringPrice;
  const taxPrice = subtotalPrice * 0.18;
  const totalAmountPrice = subtotalPrice + taxPrice;
  const advanceAmountPrice = 30000;

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0' }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <span style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
            SV MAHAL
          </span>
          <h2 style={{ fontSize: '2.5rem', color: '#0F172A', marginBottom: '8px' }}>Grand Banquet Hall & Celebrations</h2>
          <p style={{ color: '#64748B', maxWidth: '650px', margin: '0 auto' }}>
            Chengam's luxury AC banquet facility featuring premium decoration packages, 1000+ guest capacity, and professional catering equipment.
          </p>
        </div>

        {/* Authentic Property Photography */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}
        >
          {/* Day View */}
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              position: 'relative'
            }}
          >
            <div style={{ height: '260px', overflow: 'hidden' }}>
              <img
                src="/images/sv-mahal-day.webp"
                alt="SV Thirumana Mahal Front View"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                DAYTIME ARCHITECTURE
              </div>
              <h4 style={{ margin: '4px 0 2px 0', fontSize: '1.1rem', color: '#0F172A', fontWeight: 800 }}>
                Grand Facade & Temple Shrine
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                Iconic purple & pink facade with sacred temple gopuram shrine in the front courtyard.
              </p>
            </div>
          </div>

          {/* Night View */}
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              position: 'relative'
            }}
          >
            <div style={{ height: '260px', overflow: 'hidden' }}>
              <img
                src="/images/sv-mahal-night.webp"
                alt="SV Thirumana Mahal Night Illumination"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '0.72rem', color: '#C9A227', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FESTIVE EVENT ILLUMINATION
              </div>
              <h4 style={{ margin: '4px 0 2px 0', fontSize: '1.1rem', color: '#0F172A', fontWeight: 800 }}>
                Wedding Evening Light Spectacular
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                Multi-color LED lighting, grand portico, and dining entrance for celebrations.
              </p>
            </div>
          </div>
        </div>

        {/* 43 Authentic Stage & Mandapam Decors Showcase */}
        <MahalDecorsGallery />

        {/* Features & Details Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '30px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
            marginBottom: '50px'
          }}
        >
          {/* Facilities list */}
          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#0F172A', marginBottom: '16px', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
              Premium Venue Facilities
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mahalConfig.amenities?.map((amenity, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#475569' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color="#16A34A" />
                  </div>
                  {amenity}
                </div>
              )) || (
                <div>Loading amenities...</div>
              )}
            </div>
            
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                <strong style={{ color: '#0F172A' }}>Venue Location:</strong> Main Road, Thukkapet, Chengam, Tamil Nadu - 606701
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  <strong style={{ color: '#0F172A' }}>Direct Inquiries & Astrological Date Booking:</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <a
                    href="tel:+919500821550"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      backgroundColor: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      borderRadius: '6px',
                      color: '#0369A1',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={14} /> Desk: 95008 21550
                  </a>
                  <a
                    href="tel:+919043780215"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      backgroundColor: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      borderRadius: '6px',
                      color: '#0369A1',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={14} /> Support: 90437 80215
                  </a>
                  <a
                    href="https://wa.me/919500821550?text=Hello%20SV%20Mahal%2C%20I%20am%20inquiring%20about%20booking%20dates%20and%20rates."
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #86EFAC',
                      borderRadius: '6px',
                      color: '#15803D',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <MessageCircle size={14} /> WhatsApp Chat
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Config block */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#0F172A', fontWeight: 700 }}>
              Astrological Mugurtham Calendars
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Our calendar filters Valarpirai Mugurtham 🌟 and traditional divine festival days 🌺. 
              Secure your dates early as auspicious slots book out fast!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                <span>Basic Package Rent:</span>
                <strong>₹1,00,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                <span>Standard Package Rent:</span>
                <strong>₹1,50,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                <span>Premium Package Rent:</span>
                <strong>₹2,20,000</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <section style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '1.6rem', color: '#0F172A', fontWeight: 800, textAlign: 'center', marginBottom: '32px', fontFamily: 'var(--font-sans)' }}>
            Choose Event Booking Packages
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {packagesData.map(pkg => (
              <div
                key={pkg.name}
                className="interactive-hover-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '30px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {pkg.name === 'Premium' && (
                  <div style={{ position: 'absolute', top: '-12px', right: '20px', backgroundColor: '#0284C7', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={10} fill="#FFFFFF" /> RECOMMENDED
                  </div>
                )}
                
                <h4 style={{ fontSize: '1.25rem', color: '#0F172A', margin: '0 0 8px 0', fontWeight: 800 }}>{pkg.name}</h4>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284C7' }}>₹{pkg.price.toLocaleString()}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}> / Event</span>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 20px 0', flexGrow: 1 }}>
                  {pkg.description}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                  {pkg.amenities?.map((amenity: string) => (
                    <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
                      <Check size={12} color="#16A34A" /> {amenity}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 1-YEAR / MONTHLY AVAILABILITY CALENDAR BLOCK */}
        <section style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          
          {/* Year header navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: 700, margin: 0, fontFamily: 'var(--font-sans)' }}>
                SV Mahal Booking Availability Calendar
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '4px 0 0 0' }}>
                Select an available date to open the reservation checkout form popup.
              </p>
            </div>
            
            {/* View selectors */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Month/Year toggle */}
              <div style={{ display: 'flex', border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden', marginRight: '10px' }}>
                <button
                  onClick={() => setViewType('month')}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    backgroundColor: viewType === 'month' ? '#0284C7' : '#FFFFFF',
                    color: viewType === 'month' ? '#FFFFFF' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Month View
                </button>
                <button
                  onClick={() => setViewType('year')}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    backgroundColor: viewType === 'year' ? '#0284C7' : '#FFFFFF',
                    color: viewType === 'year' ? '#FFFFFF' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Year View
                </button>
              </div>

              {/* Year list */}
              <div style={{ display: 'flex', border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden' }}>
                {years.map(yr => (
                  <button
                    key={yr}
                    onClick={() => {
                      setSelectedYear(yr);
                      setSelectedDate('');
                    }}
                    style={{
                      padding: '8px 14px',
                      border: 'none',
                      backgroundColor: selectedYear === yr ? '#0F172A' : '#FFFFFF',
                      color: selectedYear === yr ? '#FFFFFF' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Color Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '20px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7' }} /> Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }} /> 🌟 Mugurtham (Auspicious)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FCE7F3', border: '1px solid #F9A8D4' }} /> 🌺 Festival Day
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} /> 📌 Public Holiday
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2' }} /> Booked
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#E2E8F0', border: '1px solid #CBD5E1' }} /> Blocked
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            <button
              onClick={() => setCalendarFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: calendarFilter === 'all' ? '#0F172A' : '#F1F5F9',
                color: calendarFilter === 'all' ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              All Days
            </button>
            <button
              onClick={() => setCalendarFilter('mugurtham')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: calendarFilter === 'mugurtham' ? '#D97706' : '#FEF3C7',
                color: calendarFilter === 'mugurtham' ? '#FFFFFF' : '#B45309',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🌟 Mugurtham Days
            </button>
            <button
              onClick={() => setCalendarFilter('holiday')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: calendarFilter === 'holiday' ? '#DC2626' : '#FEE2E2',
                color: calendarFilter === 'holiday' ? '#FFFFFF' : '#991B1B',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🌺 Festivals & Holidays
            </button>
            <button
              onClick={() => setCalendarFilter('available')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: calendarFilter === 'available' ? '#16A34A' : '#E8F5E9',
                color: calendarFilter === 'available' ? '#FFFFFF' : '#1B5E20',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🟢 Available Only
            </button>
          </div>

          {/* Main Grid display area */}
          {viewType === 'month' ? (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {renderLargeMonth(currentMonth)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(m => renderMiniMonth(m))}
            </div>
          )}

          {/* Selected Date Action Panel (for non-popups if needed) */}
          {selectedDate && !showBookingPopup && (
            <div
              className="animate-fade-in"
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                marginTop: '30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>SELECTED EVENT DATE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} color="#0284C7" /> {selectedDate}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 600, marginTop: '2px' }}>
                  🟢 Date is available for booking.
                </div>
              </div>

              <button
                onClick={handleBookClick}
                style={{
                  padding: '12px 30px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                Proceed to Booking Form
              </button>
            </div>
          )}
        </section>

        {/* ASTRO-COMPATIBILITY & KUNDALI MATCHING PANEL */}
        <section
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '30px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
            marginTop: '30px'
          }}
        >
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={22} color="#D97706" /> Vedic Kundali Compatibility Audit
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '4px 0 0 0' }}>
              Generate your Vedic birth chart (Kundali) using sandbox intelligence and audit compatibility with your selected calendar event date.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            
            {/* Left side: Inputs form */}
            <form
              onSubmit={handleFetchBirthChart}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🕉️ Birth Particulars
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>BIRTH DATE</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>BIRTH TIME</label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>BIRTH CITY</label>
                  <select
                    value={birthPlace}
                    onChange={(e) => handleCityChange(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value="New Delhi">New Delhi</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Custom">Custom Coordinates</option>
                  </select>
                </div>
              </div>

              {birthPlace === 'Custom' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="animate-fade-in">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>LATITUDE</label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>LONGITUDE</label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isAstroLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(217, 119, 6, 0.2)',
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px'
                }}
              >
                {isAstroLoading ? 'Auditing Vedic Coordinates...' : '🔮 Generate Kundali & Audit Match'}
              </button>
            </form>

            {/* Right side: Results view */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: astroData ? 'flex-start' : 'center',
                alignItems: astroData ? 'stretch' : 'center',
                minHeight: '320px',
                textAlign: astroData ? 'left' : 'center',
                boxShadow: 'inset 0 0 12px rgba(0,0,0,0.01)'
              }}
            >
              {!astroData && !isAstroLoading && (
                <div style={{ color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px' }}>
                  <Compass size={40} color="#94A3B8" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Kundali Panel Offline</span>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8', maxWidth: '280px', lineHeight: 1.4 }}>
                    Provide your birth details and click "Generate Kundali" to calculate lagna, tithi, nakshatras, and marriage compatibility weights.
                  </p>
                </div>
              )}

              {isAstroLoading && (
                <div style={{ color: '#94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#D97706', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D97706' }}>Contacting Sandbox Ephemeris...</span>
                </div>
              )}

              {astroData && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Title & compatibility badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>COMPATIBILITY RATING</span>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A', fontWeight: 800 }}>
                        {selectedDate ? `Match for ${selectedDate}` : 'Lagna Alignment details'}
                      </h4>
                    </div>
                    
                    <div style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', color: '#D97706', fontWeight: 800, fontSize: '0.85rem' }}>
                      {selectedDate ? (getDayInfo(selectedDate)?.type === 'mugurtham' ? '🌟 96% (Auspicious)' : '🌸 88% (Compatible)') : '🌟 90% (Good)'}
                    </div>
                  </div>

                  {/* Two column breakdown: Chart vs Text */}
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    
                    {/* SVG Chart display */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                      <div 
                        style={{ 
                          width: '280px', 
                          height: '280px', 
                          border: '1px solid #CBD5E1', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: selectedChartStyle === 'southIndian' ? astroData.chart.southIndian : astroData.chart.northIndian 
                        }}
                      />
                      
                      {/* Chart style swapper */}
                      <div style={{ display: 'flex', border: '1px solid #CBD5E1', borderRadius: '4px', overflow: 'hidden', scale: '0.9' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedChartStyle('southIndian')}
                          style={{ padding: '4px 10px', border: 'none', backgroundColor: selectedChartStyle === 'southIndian' ? '#475569' : '#FFFFFF', color: selectedChartStyle === 'southIndian' ? '#FFFFFF' : '#475569', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          South Indian
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedChartStyle('northIndian')}
                          style={{ padding: '4px 10px', border: 'none', backgroundColor: selectedChartStyle === 'northIndian' ? '#475569' : '#FFFFFF', color: selectedChartStyle === 'northIndian' ? '#FFFFFF' : '#475569', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          North Indian
                        </button>
                      </div>
                    </div>

                    {/* Vedic parameters list */}
                    <div style={{ flexGrow: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                        <div style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>TITHI</span>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{astroData.tithi}</span>
                        </div>
                        <div style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>NAKSHATRA</span>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{astroData.ascendant?.nakshatra?.name || astroData.nakshatra}</span>
                        </div>
                        <div style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>MOON SIGN (RASI)</span>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{astroData.moonSign || astroData.ascendant?.sign}</span>
                        </div>
                        <div style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>LAGNA (ASCENDANT)</span>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{astroData.ascendant?.sign}</span>
                        </div>
                      </div>

                      {/* Overview text */}
                      <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4, borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                        <strong>Interpretation Summary</strong>: {astroData.summary?.overview}
                      </div>

                      {/* Strengths & Challenges */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                        <div>
                          <strong style={{ color: '#16A34A' }}>Key Strengths: </strong>
                          <span>{astroData.summary?.keyStrengths?.join(', ')}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#DC2626' }}>Challenges: </strong>
                          <span>{astroData.summary?.areasOfFocus?.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>
        </section>


      </div>

      {/* 1. Tooltip Hover Layer (Used for Year view) */}
      {hoveredDate && viewType === 'year' && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#0F2942',
            color: '#FFFFFF',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            zIndex: 1000,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '150px',
            textAlign: 'center'
          }}
        >
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '4px', fontSize: '0.7rem', color: '#94A3B8' }}>
            {new Date(hoveredDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '2px' }}>
            {hoveredStatus === 'available' && '🟢 Available'}
            {hoveredStatus === 'booked' && '🔴 Fully Booked'}
            {hoveredStatus === 'pending' && '🟡 Pending Inquiry'}
            {hoveredStatus === 'maintenance' && '🔵 Under Maintenance'}
            {hoveredStatus === 'blocked' && '⚪ Reserved'}
          </div>
          {/* Tooltip Arrow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '8px',
              height: '8px',
              backgroundColor: '#0F2942'
            }}
          />
        </div>
      )}

      {/* 2. Customer OTP Login Modal (Global Trigger) */}
      <CustomerLoginModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          if (selectedDate) {
            setBookingDate(selectedDate);
            setShowBookingPopup(true);
          }
        }}
      />

      {/* 3. Popup Direct Booking Form Modal */}
      {showBookingPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 41, 66, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'var(--font-sans)'
          }}
          className="animate-fade-in"
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid #D2E3F8',
              padding: '28px',
              position: 'relative'
            }}
            className="animate-scale-bounce"
          >
            {/* Header */}
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '20px' }}>
              <button
                onClick={() => setShowBookingPopup(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              <h3 style={{ fontSize: '1.4rem', color: '#0F2942', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={22} fill="#C9A227" color="#C9A227" /> Reserve SV Mahal
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
                Selected Date: <strong>{bookingDate}</strong> {getDayInfo(bookingDate) ? `(${getDayInfo(bookingDate)?.name})` : ''}
              </p>
            </div>

            {/* Success animation block */}
            {isBookedSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }} className="animate-scale-bounce">
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                  <Check size={40} color="#16A34A" />
                </div>
                <h4 style={{ fontSize: '1.5rem', color: '#16A34A', fontWeight: 800, marginBottom: '8px' }}>Reserve Confirmed!</h4>
                <p style={{ color: '#475569', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
                  Your event registration details are recorded. SV Mahal is blocked for your celebrations!
                </p>
              </div>
            ) : (
              /* Booking Form Content */
              <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Event setup parameters */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>EVENT TYPE</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Reception">Reception</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Birthday">Birthday Party</option>
                      <option value="Corporate Function">Corporate / Conferences</option>
                      <option value="Other Function">Other Celebrations</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>VENUE PACKAGE</label>
                    <select
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
                    >
                      <option value="Basic">Basic (₹1,00,000)</option>
                      <option value="Standard">Standard (₹1,50,000)</option>
                      <option value="Premium">Premium (₹2,20,000)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>ESTIMATED GUESTS</label>
                    <input
                      type="number"
                      required
                      min={50}
                      max={2000}
                      value={estimatedGuests}
                      onChange={(e) => setEstimatedGuests(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasDecor} onChange={(e) => setHasDecor(e.target.checked)} /> Decor Extras (+₹25K)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasCatering} onChange={(e) => setHasCatering(e.target.checked)} /> Food Catering (+₹350/hd)
                    </label>
                  </div>
                </div>

                {/* 2. Customer Auth Step */}
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#0F2942', fontWeight: 800 }}>
                    Guest Authentication (Required)
                  </h4>
                  
                  {otpStep === 'verified' ? (
                    <div style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🛡️ Verified Account: <strong>{guestName}</strong> ({guestPhone})
                    </div>
                  ) : otpStep === 'details' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                        />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="tel"
                          placeholder="10-digit mobile"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                          style={{ flexGrow: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                        />
                        <button
                          type="button"
                          onClick={handleSendLocalOtp}
                          style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#0284C7', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Send OTP
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* OTP input */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {localOtp.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`local-otp-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setLocalOtp(prev => {
                                const next = [...prev];
                                next[idx] = val;
                                return next;
                              });
                              if (val && idx < 3) {
                                document.getElementById(`local-otp-${idx + 1}`)?.focus();
                              }
                            }}
                            style={{ width: '36px', height: '36px', borderRadius: '4px', border: '1px solid #CBD5E1', textAlign: 'center', fontSize: '1rem', fontWeight: 800 }}
                          />
                        ))}
                      </div>
                      {isAutofilling && (
                        <span style={{ fontSize: '0.7rem', color: '#0284C7', fontWeight: 600 }}>⚡ Autocompleting code...</span>
                      )}
                      <button
                        type="button"
                        onClick={handleVerifyLocalOtp}
                        style={{ width: '100%', padding: '8px', border: 'none', backgroundColor: '#16A34A', color: '#FFFFFF', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Confirm Code
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Pricing Math Summary */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#0F2942', fontWeight: 800 }}>Billing Ledger Summary</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Base Package:</span>
                      <span>₹{pkgPrice.toLocaleString()}</span>
                    </div>
                    {hasDecor && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Stage Theme Floral Decoration:</span>
                        <span>₹25,000</span>
                      </div>
                    )}
                    {hasCatering && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Catering Buffet (₹350 * {estimatedGuests} guests):</span>
                        <span>₹{cateringPrice.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dotted #E2E8F0', paddingTop: '4px' }}>
                      <span>Subtotal:</span>
                      <span>₹{subtotalPrice.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Event Service Tax GST (18%):</span>
                      <span>₹{taxPrice.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, color: '#0F2942', borderTop: '1px solid #E2E8F0', paddingTop: '6px' }}>
                      <span>Total Amount:</span>
                      <span>₹{totalAmountPrice.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626', fontWeight: 700 }}>
                      <span>Advance Required to Confirm:</span>
                      <span>₹{advanceAmountPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Payment Checkout */}
                {otpStep === 'verified' && (
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                      DEPOSIT PAYMENT METHOD
                    </label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setPayMethod('UPI')}
                        style={{ flex: 1, padding: '8px', border: payMethod === 'UPI' ? '2px solid #0284C7' : '1px solid #CBD5E1', backgroundColor: '#FFFFFF', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        UPI Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod('Cash')}
                        style={{ flex: 1, padding: '8px', border: payMethod === 'Cash' ? '2px solid #0284C7' : '1px solid #CBD5E1', backgroundColor: '#FFFFFF', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Cash Counter
                      </button>
                    </div>

                    {payMethod === 'UPI' && (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '10px' }} className="animate-fade-in">
                        <QrCode size={48} color="#0F2942" />
                        <div style={{ flexGrow: 1 }}>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>MERCHANT UPI ID</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F2942' }}>svmahal@upi</span>
                          <input
                            type="text"
                            required
                            placeholder="Enter Transaction Ref Num"
                            value={refNum}
                            onChange={(e) => setRefNum(e.target.value)}
                            style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.75rem', marginTop: '6px' }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      style={{ width: '100%', padding: '12px', backgroundColor: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', transition: 'var(--transition)' }}
                    >
                      Reserve & Complete Booking
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );

};
