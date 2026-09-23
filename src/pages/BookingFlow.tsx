import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { invoiceService } from '../services/invoiceService';
import { bookingService } from '../services/bookingService';
import { UpiPaymentModal } from '../components/UpiPaymentModal';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import { 
  Building, Bed, CheckCircle, ChevronRight, ChevronLeft, Sparkles, 
  UtensilsCrossed, ShieldAlert, Download, Printer 
} from 'lucide-react';
import type { Booking, Payment } from '../types';
import { CustomerLoginModal } from '../components/CustomerLoginModal';

export const BookingFlow: React.FC = () => {
  const { rooms, bookings, payments, mahalConfig, addBooking, setView, currentUserRole, customerUser } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Wizard Step State
  const [step, setStep] = useState(1);

  // STEP 1: Service selection
  const [serviceType, setServiceType] = useState<'room' | 'mahal'>('room');

  // STEP 2: Dates selection
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState(''); // rooms only
  const [eventDate, setEventDate] = useState(''); // mahal only

  // STEP 3: Room/Mahal Setup details
  const [roomType, setRoomType] = useState<'Standard' | 'Deluxe' | 'Premium' | 'Family'>('Standard');
  const [roomCount, setRoomCount] = useState(1);
  const [guestCount, setGuestCount] = useState(2);
  const [extraBeds, setExtraBeds] = useState(0);
  const [extraBedPrice, setExtraBedPrice] = useState(500);
  
  const [mahalPackage, setMahalPackage] = useState('Standard');
  const [mahalEventType, setMahalEventType] = useState('Wedding');
  const [mahalDecor, setMahalDecor] = useState(true);
  const [mahalCatering, setMahalCatering] = useState(false);

  // STEP 4: Customer Profile details
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custDocType, setCustDocType] = useState('Aadhaar Card');
  const [custDocNum, setCustDocNum] = useState('');
  const [custSpecial, setCustSpecial] = useState('');
  const [identityPic, setIdentityPic] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyGst, setCompanyGst] = useState('');

  // STEP 5: Financial Math (derived state computed in step 5 / 6)
  const [discount, setDiscount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);

  // STEP 6: Payment method
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('UPI');
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [paymentRefNumber, setPaymentRefNumber] = useState('');

  // STEP 7: Completed State variables
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [finalBookingObj, setFinalBookingObj] = useState<Booking | null>(null);

  // Read URL query parameters to autofill and skip steps
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const query = hash.substring(hash.indexOf('?') + 1);
      const params = new URLSearchParams(query);
      
      const service = params.get('service');
      if (service === 'room') {
        setServiceType('room');
        const rType = params.get('type') as any;
        const cin = params.get('in');
        const cout = params.get('out');
        const gst = params.get('guests');
        
        if (rType) setRoomType(rType);
        if (cin) setCheckIn(cin);
        if (cout) setCheckOut(cout);
        if (gst) setGuestCount(Number(gst));
        
        if (cin && cout) setStep(3); // Dates are already selected, jump to setup details
      } else if (service === 'mahal') {
        setServiceType('mahal');
        const edate = params.get('date');
        const etype = params.get('type');
        const eguests = params.get('guests');
        
        if (edate) setEventDate(edate);
        if (etype) setMahalEventType(etype);
        if (eguests) setGuestCount(Number(eguests));
        
        if (edate) setStep(3); // Jump to setup
      }
    }
  }, []);

  // Autofill customer details if logged in (for public users)
  useEffect(() => {
    if (customerUser && currentUserRole === 'public') {
      setCustName(customerUser.name);
      setCustPhone(customerUser.phone);
      setCustEmail(customerUser.email);
    }
  }, [customerUser, currentUserRole]);

  // Compute Invoice Financials dynamically
  const getInvoiceData = () => {
    if (serviceType === 'room') {
      const selectedRoom = rooms.find(r => r.type === roomType) || rooms[0];
      const rate = selectedRoom ? selectedRoom.price : 1500;
      return invoiceService.calculateRoomFinancials(
        checkIn || new Date().toISOString().split('T')[0],
        checkOut || new Date().toISOString().split('T')[0],
        rate,
        roomCount,
        discount,
        advancePaid,
        'GST',
        extraBeds * extraBedPrice
      );
    } else {
      const selectedPkg = mahalConfig.packages?.find(p => p.name === mahalPackage) || { price: 150000 };
      return invoiceService.calculateMahalFinancials(
        selectedPkg.price,
        mahalDecor,
        mahalCatering,
        guestCount,
        discount,
        advancePaid
      );
    }
  };

  const invoice = getInvoiceData();

  // Navigation handlers with validations
  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Validate dates
      if (serviceType === 'room') {
        if (!checkIn || !checkOut) {
          alert('Please select check-in and check-out dates.');
          return;
        }
        if (checkOut <= checkIn) {
          alert('Check-out date must be after check-in date.');
          return;
        }
      } else {
        if (!eventDate) {
          alert('Please select event date.');
          return;
        }
      }
      setStep(3);
    } else if (step === 3) {
      // Validate setup, check booking conflicts before proceeding
      if (serviceType === 'room') {
        const check = bookingService.checkRoomAvailability(
          checkIn,
          checkOut,
          roomType,
          roomCount,
          rooms,
          bookings
        );
        if (!check.available) {
          alert(check.error || 'Rooms are fully booked for the selected dates.');
          return;
        }
      } else {
        const check = bookingService.checkMahalAvailability(eventDate, bookings);
        if (!check.available) {
          alert(check.error || 'Mahal is already booked for this date.');
          return;
        }
      }
      setStep(4);
    } else if (step === 4) {
      // Validate customer inputs
      if (!custName.trim() || !custPhone.trim() || !custEmail.trim() || !custDocNum.trim()) {
        alert('Please fill out all required customer profile fields.');
        return;
      }
      if (!identityPic) {
        alert('Mandatory Requirement: Please upload Aadhaar Card or Identity proof picture.');
        return;
      }
      // Simple phone/email check
      if (custPhone.trim().length < 10) {
        alert('Please enter a valid 10-digit phone number.');
        return;
      }
      if (!custEmail.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      setStep(5);
    } else if (step === 5) {
      // Financials step
      setStep(6);
    }
  };

  const handleBack = () => {
    if (step > 1 && step < 7) {
      setStep(step - 1);
    }
  };

  const handlePaymentSuccess = (refNumber: string) => {
    setPaymentRefNumber(refNumber);
    // Proceed to submit booking directly
    submitBooking(refNumber);
  };

  const handlePaymentSubmit = () => {
    if (paymentMethod === 'UPI') {
      // Trigger live QR Modal
      setIsUpiModalOpen(true);
    } else {
      // Non-UPI simulation, generate local TXN ref
      const ref = `TXN-${Date.now()}`;
      setPaymentRefNumber(ref);
      submitBooking(ref);
    }
  };

  const submitBooking = (refNum: string) => {
    const selectedServiceId = serviceType === 'room' 
      ? (rooms.find(r => r.type === roomType)?.id || 'room-101')
      : 'mahal-sv';

    const bData: any = {
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail,
      customerAddress: custAddress,
      serviceType: serviceType,
      serviceId: selectedServiceId,
      checkInDate: serviceType === 'room' ? checkIn : eventDate,
      checkOutDate: serviceType === 'room' ? checkOut : eventDate,
      guestCount: Number(guestCount),
      roomCount: serviceType === 'room' ? Number(roomCount) : undefined,
      idType: custDocType,
      idNumber: custDocNum,
      identityPic: identityPic,
      companyName: companyName,
      companyGst: companyGst,
      specialRequirements: custSpecial + (extraBeds > 0 && serviceType === 'room' ? `\n[Extra Beds: ${extraBeds}, Manual Price Per Bed: ₹${extraBedPrice}]` : '') + (refNum ? `\n[Payment Ref: ${refNum}]` : ''),
      packageName: serviceType === 'mahal' ? mahalPackage : undefined,
      eventDetails: serviceType === 'mahal' ? {
        eventType: mahalEventType,
        decorator: mahalDecor,
        catering: mahalCatering
      } : undefined,
      financials: {
        ...invoice,
        advancePaid: advancePaid // Updates dynamically
      },
      status: currentUserRole === 'public' ? 'Pending' : (serviceType === 'room' ? 'Confirmed' : 'Pending')
    };

    const res = addBooking(bData);
    if (res.success && res.id) {
      setConfirmedBookingId(res.id);
      
      // Compile final booking object for printing reference
      const finalObj: Booking = {
        ...bData,
        id: res.id,
        paymentStatus: advancePaid >= invoice.total ? 'Paid' : (advancePaid > 0 ? 'Partially Paid' : 'Unpaid'),
        createdBy: currentUserRole === 'public' ? 'Public Guest' : 'Staff Desk',
        createdAt: new Date().toISOString()
      };
      setFinalBookingObj(finalObj);
      setStep(7);
    } else {
      alert(res.error || 'Failed to reserve booking. Check availability.');
    }
  };

  if (currentUserRole === 'public' && !customerUser) {
    return (
      <div className="container animate-fade-in" style={{ padding: '60px 0', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #D2E3F8',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
            padding: '40px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            background: 'linear-gradient(to bottom, #FFFFFF, #F3F8FC)'
          }}
        >
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: '#F0F9FF', color: '#0284C7', marginBottom: '20px', border: '1px solid #BAE6FD' }}>
            <Building size={48} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#0F2942', fontWeight: 800, marginBottom: '12px', fontFamily: 'var(--font-sans)' }}>Authentication Required</h2>
          <p style={{ color: '#4A607A', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '28px' }}>
            To reserve a room or banquet hall package at SV Residency / SV Mahal, please verify your mobile number with a secure mock OTP.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.2)',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0269A1')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284C7')}
          >
            Authenticate with OTP
          </button>

          <CustomerLoginModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="booking-wizard-container">
      
      {/* Wizard Header & Stepper */}
      <div className="booking-header">
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Reservation Portal</h2>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Secure your stay or event with SV Residency & Mahal</p>
      </div>

      <div className="booking-stepper">
        <div className="stepper-line"></div>
        {[
          { num: 1, label: 'Service' },
          { num: 2, label: 'Dates' },
          { num: 3, label: 'Details' },
          { num: 4, label: 'Profile' },
          { num: 5, label: 'Pricing' },
          { num: 6, label: 'Payment' },
          { num: 7, label: 'Confirm' }
        ].map((s) => (
          <div key={s.num} className={`stepper-item ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}>
            <div className="stepper-circle">
              {step > s.num ? <CheckCircle size={16} /> : s.num}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step >= s.num ? '#0F172A' : '#94A3B8' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main Form container */}
      <div className="booking-body">
        <div>
          
          {/* STEP 1: SERVICE TYPE */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '8px' }}>
                Select Service
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '30px' }}>
                Would you like to book a comfortable residency room stay or reserve the banquet hall for a grand function?
              </p>
              
              <div className="modern-grid">
                <div
                  onClick={() => setServiceType('room')}
                  className={`service-card ${serviceType === 'room' ? 'active-room' : ''}`}
                >
                  <Bed size={42} color={serviceType === 'room' ? '#0284C7' : '#94A3B8'} />
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.2rem', margin: '0 0 4px 0', color: '#0F172A' }}>Residency Room</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>Stay options starting from ₹1,500/night</p>
                  </div>
                </div>

                <div
                  onClick={() => setServiceType('mahal')}
                  className={`service-card ${serviceType === 'mahal' ? 'active-mahal' : ''}`}
                >
                  <Building size={42} color={serviceType === 'mahal' ? '#C9A227' : '#94A3B8'} />
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.2rem', margin: '0 0 4px 0', color: '#0F172A' }}>SV Mahal Banquet Hall</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>Large celebration hall with customized setups</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DATES */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '8px' }}>Select Dates</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '30px' }}>Provide stay schedules or the event celebration date.</p>

              {serviceType === 'room' ? (
                <div className="modern-grid">
                  <div className="modern-input-group">
                    <label className="modern-label">CHECK-IN DATE</label>
                    <input type="date" required min={new Date().toISOString().split('T')[0]} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="modern-input" />
                  </div>
                  <div className="modern-input-group">
                    <label className="modern-label">CHECK-OUT DATE</label>
                    <input type="date" required min={checkIn || new Date().toISOString().split('T')[0]} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="modern-input" />
                  </div>
                </div>
              ) : (
                <div className="modern-input-group">
                  <label className="modern-label">EVENT DATE</label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="modern-input" />
                  <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#F0F9FF', borderRadius: '6px', borderLeft: '3px solid #2563EB', fontSize: '0.8rem', color: '#1E40AF' }}>
                    Note: SV Mahal allows only one event booking per calendar date to prevent conflicts.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: SETUP & DETAILS */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '8px' }}>Customize Setup Details</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '30px' }}>Select room capacities, guests count, or Mahal packages and event services.</p>

              {serviceType === 'room' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="modern-grid">
                    <div className="modern-input-group">
                      <label className="modern-label">SUITE TYPE</label>
                      <select value={roomType} onChange={(e) => setRoomType(e.target.value as any)} className="modern-input">
                        <option value="Standard">Standard Room (₹1,500)</option>
                        <option value="Deluxe">Deluxe Room (₹2,500)</option>
                        <option value="Premium">Premium Room (₹3,500)</option>
                        <option value="Family Room">Family Room (₹4,500)</option>
                      </select>
                    </div>
                    <div className="modern-input-group">
                      <label className="modern-label">ROOMS COUNT</label>
                      <input type="number" min="1" max="5" value={roomCount} onChange={(e) => setRoomCount(Math.max(1, Number(e.target.value)))} className="modern-input" />
                    </div>
                  </div>
                  <div className="modern-grid">
                    <div className="modern-input-group">
                      <label className="modern-label">TOTAL GUEST COUNT</label>
                      <input type="number" min="1" value={guestCount} onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))} className="modern-input" />
                    </div>
                    <div className="modern-input-group">
                      <label className="modern-label">EXTRA BEDS</label>
                      <input type="number" min="0" value={extraBeds} onChange={(e) => setExtraBeds(Math.max(0, Number(e.target.value)))} className="modern-input" />
                    </div>
                  </div>
                  {(currentUserRole === 'admin' || currentUserRole === 'manager') && extraBeds > 0 && (
                    <div className="modern-input-group">
                      <label className="modern-label" style={{ color: '#B45309' }}>MANUAL EXTRA BED PRICE (PER BED)</label>
                      <input type="number" min="0" value={extraBedPrice} onChange={(e) => setExtraBedPrice(Math.max(0, Number(e.target.value)))} className="modern-input" style={{ borderColor: '#C9A227', backgroundColor: '#FFFBEB' }} />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="modern-grid">
                    <div className="modern-input-group">
                      <label className="modern-label">EVENT TYPE</label>
                      <select value={mahalEventType} onChange={(e) => setMahalEventType(e.target.value)} className="modern-input">
                        <option value="Wedding">Wedding</option>
                        <option value="Reception">Reception</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Corporate Event">Corporate Event</option>
                        <option value="Conference">Conference</option>
                        <option value="Other Functions">Other Functions</option>
                      </select>
                    </div>
                    <div className="modern-input-group">
                      <label className="modern-label">PACKAGE BASE</label>
                      <select value={mahalPackage} onChange={(e) => setMahalPackage(e.target.value)} className="modern-input">
                        <option value="Basic">Basic Package (₹1,00,000)</option>
                        <option value="Standard">Standard Package (₹1,50,000)</option>
                        <option value="Premium">Premium Package (₹2,20,000)</option>
                      </select>
                    </div>
                  </div>

                  <div className="modern-grid">
                    <div className="modern-input-group">
                      <label className="modern-label">ESTIMATED GUESTS</label>
                      <input type="number" min="1" value={guestCount} onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))} className="modern-input" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155', cursor: 'pointer' }}>
                        <input type="checkbox" checked={mahalDecor} onChange={(e) => setMahalDecor(e.target.checked)} disabled={mahalPackage === 'Premium'} style={{ width: '18px', height: '18px' }} />
                        <Sparkles size={16} color="#C9A227" /> Add Stage Decoration
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155', cursor: 'pointer' }}>
                        <input type="checkbox" checked={mahalCatering} onChange={(e) => setMahalCatering(e.target.checked)} disabled={mahalPackage === 'Premium'} style={{ width: '18px', height: '18px' }} />
                        <UtensilsCrossed size={16} color="#C9A227" /> Add In-house Catering
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CUSTOMER DETAILS */}
          {step === 4 && (
            <div>
              <h3 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '8px' }}>Customer Information</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '30px' }}>Fill out the reservation check-in profile details.</p>

              <div className="modern-grid" style={{ marginBottom: '24px' }}>
                <div className="modern-input-group">
                  <label className="modern-label">FULL NAME *</label>
                  <input type="text" required value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Enter full name" disabled={currentUserRole === 'public'} className="modern-input" style={currentUserRole === 'public' ? { backgroundColor: '#F1F5F9', cursor: 'not-allowed' } : {}} />
                </div>
                <div className="modern-input-group">
                  <label className="modern-label">PHONE NUMBER *</label>
                  <input type="tel" required value={custPhone} onChange={(e) => setCustPhone(e.target.value.replace(/\D/g, '').substring(0, 10))} placeholder="10-digit mobile" disabled={currentUserRole === 'public'} className="modern-input" style={currentUserRole === 'public' ? { backgroundColor: '#F1F5F9', cursor: 'not-allowed' } : {}} />
                </div>
              </div>

              <div className="modern-grid" style={{ marginBottom: '24px' }}>
                <div className="modern-input-group">
                  <label className="modern-label">EMAIL ADDRESS *</label>
                  <input type="email" required value={custEmail} onChange={(e) => setCustEmail(e.target.value)} placeholder="customer@domain.com" disabled={currentUserRole === 'public'} className="modern-input" style={currentUserRole === 'public' ? { backgroundColor: '#F1F5F9', cursor: 'not-allowed' } : {}} />
                </div>
                <div className="modern-grid" style={{ gap: '12px' }}>
                  <div className="modern-input-group">
                    <label className="modern-label">ID TYPE *</label>
                    <select value={custDocType} onChange={(e) => setCustDocType(e.target.value)} className="modern-input">
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="Driver License">Driver License</option>
                      <option value="Passport">Passport</option>
                      <option value="PAN Card">PAN Card</option>
                    </select>
                  </div>
                  <div className="modern-input-group">
                    <label className="modern-label">ID NUMBER *</label>
                    <input type="text" required value={custDocNum} onChange={(e) => setCustDocNum(e.target.value)} placeholder="Doc ID number" className="modern-input" />
                  </div>
                </div>
              </div>

              <div className="modern-input-group" style={{ marginBottom: '24px' }}>
                <label className="modern-label">CONTACT ADDRESS</label>
                <textarea value={custAddress} onChange={(e) => setCustAddress(e.target.value)} rows={2} placeholder="Street name, City, Pincode" className="modern-input" style={{ resize: 'vertical' }} />
              </div>

              <div className="modern-input-group" style={{ marginBottom: '24px' }}>
                <label className="modern-label">SPECIAL REQUESTS / NOTES</label>
                <input type="text" value={custSpecial} onChange={(e) => setCustSpecial(e.target.value)} placeholder="e.g. Vegetarian catering, early check-in, extra beds" className="modern-input" />
              </div>

              <div className="modern-grid" style={{ marginBottom: '24px' }}>
                <div className="modern-input-group">
                  <label className="modern-label">COMPANY NAME</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Optional company name" className="modern-input" />
                </div>
                <div className="modern-input-group">
                  <label className="modern-label">COMPANY GSTIN</label>
                  <input type="text" value={companyGst} onChange={(e) => setCompanyGst(e.target.value)} placeholder="Optional GST number" className="modern-input" />
                </div>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '8px' }}>
                <label className="modern-label" style={{ marginBottom: '12px' }}>UPLOAD IDENTITY CARD PIC (MANDATORY) *</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setIdentityPic(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ width: '100%' }}
                />
                {identityPic && (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img src={identityPic} alt="Identity Pic" style={{ height: '80px', borderRadius: '6px', border: '2px solid #E2E8F0', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>Successfully uploaded</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: PRICING & INVOICE PREVIEW */}
          {step === 5 && (
            <div>
              <h3 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '8px' }}>Invoice Pricing Details</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '30px' }}>Confirm billing aggregates, adjust discounts, and verify total payable amounts.</p>

              <div className="modern-grid">
                
                {/* Math values */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', fontSize: '0.95rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '16px', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
                    Summary Calculations
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#475569' }}>Subtotal Base:</span>
                    <span style={{ fontWeight: 600 }}>₹{invoice.subtotal.toLocaleString()}</span>
                  </div>
                  {extraBeds > 0 && serviceType === 'room' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#475569' }}>Includes Extra Beds ({extraBeds} × ₹{extraBedPrice}):</span>
                      <span style={{ fontWeight: 600 }}>+₹{(extraBeds * extraBedPrice).toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#475569' }}>Taxes (GST):</span>
                    <span style={{ fontWeight: 600 }}>₹{invoice.tax.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: '#475569' }}>Discount:</span>
                      <span style={{ color: '#DC2626', fontWeight: 700 }}>- ₹{invoice.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ height: '2px', backgroundColor: '#E2E8F0', margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                    <span>Grand Total:</span>
                    <span>₹{invoice.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Adjustments (Only visible in CRM, simulated for public) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {currentUserRole !== 'public' ? (
                    <div className="modern-input-group">
                      <label className="modern-label">DISCOUNT ADJUSTMENT (₹)</label>
                      <input type="number" min="0" max={invoice.subtotal} value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))} className="modern-input" />
                    </div>
                  ) : (
                    <div style={{ padding: '16px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FEF3C7', fontSize: '0.85rem', color: '#B45309' }}>
                      <strong>Promo/Discount applied:</strong> Standard online rates have been adjusted. No discount coupons active.
                    </div>
                  )}

                  <div className="modern-input-group">
                    <label className="modern-label">ADVANCE TO PAY (₹)</label>
                    <input type="number" min="0" max={invoice.total} value={advancePaid} onChange={(e) => setAdvancePaid(Math.min(invoice.total, Math.max(0, Number(e.target.value))))} className="modern-input" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0284C7' }} />
                    <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginTop: '6px', fontWeight: 600 }}>
                      Remaining balance due: ₹{(invoice.total - advancePaid).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 6: PAYMENT METHOD */}
          {step === 6 && (
            <div>
              <h3 style={{ fontSize: '1.5rem', color: '#0F172A', marginBottom: '8px' }}>Secure Payment</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '30px' }}>Select a payment method to settle the advance amount of ₹{advancePaid.toLocaleString()}.</p>

              {advancePaid === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <ShieldAlert size={48} color="#F59E0B" style={{ margin: '0 auto 16px auto' }} />
                  <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', marginBottom: '8px' }}>No Advance Selected</h4>
                  <p style={{ fontSize: '0.9rem', color: '#64748B', maxWidth: '300px', margin: '0 auto 24px auto' }}>
                    You have set the advance payment to ₹0. This booking will be logged as Pending Balance.
                  </p>
                  <button
                    onClick={() => {
                      setPaymentRefNumber('N/A');
                      submitBooking('N/A');
                    }}
                    className="btn-primary"
                    style={{ margin: '0 auto', backgroundColor: '#0F172A' }}
                  >
                    Confirm without Advance
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="modern-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {['UPI', 'Cash', 'Card', 'Bank Transfer'].map(m => (
                      <div
                        key={m}
                        onClick={() => setPaymentMethod(m as any)}
                        style={{
                          padding: '16px 10px',
                          border: paymentMethod === m ? '2px solid #C9A227' : '1px solid #CBD5E1',
                          backgroundColor: paymentMethod === m ? '#FFFBEB' : '#F8FAFC',
                          borderRadius: '8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#0F172A',
                          transition: 'var(--transition)'
                        }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '20px', backgroundColor: '#F0F9FF', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                    {paymentMethod === 'UPI' && (
                      <p style={{ fontSize: '0.9rem', color: '#0369A1', margin: 0 }}>
                        📲 Scan UPI QR code using your mobile app (GPay/PhonePe) to pay instantly. Ref number verification logs payment automatically.
                      </p>
                    )}
                    {paymentMethod === 'Cash' && (
                      <p style={{ fontSize: '0.9rem', color: '#0369A1', margin: 0 }}>
                        💵 Settle advance via physical cash. Staff will record transaction and provide physical receipt confirmation.
                      </p>
                    )}
                    {paymentMethod === 'Card' && (
                      <p style={{ fontSize: '0.9rem', color: '#0369A1', margin: 0 }}>
                        💳 Tap or insert credit/debit card on terminal desk. Supports Visa, MasterCard, and RuPay cards.
                      </p>
                    )}
                    {paymentMethod === 'Bank Transfer' && (
                      <p style={{ fontSize: '0.9rem', color: '#0369A1', margin: 0 }}>
                        🏦 Settle invoice via direct IMPS, NEFT, or RTGS bank transfer. Provide bank reference number below.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handlePaymentSubmit}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.05rem', backgroundColor: '#16A34A' }}
                  >
                    Proceed with {paymentMethod} Payment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: CONFIRMED */}
          {step === 7 && finalBookingObj && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  boxShadow: '0 0 20px rgba(22, 163, 74, 0.2)'
                }}
              >
                <CheckCircle size={40} color="#16A34A" />
              </div>
              
              <h3 style={{ fontSize: '1.8rem', color: '#0F172A', marginBottom: '8px' }}>Booking Confirmed!</h3>
              <span style={{ fontSize: '1rem', color: '#C9A227', fontWeight: 800, letterSpacing: '0.05em' }}>ID: {confirmedBookingId}</span>
              
              <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: '480px', margin: '16px auto 30px auto', lineHeight: 1.6 }}>
                Thank you, <strong>{custName}</strong>! Your reservation has been successfully registered. A confirmation copy and invoice have been logged.
              </p>

              {/* Summary Details */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', textAlign: 'left', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Service booked:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{serviceType === 'room' ? `${roomType} Room Suite` : 'SV Mahal Hall'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Schedule:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{serviceType === 'room' ? `${checkIn} to ${checkOut}` : eventDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Total Price (with tax):</span>
                  <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{invoice.total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Advance Paid:</span>
                  <span style={{ fontWeight: 800, color: '#16A34A' }}>₹{advancePaid.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Payment Reference:</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{paymentRefNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => generateInvoicePdf(finalBookingObj!, payments.filter((p: Payment) => p.bookingId === confirmedBookingId))}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#C9A227',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} /> Download Invoice
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Printer size={16} /> Print Invoice
                </button>
              </div>

              <button
                onClick={() => setView(currentUserRole === 'public' ? 'public/home' : 'crm/overview')}
                style={{
                  marginTop: '24px',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Go to {currentUserRole === 'public' ? 'Home Page' : 'CRM Dashboard'}
              </button>
            </div>
          )}

        </div>

        {/* Wizard Footer controls */}
        {step < 7 && (
          <div className="booking-footer">
            {step > 1 ? (
              <button onClick={handleBack} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ChevronLeft size={18} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button onClick={handleNext} className="btn-primary">
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>

      {/* UPI Payment Modal popup link */}
      {isUpiModalOpen && (
        <UpiPaymentModal
          isOpen={isUpiModalOpen}
          onClose={() => setIsUpiModalOpen(false)}
          amount={advancePaid}
          bookingId={confirmedBookingId || 'ROOM-2026-TEMP'}
          customerName={custName}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Hidden print-only wrapper to print standard browser invoice */}
      {step === 7 && finalBookingObj && (
        <div className="print-only" style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '100%', padding: '20px', fontFamily: 'sans-serif' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
            <h2>SV.MAHAL & SV.RESIDENCY</h2>
            <p>Main Road, Thukkapet, Chengam, Tamil Nadu - 606701 | Phone: 95008 21550, 90437 80215</p>
          </div>
          <table style={{ width: '100%', marginBottom: '20px' }}>
            <tbody>
              <tr>
                <td>
                  <strong>Billed To:</strong><br />
                  {custName}<br />
                  {custPhone}<br />
                  {custAddress}
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                  <strong>Invoice:</strong> INV-{confirmedBookingId.substring(confirmedBookingId.indexOf('-') + 1)}<br />
                  <strong>Booking ID:</strong> {confirmedBookingId}<br />
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </td>
              </tr>
            </tbody>
          </table>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '8px' }}>Quantity</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Rate</th>
                <th style={{ textAlign: 'right', padding: '8px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px' }}>
                  {serviceType === 'room' ? `Residency Room Booking (${roomType})` : `SV Mahal Banquet Booking (${mahalPackage} package)`}<br />
                  Dates: {serviceType === 'room' ? `${checkIn} to ${checkOut}` : eventDate}
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  {serviceType === 'room' ? `${roomCount} room(s)` : '1 Event'}
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  ₹{invoice.subtotal.toLocaleString()}
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  ₹{invoice.subtotal.toLocaleString()}
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #000' }}>
                <td colSpan={2}></td>
                <td style={{ padding: '8px', textAlign: 'right' }}><strong>Subtotal:</strong></td>
                <td style={{ padding: '8px', textAlign: 'right' }}>₹{invoice.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td style={{ padding: '8px', textAlign: 'right' }}><strong>Discount:</strong></td>
                <td style={{ padding: '8px', textAlign: 'right' }}>- ₹invoice.discount.toLocaleString()</td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td style={{ padding: '8px', textAlign: 'right' }}><strong>GST:</strong></td>
                <td style={{ padding: '8px', textAlign: 'right' }}>₹{invoice.tax.toLocaleString()}</td>
              </tr>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <td colSpan={2}></td>
                <td style={{ padding: '8px', textAlign: 'right' }}><strong>Total:</strong></td>
                <td style={{ padding: '8px', textAlign: 'right' }}>₹{invoice.total.toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td style={{ padding: '8px', textAlign: 'right' }}><strong>Paid:</strong></td>
                <td style={{ padding: '8px', textAlign: 'right', color: 'green' }}>₹{advancePaid.toLocaleString()}</td>
              </tr>
              <tr style={{ borderTop: '1px solid #000' }}>
                <td colSpan={2}></td>
                <td style={{ padding: '8px', textAlign: 'right' }}><strong>Balance:</strong></td>
                <td style={{ padding: '8px', textAlign: 'right', color: 'red' }}>₹{(invoice.total - advancePaid).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '0.85rem' }}>
            Thank you for choosing SV.MAHAL & SV.RESIDENCY.
          </div>
        </div>
      )}

    </div>
  );
};
