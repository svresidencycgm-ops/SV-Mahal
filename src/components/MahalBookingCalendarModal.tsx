import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Users, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MahalBookingCalendarModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { bookings, addBooking, currentUserRole, mahalConfig } = useApp();
  
  // State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Calendar, 2: Details Form
  
  // Form State
  const [eventType, setEventType] = useState('Wedding');
  const [guestCount, setGuestCount] = useState(mahalConfig.capacity || 1000);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [idType, setIdType] = useState('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [packageId, setPackageId] = useState(mahalConfig.packages?.[0]?.name || 'Standard');
  const [advancePaid, setAdvancePaid] = useState(0);

  // EB Upload state at start
  const [ebInitialPic, setEbInitialPic] = useState('');
  const [ebInitialUnits, setEbInitialUnits] = useState('');

  if (!isOpen) return null;

  // Calendar logic
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Find existing mahal bookings
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

      days.push(
        <div
          key={dateStr}
          onClick={() => {
            if (isSelectable) setSelectedDate(dateStr);
          }}
          style={{
            padding: '10px',
            minHeight: '80px',
            border: '1px solid #E2E8F0',
            backgroundColor: existingBooking ? '#FEE2E2' : isSelected ? '#E0F2FE' : isPast ? '#F8FAFC' : '#FFFFFF',
            cursor: isSelectable ? 'pointer' : 'not-allowed',
            position: 'relative',
            borderRadius: '4px'
          }}
        >
          <span style={{ fontWeight: 800, color: isPast ? '#94A3B8' : '#0F2942' }}>{d}</span>
          {existingBooking && (
            <div style={{ fontSize: '0.65rem', backgroundColor: '#DC2626', color: '#FFF', padding: '2px 4px', borderRadius: '4px', marginTop: '4px', textAlign: 'center' }}>
              Booked ({existingBooking.eventDetails?.eventType || 'Event'})
            </div>
          )}
          {isSelected && (
            <div style={{ position: 'absolute', top: '4px', right: '4px', color: '#0284C7' }}>
              <CheckCircle size={14} />
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  const handleNext = () => {
    if (!selectedDate) {
      alert('Please select an available date from the calendar.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ebInitialPic) {
      alert("Initial EB Meter Picture is mandatory to start a Mahal Booking.");
      return;
    }
    
    // Calculate totals
    const selectedPackage = mahalConfig.packages?.find(p => p.name === packageId);
    const basePrice = selectedPackage ? selectedPackage.price : mahalConfig.price;
    const cgst = basePrice * 0.09;
    const sgst = basePrice * 0.09;
    const subtotal = basePrice;
    const total = subtotal + cgst + sgst;
    const balance = total - advancePaid;

    const newBooking = {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      serviceType: 'mahal' as const,
      serviceId: 'mahal-1',
      checkInDate: selectedDate,
      checkOutDate: selectedDate,
      guestCount,
      idType,
      idNumber,
      specialRequirements: '',
      packageName: packageId,
      eventDetails: {
        eventType,
        stageRequired: true,
        catering: false,
        decorator: false,
      },
      status: 'Confirmed' as const,
      bookingSource: 'Offline' as const,
      billingType: 'GST' as const,
      ebMeterCheckInPic: ebInitialPic,
      ebInitialUnits: Number(ebInitialUnits) || 0,
      financials: {
        baseAmount: basePrice,
        subtotal: subtotal,
        discount: 0,
        cgst: cgst,
        sgst: sgst,
        roundOff: 0,
        total: total,
        advancePaid: advancePaid,
        balanceDue: balance,
      }
    };

    const res = addBooking(newBooking);
    if (res.success) {
      alert(`Mahal Booking Confirmed! ID: ${res.id}`);
      onClose();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', width: '100%', maxWidth: step === 1 ? '900px' : '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0F2942', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={20} color="#C9A227" />
              {step === 1 ? 'Mahal Booking Calendar' : 'Mahal Event Details'}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
              {step === 1 ? 'Select an available date for the event.' : `Complete booking details for ${selectedDate}`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} color="#64748B" />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#F1F5F9' }}>
          {step === 1 && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
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

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleNext}
                  disabled={!selectedDate}
                  style={{ padding: '12px 24px', backgroundColor: selectedDate ? '#0F2942' : '#94A3B8', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: selectedDate ? 'pointer' : 'not-allowed' }}
                >
                  Proceed to Details
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <h4 style={{ gridColumn: '1 / -1', margin: 0, color: '#0F2942', fontWeight: 800, borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>Event & Package Info</h4>
                
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

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <h4 style={{ gridColumn: '1 / -1', margin: 0, color: '#0F2942', fontWeight: 800, borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>Customer Information</h4>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Full Name</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value.toUpperCase())} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Phone Number</label>
                  <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Address</label>
                  <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value.toUpperCase())} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>ID Type</label>
                  <select value={idType} onChange={e => setIdType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}>
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="PAN">PAN</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>ID Number</label>
                  <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value.toUpperCase())} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
              </div>

              <div style={{ backgroundColor: '#FEE2E2', padding: '20px', borderRadius: '8px', border: '1px solid #FCA5A5', display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <h4 style={{ margin: 0, color: '#991B1B', fontWeight: 800, borderBottom: '1px solid #FCA5A5', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} /> Initial EB Meter Capture (Mandatory)
                </h4>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#DC2626', color: '#FFFFFF', padding: '10px 16px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', justifyContent: 'center' }}>
                      <Camera size={16} /> Upload EB Initial Photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onloadend = () => setEbInitialPic(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {ebInitialPic && (
                      <img src={ebInitialPic} alt="EB Meter" style={{ marginTop: '10px', width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #FCA5A5' }} />
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#991B1B', marginBottom: '6px' }}>Initial EB Units Reading</label>
                    <input 
                      type="number" 
                      value={ebInitialUnits} 
                      onChange={e => setEbInitialUnits(e.target.value)} 
                      required 
                      placeholder="e.g. 15400"
                      style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #FCA5A5', outline: 'none' }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Advance Paid (₹)</label>
                  <input type="number" value={advancePaid} onChange={e => setAdvancePaid(Number(e.target.value))} style={{ width: '200px', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setStep(1)} style={{ padding: '12px 24px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                    Back
                  </button>
                  <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#0F2942', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                    Confirm Booking
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
