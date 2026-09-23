import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { invoiceService } from '../services/invoiceService';

interface MahalOnsiteBookingCrmProps {
  onClose?: () => void;
}

export const MahalOnsiteBookingCrm: React.FC<MahalOnsiteBookingCrmProps> = ({ onClose }) => {
  const { bookings, addBooking, mahalConfig } = useApp();
  
  // Step Management
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Step 2: Event Details
  const [eventType, setEventType] = useState('Wedding');
  const [guestCount, setGuestCount] = useState(mahalConfig.capacity || 1000);
  const [packageId, setPackageId] = useState(mahalConfig.packages?.[0]?.name || 'Standard');
  
  // Step 3: Profiles
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [idType, setIdType] = useState('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyGst, setCompanyGst] = useState('');
  
  // Step 4: Uploads
  const [ebInitialPic, setEbInitialPic] = useState('');
  const [ebInitialUnits, setEbInitialUnits] = useState('');
  
  // Step 5: Billing
  const [billingType, setBillingType] = useState<'GST' | 'Normal'>('GST');
  const [discount, setDiscount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('Cash');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState('');

  // Calendar logic
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const getTamilDateStr = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const m = parts[1];
    const d = parseInt(parts[2], 10);
    if (m === '01') return d < 14 ? `மார்கழி ${d + 17}` : `தை ${d - 13}`;
    if (m === '02') return d < 13 ? `தை ${d + 18}` : `மாசி ${d - 12}`;
    if (m === '03') return d < 14 ? `மாசி ${d + 16}` : `பங்குனி ${d - 13}`;
    if (m === '04') return d < 14 ? `பங்குனி ${d + 18}` : `சித்திரை ${d - 13}`;
    if (m === '05') return d < 15 ? `சித்திரை ${d + 17}` : `வைகாசி ${d - 14}`;
    if (m === '06') return d < 15 ? `வைகாசி ${d + 16}` : `ஆனி ${d - 14}`;
    if (m === '07') return d < 16 ? `ஆனி ${d + 16}` : `ஆடி ${d - 15}`;
    if (m === '08') return d < 17 ? `ஆடி ${d + 16}` : `ஆவணி ${d - 16}`;
    if (m === '09') return d < 17 ? `ஆவணி ${d + 15}` : `புரட்டாசி ${d - 16}`;
    if (m === '10') return d < 18 ? `புரட்டாசி ${d + 14}` : `ஐப்பசி ${d - 17}`;
    if (m === '11') return d < 17 ? `ஐப்பசி ${d + 14}` : `கார்த்திகை ${d - 16}`;
    if (m === '12') return d < 16 ? `கார்த்திகை ${d + 14}` : `மார்கழி ${d - 15}`;
    return '';
  };

  const mahalBookings = bookings.filter(b => b.serviceType === 'mahal' && b.status !== 'Cancelled');
  const getBookedEvent = (dateStr: string) => {
    return mahalBookings.find(b => b.checkInDate === dateStr);
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: '10px' }} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const existingBooking = getBookedEvent(dateStr);
      const isPast = new Date(dateStr) < new Date(today.setHours(0, 0, 0, 0));
      
      const isSelectable = !existingBooking && !isPast;
      const isSelected = selectedDate === dateStr;

      let cellBg = '#FFFFFF';
      let cellBorder = '1px solid #E2E8F0';
      let cellColor = '#0F2942';
      let badgeText = '';
      let badgeBg = '';
      let badgeColor = '';

      if (existingBooking) {
        cellBg = '#FEF2F2';
        cellBorder = '1px solid #FEE2E2';
        cellColor = '#991B1B';
        badgeText = 'Booked';
        badgeBg = '#FEE2E2';
        badgeColor = '#991B1B';
      } else if (isPast) {
        cellBg = '#F8FAFC';
        cellColor = '#94A3B8';
      } else {
        cellBg = '#E8F5E9';
        cellBorder = '1px solid #A5D6A7';
        cellColor = '#2E7D32';
        badgeText = '🟢 Available';
        badgeBg = '#E8F5E9';
        badgeColor = '#2E7D32';
      }

      if (isSelected) {
        cellBg = '#0284C7';
        cellBorder = '1px solid #0284C7';
        cellColor = '#FFFFFF';
      }

      days.push(
        <div
          key={dateStr}
          onClick={() => {
            if (isSelectable) setSelectedDate(dateStr);
          }}
          style={{
            minHeight: '80px',
            borderRadius: '6px',
            backgroundColor: cellBg,
            border: cellBorder,
            color: cellColor,
            padding: '8px',
            cursor: isSelectable ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>{d}</span>
            <span style={{ fontSize: '0.66rem', color: isSelected ? 'rgba(255,255,255,0.7)' : '#64748B', fontWeight: 600 }}>
              {getTamilDateStr(dateStr)}
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
    }
    return days;
  };

  const selectedPackage = mahalConfig.packages?.find(p => p.name === packageId) || mahalConfig.packages?.[0];
  const pkgPrice = selectedPackage?.price || 150000;
  
  const financials = invoiceService.calculateMahalFinancials(
    pkgPrice,
    true, // Decorator default
    false, // Catering default
    guestCount,
    discount,
    advancePaid,
    billingType
  );

  const simulatePayment = () => {
    if (payMethod === 'UPI') {
      const mockRazorpayId = `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setRazorpayPaymentId(mockRazorpayId);
      alert(`Razorpay Payment Simulated.\nTransaction ID: ${mockRazorpayId}`);
    }
  };

  const handleCompleteBooking = () => {
    if (!selectedDate || !customerName || !customerPhone) {
      alert("Please complete required details.");
      return;
    }
    if (payMethod === 'UPI' && !razorpayPaymentId) {
      alert("Please complete Razorpay UPI payment before booking.");
      return;
    }
    if (!ebInitialUnits || !ebInitialPic) {
      alert("Initial EB Meter Reading and Picture are mandatory.");
      return;
    }

    const newBooking = {
      id: `MHL-${Date.now().toString().slice(-6)}`,
      customerName,
      customerPhone,
      customerEmail: '',
      customerAddress,
      serviceType: 'mahal' as const,
      serviceId: 'SV-MAHAL',
      checkInDate: selectedDate,
      checkOutDate: selectedDate, 
      guestCount,
      status: 'Confirmed' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      financials: {
        ...financials,
        razorpayPaymentId,
        paymentTimestamp: razorpayPaymentId ? new Date().toISOString() : undefined
      },
      source: 'offline' as const,
      billingType,
      companyName,
      companyGst,
      eventDetails: {
        eventType,
        decorator: true,
        catering: false
      },
      ebInitialPic,
      ebInitialUnits: Number(ebInitialUnits),
      idType,
      idNumber,
      specialRequirements: `Mahal Onsite Booking. Guests: ${guestCount}. Package: ${packageId}`
    };

    addBooking(newBooking as any);
    if (onClose) {
      onClose();
    } else {
      alert('Mahal Event successfully booked!');
      window.location.reload();
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px', fontFamily: 'var(--font-sans)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A', margin: 0, fontWeight: 800 }}>Mahal Event Booking</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Book the Banquet Hall for events. Custom 5-step flow designed for SV Mahal events.
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ padding: '8px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: '#FFFFFF', cursor: 'pointer', color: '#64748B' }}>
            Cancel
          </button>
        )}
      </div>

      {/* STEP TRACKER WIDGET */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
        {[
          { num: 1, label: 'Choose Date' },
          { num: 2, label: 'Event Details' },
          { num: 3, label: 'Profiles & Contact' },
          { num: 4, label: 'Required Uploads' },
          { num: 5, label: 'Billing & Settle' }
        ].map(step => (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: currentStep === step.num ? 1 : 0.6 }}>
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: currentStep === step.num ? '#0284C7' : (currentStep > step.num ? '#16A34A' : '#94A3B8'),
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}>
              {currentStep > step.num ? <Check size={14} /> : step.num}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: currentStep === step.num ? 800 : 500, color: currentStep === step.num ? '#0F2942' : '#64748B' }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* WIZARD CONTAINER */}
      <div className="responsive-wizard">
        
        {/* Left Form Details */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          
          {/* STEP 1: CALENDAR */}
          {currentStep === 1 && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', color: '#0F2942', fontWeight: 800, fontSize: '1.15rem' }}>Select Event Date</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button 
                  onClick={() => {
                    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                    else { setCurrentMonth(m => m - 1); }
                  }}
                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: 'pointer' }}
                >
                  Previous
                </button>
                <h3 style={{ margin: 0, fontWeight: 800 }}>
                  {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button 
                  onClick={() => {
                    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                    else { setCurrentMonth(m => m + 1); }
                  }}
                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: 'pointer' }}
                >
                  Next
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.8rem', color: '#475569' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {renderCalendar()}
              </div>
            </div>
          )}

          {/* STEP 2: EVENT DETAILS */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, color: '#0F2942', fontWeight: 800, fontSize: '1.15rem' }}>Event & Package Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Event Type</label>
                  <select value={eventType} onChange={e => setEventType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}>
                    <option value="Wedding">Wedding</option>
                    <option value="Reception">Reception</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Package Selection</label>
                  <select value={packageId} onChange={e => setPackageId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}>
                    {mahalConfig.packages?.map(p => (
                      <option key={p.name} value={p.name}>{p.name} - ₹{p.price.toLocaleString()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Expected Guests</label>
                  <input type="number" value={guestCount} onChange={e => setGuestCount(Number(e.target.value))} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROFILES */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, color: '#0F2942', fontWeight: 800, fontSize: '1.15rem' }}>Customer Profile</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Full Name *</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value.toUpperCase())} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Phone Number *</label>
                  <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Address</label>
                  <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value.toUpperCase())} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
              </div>

              <h4 style={{ margin: '16px 0 0 0', color: '#0F2942', fontWeight: 800, fontSize: '1rem' }}>Corporate Billing Details (Optional)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Company Name</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value.toUpperCase())} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Company GSTIN</label>
                  <input type="text" value={companyGst} onChange={e => setCompanyGst(e.target.value.toUpperCase())} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: UPLOADS */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, color: '#0F2942', fontWeight: 800, fontSize: '1.15rem' }}>Mandatory Uploads</h3>
              
              <div style={{ backgroundColor: '#FEE2E2', padding: '20px', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#991B1B', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} /> Initial EB Meter Capture (Mandatory)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Current EB Units *</label>
                    <input type="number" value={ebInitialUnits} onChange={e => setEbInitialUnits(e.target.value)} placeholder="e.g. 14500" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Meter Picture Upload *</label>
                    <input type="file" accept="image/*" capture="environment" onChange={(e) => {
                      if (e.target.files?.[0]) setEbInitialPic(URL.createObjectURL(e.target.files[0]));
                    }} style={{ width: '100%', fontSize: '0.8rem' }} />
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0F2942', fontWeight: 800 }}>ID Proof Upload</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>ID Type</label>
                    <select value={idType} onChange={e => setIdType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}>
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="PAN">PAN</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>ID Number *</label>
                    <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value.toUpperCase())} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>ID Picture Upload</label>
                    <input type="file" accept="image/*" capture="environment" style={{ width: '100%', fontSize: '0.8rem' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: BILLING & SETTLE */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ margin: 0, color: '#0F2942', fontWeight: 800, fontSize: '1.15rem' }}>Billing & Payment</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>BILLING TYPE</label>
                  <select value={billingType} onChange={(e) => setBillingType(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}>
                    <option value="GST">GST Invoice</option>
                    <option value="Normal">Standard Receipt</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>DISCOUNT / COMPLIMENTARY (INR)</label>
                  <input type="number" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>ADVANCE PAID NOW (INR)</label>
                  <input type="number" min="0" value={advancePaid} onChange={(e) => setAdvancePaid(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#F0F9FF', borderBottom: '2px solid #0284C7' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>PAYMENT METHOD</label>
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI (Razorpay)</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {payMethod === 'UPI' && (
                <div style={{ backgroundColor: '#F8FAFC', border: '1px dashed #3B82F6', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#1D4ED8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Razorpay UPI Payment
                  </h4>
                  {razorpayPaymentId ? (
                    <div style={{ color: '#16A34A', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> Payment Verified: {razorpayPaymentId}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button type="button" onClick={simulatePayment} style={{ backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '4px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                        Simulate Payment & Verify
                      </button>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Awaiting verification...</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: currentStep === 1 ? '#94A3B8' : '#334155', fontWeight: 700, cursor: currentStep === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous Step
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={() => {
                  if (currentStep === 1 && !selectedDate) {
                    alert('Please select a date.');
                    return;
                  }
                  setCurrentStep(prev => prev + 1);
                }}
                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#0F2942', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Proceed Next
              </button>
            ) : (
              <button
                onClick={handleCompleteBooking}
                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#16A34A', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle size={16} /> Complete Booking
              </button>
            )}
          </div>
        </div>

        {/* Right Summary Pane */}
        <div style={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #1E293B' }}>
            <FileText size={20} color="#38BDF8" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Event Summary</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Stay Type:</span>
              <span style={{ fontWeight: 700, textAlign: 'right' }}>SV Mahal Banquet</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Event Date:</span>
              <span style={{ fontWeight: 700, textAlign: 'right' }}>{selectedDate || 'Not set'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Package:</span>
              <span style={{ fontWeight: 700, textAlign: 'right' }}>{packageId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Headcount:</span>
              <span style={{ fontWeight: 700, textAlign: 'right' }}>{guestCount} Guest(s)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Primary Guest:</span>
              <span style={{ fontWeight: 700, textAlign: 'right' }}>{customerName || 'Not Entered'}</span>
            </div>
          </div>

          <div style={{ margin: '24px 0', borderTop: '1px dashed #334155' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Base Subtotal:</span>
              <span style={{ fontWeight: 600 }}>₹{financials.subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>
                <span>Discount Applied:</span>
                <span style={{ fontWeight: 600 }}>- ₹{discount.toLocaleString()}</span>
              </div>
            )}
            
            {billingType === 'GST' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Taxable Base Value:</span>
                  <span style={{ fontWeight: 600 }}>₹{financials.baseAmount?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>CGST (9%):</span>
                  <span style={{ fontWeight: 600 }}>₹{financials.cgst?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>SGST (9%):</span>
                  <span style={{ fontWeight: 600 }}>₹{financials.sgst?.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Standard Invoice:</span>
                <span style={{ fontWeight: 600, color: '#FCD34D' }}>No GST (0%)</span>
              </div>
            )}
          </div>

          <div style={{ margin: '20px 0', borderTop: '1px solid #1E293B', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#E2E8F0', fontWeight: 800, fontSize: '0.95rem' }}>Total Chargeable:</span>
              <span style={{ color: '#FCD34D', fontWeight: 900, fontSize: '1.25rem' }}>₹{financials.total.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.85rem' }}>Advance Paid:</span>
              <span style={{ color: '#10B981', fontWeight: 800, fontSize: '0.9rem' }}>₹{advancePaid.toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed #334155' }}>
              <span style={{ color: '#E2E8F0', fontWeight: 800, fontSize: '0.95rem' }}>Balance Due:</span>
              <span style={{ color: '#EF4444', fontWeight: 900, fontSize: '1.15rem' }}>₹{financials.balanceDue.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#1E293B', padding: '12px', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <AlertCircle size={16} color="#94A3B8" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.4 }}>
              Stay invoices will be logged in reports. You can download or print the PDF invoice immediately after saving.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
