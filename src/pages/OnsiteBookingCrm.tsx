import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Building, Check, Search, Upload, Info, FileText, Camera, ShieldAlert } from 'lucide-react';
import type { Room } from '../types';
import { invoiceService } from '../services/invoiceService';

interface OnsiteBookingCrmProps {
  initialServiceType?: 'room' | 'mahal';
  onClose?: () => void;
}

export const OnsiteBookingCrm: React.FC<OnsiteBookingCrmProps> = ({ initialServiceType, onClose }) => {
  const { rooms, customers, addBooking, addToast, setView } = useApp();

  // Unified Desk Type
  const [serviceType, setServiceType] = useState<'room' | 'mahal'>(initialServiceType || 'room');
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (initialServiceType) {
      setServiceType(initialServiceType);
    }
  }, [initialServiceType]);

  // Step 1: Room Number Selection & Custom Rate
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rateType, setRateType] = useState<'standard' | 'custom'>('standard');
  const [customPrice, setCustomPrice] = useState<string>('');

  // Step 2: Stay Dates & Times
  const [checkInDateTime, setCheckInDateTime] = useState<string>('');
  const [checkOutDateTime, setCheckOutDateTime] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [extraBeds, setExtraBeds] = useState<number>(0);
  const [extraBedPrice, setExtraBedPrice] = useState<number>(500);
  // Step 3: Guest Profiles & Search
  const [phoneQuery, setPhoneQuery] = useState('');
  const [matchedCustomer, setMatchedCustomer] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Step 4: Documents Upload
  const [aadhaarPics, setAadhaarPics] = useState<string[]>([]);
  const [membersPic, setMembersPic] = useState<string>('');

  // Step 5: Company Info
  const [isCompanyBooking, setIsCompanyBooking] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyGst, setCompanyGst] = useState('');
  const [companyContact, setCompanyContact] = useState('');

  // Step 6: Bill Type & Settlement
  const [billingType, setBillingType] = useState<'GST' | 'Normal'>('GST');
  const [discount, setDiscount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('Cash');
  const [refNum, setRefNum] = useState('');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState('');

  const simulatePayment = () => {
    if (payMethod === 'UPI') {
      const mockRazorpayId = `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setRazorpayPaymentId(mockRazorpayId);
      alert(`Razorpay Payment Simulated.\nTransaction ID: ${mockRazorpayId}`);
    }
  };

  // Search customer handler
  useEffect(() => {
    if (phoneQuery.length >= 4) {
      const match = customers.find(c => c.phone.includes(phoneQuery));
      if (match) {
        setMatchedCustomer(match);
      } else {
        setMatchedCustomer(null);
      }
    } else {
      setMatchedCustomer(null);
    }
  }, [phoneQuery, customers]);

  const selectMatchedCustomer = () => {
    if (matchedCustomer) {
      setName(matchedCustomer.name);
      setPhone(matchedCustomer.phone);
      setEmail(matchedCustomer.email || '');
      setAddress(matchedCustomer.address || '');
      addToast('Profile Loaded', `Selected guest profile for ${matchedCustomer.name}.`, 'success');
      setPhoneQuery('');
      setMatchedCustomer(null);
    }
  };

  // Helper: Format DateTime for display
  const formatDateTimeDisplay = (dtStr: string) => {
    if (!dtStr) return 'N/A';
    try {
      const dt = new Date(dtStr);
      return dt.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dtStr;
    }
  };

  // Calculations
  const getCalculatedTotals = () => {
    const roomRate = selectedRoom 
      ? (rateType === 'custom' ? (Number(customPrice) || selectedRoom.price) : selectedRoom.price)
      : 1500;

    if (serviceType === 'room') {
      return invoiceService.calculateRoomFinancials(
        checkInDateTime ? checkInDateTime.split('T')[0] : new Date().toISOString().split('T')[0],
        checkOutDateTime ? checkOutDateTime.split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0],
        roomRate,
        1, // Room Qty
        discount,
        advancePaid,
        billingType,
        extraBeds * extraBedPrice
      );
    } else {
      // Mahal package total defaults to 150000 if basic standard
      const pkgPrice = 150000;
      return invoiceService.calculateMahalFinancials(
        pkgPrice,
        true, // Decorator
        false, // Catering
        guestCount,
        discount,
        advancePaid,
        billingType
      );
    }
  };

  const financials = getCalculatedTotals();

  // Validate step navigation
  const canGoToNextStep = () => {
    if (currentStep === 1) {
      if (serviceType === 'room' && !selectedRoom) return false;
      if (serviceType === 'room' && rateType === 'custom' && (!customPrice || Number(customPrice) <= 0)) return false;
      return true;
    }
    if (currentStep === 2) {
      if (!checkInDateTime || !checkOutDateTime) return false;
      const s = new Date(checkInDateTime).getTime();
      const e = new Date(checkOutDateTime).getTime();
      if (e <= s) return false;
      return true;
    }
    if (currentStep === 3) {
      if (!name.trim() || phone.length < 10) return false;
      if (isCompanyBooking && (!companyName.trim() || !companyGst.trim())) return false;
      return true;
    }
    if (currentStep === 4) {
      // At least one Aadhaar picture must be uploaded
      const hasAadhaar = aadhaarPics.some(p => !!p);
      const hasMembersPic = !!membersPic;
      return hasAadhaar && hasMembersPic;
    }
    return true;
  };

  const handleRegisterOnsiteBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoom && serviceType === 'room') {
      alert('Please select a room number.');
      return;
    }

    if (payMethod === 'UPI' && !razorpayPaymentId) {
      alert('Please complete Razorpay UPI payment before booking.');
      return;
    }

    const roomRate = selectedRoom 
      ? (rateType === 'custom' ? (Number(customPrice) || selectedRoom.price) : selectedRoom.price)
      : 1500;

    const bData = {
      customerName: name.toUpperCase(),
      customerPhone: phone,
      customerEmail: email,
      customerAddress: address.toUpperCase(),
      serviceType: serviceType,
      serviceId: serviceType === 'room' ? selectedRoom!.id : 'mahal-sv',
      roomIds: serviceType === 'room' ? [selectedRoom!.id] : undefined,
      checkInDate: checkInDateTime.split('T')[0],
      checkOutDate: serviceType === 'room' ? checkOutDateTime.split('T')[0] : checkInDateTime.split('T')[0],
      actualCheckInTime: formatDateTimeDisplay(checkInDateTime),
      actualCheckOutTime: serviceType === 'room' ? formatDateTimeDisplay(checkOutDateTime) : undefined,
      guestCount: Number(guestCount),
      roomCount: serviceType === 'room' ? 1 : undefined,
      idType: 'Aadhaar Card',
      idNumber: 'Aadhaar Attached',
      identityPic: aadhaarPics[0] || '',
      identityPics: aadhaarPics.filter(Boolean),
      membersPic: membersPic,
      companyName: isCompanyBooking ? companyName.toUpperCase() : undefined,
      companyGst: isCompanyBooking ? companyGst.toUpperCase() : undefined,
      companyContact: isCompanyBooking ? companyContact.toUpperCase() : undefined,
      specialRequirements: `[ONSITE FRONT DESK] STANDARD/CUSTOM ROOM RATE APPLIED: ₹${roomRate}/NIGHT. PAID VIA ${payMethod.toUpperCase()}. REF NUM: ${refNum.toUpperCase() || 'N/A'}` + (extraBeds > 0 && serviceType === 'room' ? `\n[Extra Beds: ${extraBeds}, Manual Price Per Bed: ₹${extraBedPrice}]` : ''),
      billingType: billingType,
      financials: {
        subtotal: financials.subtotal,
        discount: financials.discount,
        tax: financials.tax,
        total: financials.total,
        advancePaid: financials.advancePaid,
        balanceDue: financials.balanceDue,
        cgst: financials.cgst,
        sgst: financials.sgst,
        roundOff: financials.roundOff,
        baseAmount: financials.baseAmount,
        razorpayPaymentId: payMethod === 'UPI' ? razorpayPaymentId : undefined,
        paymentTimestamp: payMethod === 'UPI' && razorpayPaymentId ? new Date().toISOString() : undefined
      },
      source: 'offline' as const, // Walk-in lodging is checked in immediately
      status: 'Checked-in' as const // Walk-in lodging is checked in immediately
    };

    const res = addBooking(bData);
    if (res.success) {
      addToast('Onsite Booking Created', 'The front-desk walk-in stay registration was completed.', 'success');
      if (onClose) {
        onClose();
      } else {
        setView('crm/bookings');
      }
    } else {
      alert(res.error || 'Stay availability conflict detected. Please verify dates.');
    }
  };

  // Group Residency rooms by floor
  const residencyRooms = rooms.filter(r => r.floor !== 'Mahal');
  const mahalRooms = rooms.filter(r => r.floor === 'Mahal');

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#0F2942', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Front-Desk Walk-In Booking</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Seamless walk-in checkout wizard for room assignment, Aadhaar collection, and payment settlement.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Tab switcher removed as requested, serviceType is determined by prop */}
          <div style={{ display: 'none' }}></div>
          {onClose && (
            <button onClick={onClose} style={{ padding: '8px', border: '1px solid #E2E8F0', borderRadius: '6px', backgroundColor: '#FFFFFF', cursor: 'pointer', color: '#64748B' }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* STEP TRACKER WIDGET */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
        {[
          { num: 1, label: serviceType === 'room' ? 'Choose Room' : 'Confirm Service' },
          { num: 2, label: 'Dates & Guests' },
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

      {/* 2-COLUMN LAYOUT FOR DESKTOP */}
      <div className="responsive-wizard">
        
        {/* Left Form View */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          
          {/* STEP 1: ROOM SELECTION */}
          {currentStep === 1 && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', color: '#0F2942', fontWeight: 800, fontSize: '1.15rem' }}>
                {serviceType === 'room' ? 'Select Room Stay Unit' : 'Confirm Mahal Hall Stay'}
              </h3>

              {serviceType === 'room' ? (
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '20px' }}>
                    Click a room below to select it for assignment. Red units indicate occupied status.
                  </p>

                  <h4 style={{ fontSize: '0.85rem', color: '#0F2942', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                    Residency Rooms (20 Rooms Inventory)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                    {residencyRooms.map(room => {
                      const isSel = selectedRoom?.id === room.id;
                      const isOccupied = room.status === 'Occupied' || room.status === 'Blocked' || room.status === 'Maintenance';
                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => { if (!isOccupied) setSelectedRoom(room); }}
                          style={{
                            padding: '12px 8px',
                            borderRadius: '8px',
                            border: isSel ? '2px solid #0284C7' : '1px solid #CBD5E1',
                            backgroundColor: isSel ? '#F0F9FF' : (isOccupied ? '#FEE2E2' : '#FFFFFF'),
                            color: isSel ? '#0284C7' : (isOccupied ? '#DC2626' : '#1E293B'),
                            cursor: isOccupied ? 'not-allowed' : 'pointer',
                            fontWeight: 800,
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ fontSize: '1rem' }}>{room.number}</div>
                          <div style={{ fontSize: '0.6rem', fontWeight: 500, color: '#64748B' }}>{room.type}</div>
                        </button>
                      );
                    })}
                  </div>

                  <h4 style={{ fontSize: '0.85rem', color: '#0F2942', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                    Mahal Rooms (6 Rooms Inventory)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                    {mahalRooms.map(room => {
                      const isSel = selectedRoom?.id === room.id;
                      const isOccupied = room.status === 'Occupied' || room.status === 'Blocked' || room.status === 'Maintenance';
                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => { if (!isOccupied) setSelectedRoom(room); }}
                          style={{
                            padding: '12px 8px',
                            borderRadius: '8px',
                            border: isSel ? '2px solid #0284C7' : '1px solid #CBD5E1',
                            backgroundColor: isSel ? '#F0F9FF' : (isOccupied ? '#FEE2E2' : '#FFFFFF'),
                            color: isSel ? '#0284C7' : (isOccupied ? '#DC2626' : '#1E293B'),
                            cursor: isOccupied ? 'not-allowed' : 'pointer',
                            fontWeight: 800,
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ fontSize: '1rem' }}>{room.number}</div>
                          <div style={{ fontSize: '0.6rem', fontWeight: 500, color: '#64748B' }}>{room.type}</div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedRoom && (
                    <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '8px', marginTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0F2942' }}>Selected: Room {selectedRoom.number}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>{selectedRoom.type} • {selectedRoom.floor} • Std Rate: ₹{selectedRoom.price}/night</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setRateType('standard')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: rateType === 'standard' ? '#0F2942' : '#E2E8F0',
                              color: rateType === 'standard' ? '#FFFFFF' : '#475569',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Standard Rate
                          </button>
                          <button
                            type="button"
                            onClick={() => setRateType('custom')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: rateType === 'custom' ? '#0F2942' : '#E2E8F0',
                              color: rateType === 'custom' ? '#FFFFFF' : '#475569',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Custom Rate
                          </button>
                        </div>
                      </div>

                      {rateType === 'custom' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                            ENTER CUSTOM RATE (INR PER NIGHT) *
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 1800"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '4px', outline: 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', border: '1px dashed #CBD5E1', borderRadius: '8px' }}>
                  <Building size={36} color="#0F2942" style={{ marginBottom: '12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#0F2942' }}>SV Mahal Wedding & Banquet Hall</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '380px', margin: '0 auto' }}>
                    Banquet hall reservation with standard wedding/reception schedules. Price scales are configured at check-out billing step.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: STAY DATES & TIMES */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, color: '#0F2942', fontWeight: 800, fontSize: '1.15rem' }}>Stay Duration & Occupancy Details</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                Set the check-in and check-out dates and times. A local check-out time is printed directly on the generated invoice.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                    CHECK-IN DATE & TIME *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={checkInDateTime}
                    onChange={(e) => setCheckInDateTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', backgroundColor: '#FFFFFF' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                    CHECK-OUT DATE & TIME *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={checkOutDateTime}
                    onChange={(e) => setCheckOutDateTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', backgroundColor: '#FFFFFF' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                    HEADCOUNT (GUEST COUNT) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={serviceType === 'room' ? 6 : 1000}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }}
                  />
                </div>
                {serviceType === 'room' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                      EXTRA BEDS
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={extraBeds}
                      onChange={(e) => setExtraBeds(Math.max(0, Number(e.target.value)))}
                      style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>
                )}
              </div>
              {serviceType === 'room' && extraBeds > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                    MANUAL EXTRA BED PRICE (PER BED)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={extraBedPrice}
                    onChange={(e) => setExtraBedPrice(Math.max(0, Number(e.target.value)))}
                    style={{ width: '100%', padding: '10px', border: '1px solid #C9A227', borderRadius: '6px', outline: 'none', backgroundColor: '#FFFBEB' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: GUEST PROFILE & COMPANY DETAILS */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Existing Search */}
              <div style={{ backgroundColor: '#F0F9FF', padding: '16px', borderRadius: '8px', border: '1px dashed #0284C7' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#0F2942', fontWeight: 800, marginBottom: '6px' }}>
                  SEARCH EXISTING GUEST BY PHONE NUMBER
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 12px' }}>
                    <Search size={16} color="#94A3B8" style={{ marginRight: '8px' }} />
                    <input
                      type="text"
                      placeholder="Type phone number..."
                      value={phoneQuery}
                      onChange={(e) => setPhoneQuery(e.target.value)}
                      style={{ border: 'none', width: '100%', outline: 'none', fontSize: '0.85rem' }}
                    />
                  </div>
                  {matchedCustomer && (
                    <button
                      type="button"
                      onClick={selectMatchedCustomer}
                      style={{ padding: '8px 16px', backgroundColor: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Fill Info
                    </button>
                  )}
                </div>
                {matchedCustomer && (
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#16A34A', fontWeight: 700, marginTop: '6px' }}>
                    🟢 Customer profile found: {matchedCustomer.name}
                  </span>
                )}
              </div>

              {/* Input Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0F2942', fontWeight: 800 }}>Primary Guest Details</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>FULL NAME *</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value.toUpperCase())} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>PHONE NUMBER *</label>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>EMAIL ADDRESS</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value.toUpperCase())} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>GUEST RESIDENCE ADDRESS</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value.toUpperCase())} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} />
                  </div>
                </div>

                {/* Company Details toggle */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0F2942', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={isCompanyBooking} onChange={(e) => setIsCompanyBooking(e.target.checked)} />
                    This is a Corporate / Company Stay (GST invoice)
                  </label>

                  {isCompanyBooking && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>COMPANY REGISTERED NAME *</label>
                        <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value.toUpperCase())} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#FFFFFF' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>COMPANY GSTIN NUMBER *</label>
                        <input type="text" required value={companyGst} onChange={(e) => setCompanyGst(e.target.value.toUpperCase())} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#FFFFFF' }} />
                      </div>
                      <div style={{ gridColumn: 'span 2', marginTop: '6px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>COMPANY CONTACT DETAILS (PHONE / EMAIL)</label>
                        <input type="text" value={companyContact} onChange={(e) => setCompanyContact(e.target.value.toUpperCase())} placeholder="e.g. FINANCE DESK: 9876543211, ACCOUNTS@COMPANY.COM" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#FFFFFF' }} />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: MANDATORY UPLOADS */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, color: '#0F2942', fontWeight: 800, fontSize: '1.15rem' }}>Upload Required Documents & Pictures</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                Upload Aadhaar cards for each stay occupant. At least one guest Aadhaar is mandatory. A separate group members photo is also required.
              </p>

              {/* Aadhaar Cards */}
              <div style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#0F2942', fontWeight: 800 }}>Aadhaar Card Uploads (At least one required)</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Array.from({ length: Math.min(6, guestCount) }).map((_, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Occupant #{idx + 1} Aadhaar Card</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {aadhaarPics[idx] ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={aadhaarPics[idx]} alt="Aadhaar Preview" style={{ height: '40px', width: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #94A3B8' }} />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...aadhaarPics];
                                copy[idx] = '';
                                setAadhaarPics(copy);
                              }}
                              style={{ border: 'none', backgroundColor: '#EF4444', color: '#FFFFFF', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0284C7', color: '#FFFFFF', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                            <Upload size={12} /> Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onloadend = () => {
                                    const copy = [...aadhaarPics];
                                    copy[idx] = r.result as string;
                                    setAadhaarPics(copy);
                                  };
                                  r.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {!aadhaarPics.some(p => !!p) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#DC2626', fontWeight: 700, marginTop: '8px' }}>
                    <ShieldAlert size={14} /> At least one guest Aadhaar card picture is required to proceed.
                  </span>
                )}
              </div>

              {/* Members/Group Photo */}
              <div style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#0F2942', fontWeight: 800 }}>Group / Member Stay Photo (Required)</h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                  {membersPic ? (
                    <div style={{ position: 'relative' }}>
                      <img src={membersPic} alt="Group Preview" style={{ height: '80px', width: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #94A3B8' }} />
                      <button
                        type="button"
                        onClick={() => setMembersPic('')}
                        style={{ position: 'absolute', top: '4px', right: '4px', border: 'none', backgroundColor: '#EF4444', color: '#FFFFFF', padding: '4px', borderRadius: '50%', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0F2942', color: '#FFFFFF', padding: '8px 16px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                        <Camera size={14} /> Upload Stay Members Picture
                        <input
                          type="file"
                          accept="image/*"
                          capture="user"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onloadend = () => {
                                setMembersPic(r.result as string);
                              };
                              r.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Click to capture or choose a photo of the guests checking in.</span>
                    </div>
                  )}
                </div>
                {!membersPic && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#DC2626', fontWeight: 700, marginTop: '8px' }}>
                    <ShieldAlert size={14} /> Group photo upload is required.
                  </span>
                )}
              </div>

            </div>
          )}

          {/* STEP 5: BILL TYPE & FINANCIALS */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, color: '#0F2942', fontWeight: 800, fontSize: '1.15rem' }}>Settlement & Billing Calculations</h3>
              
              {/* Bill Type Selector */}
              <div style={{ display: 'flex', gap: '16px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ flexGrow: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                    CHOOSE BILL TYPE *
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setBillingType('Normal')}
                      style={{
                        flexGrow: 1,
                        padding: '10px',
                        borderRadius: '6px',
                        border: billingType === 'Normal' ? '2px solid #0F2942' : '1px solid #CBD5E1',
                        backgroundColor: billingType === 'Normal' ? '#F0FDF4' : '#FFFFFF',
                        color: '#0F2942',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Normal Bill (Standard Rate, 0% GST)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingType('GST')}
                      style={{
                        flexGrow: 1,
                        padding: '10px',
                        borderRadius: '6px',
                        border: billingType === 'GST' ? '2px solid #0F2942' : '1px solid #CBD5E1',
                        backgroundColor: billingType === 'GST' ? '#F0F9FF' : '#FFFFFF',
                        color: '#0F2942',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      GST Bill (CGST + SGST Calculation)
                    </button>
                  </div>
                </div>
              </div>

              {/* Financial inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>DISCOUNT APPLIED (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>ADVANCE DEPOSIT PAID (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(Math.max(0, Number(e.target.value)))}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', color: '#0284C7', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>PAYMENT METHOD</label>
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as any)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#FFFFFF' }}>
                    <option value="Cash">Cash Ledger</option>
                    <option value="UPI">UPI Transaction</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>TRANSACTION / REF ID</label>
                  <input
                    type="text"
                    placeholder="Enter reference number"
                    value={refNum}
                    onChange={(e) => setRefNum(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>
              </div>

              {payMethod === 'UPI' && (
                <div style={{ backgroundColor: '#F8FAFC', border: '1px dashed #3B82F6', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#1D4ED8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Razorpay UPI Payment
                  </h4>
                  {razorpayPaymentId ? (
                    <div style={{ color: '#16A34A', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#16A34A', color: 'white', textAlign: 'center', lineHeight: '16px' }}>✓</span>
                      Payment Verified: {razorpayPaymentId}
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

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleRegisterOnsiteBooking}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)'
                  }}
                >
                  Register Onsite Booking & Checked-In
                </button>
              </div>

            </div>
          )}

          {/* NAV BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', marginTop: '24px', paddingTop: '16px' }}>
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => prev - 1)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontWeight: 700,
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                opacity: currentStep === 1 ? 0.5 : 1
              }}
            >
              Back
            </button>

            {currentStep < 5 && (
              <button
                type="button"
                disabled={!canGoToNextStep()}
                onClick={() => setCurrentStep(prev => prev + 1)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#0F2942',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: !canGoToNextStep() ? 'not-allowed' : 'pointer',
                  opacity: !canGoToNextStep() ? 0.5 : 1
                }}
              >
                Next Step
              </button>
            )}
          </div>

        </div>

        {/* Right Live Invoice Summary Panel */}
        <div style={{ position: 'sticky', top: '24px' }}>
          
          <div style={{ backgroundColor: '#0F2942', color: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={18} color="#C9A227" /> Booking Stay Summary
            </h3>

            {/* Selected stay summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Stay Type:</span>
                <span style={{ fontWeight: 700 }}>{serviceType === 'room' ? 'Hotel Room' : 'Banquet Hall'}</span>
              </div>

              {serviceType === 'room' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Room Number:</span>
                  <span style={{ fontWeight: 700, color: '#C9A227' }}>{selectedRoom ? `Room ${selectedRoom.number}` : 'Not Selected'}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Rate applied:</span>
                <span>
                  {rateType === 'custom' ? (
                    <strong style={{ color: '#F43F5E' }}>Custom: ₹{(Number(customPrice) || 0).toLocaleString()}/nt</strong>
                  ) : (
                    <span>Standard: ₹{selectedRoom ? selectedRoom.price.toLocaleString() : '1,500'}/nt</span>
                  )}
                </span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#94A3B8' }}>Check-in:</span>
                  <span>{checkInDateTime ? formatDateTimeDisplay(checkInDateTime) : 'Not set'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Check-out:</span>
                  <span>{checkOutDateTime ? formatDateTimeDisplay(checkOutDateTime) : 'Not set'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Headcount:</span>
                <span style={{ fontWeight: 700 }}>{guestCount} Guest(s)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Primary Guest:</span>
                <span style={{ fontWeight: 700 }}>{name || 'Not Entered'}</span>
              </div>

              {isCompanyBooking && companyName && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: 'rgba(2,132,199,0.15)', padding: '6px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 800 }}>Corporate Details</span>
                  <span style={{ fontWeight: 600 }}>{companyName}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>GSTIN: {companyGst}</span>
                </div>
              )}
            </div>

            {/* Financial Ledger */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Base Subtotal:</span>
                <span>₹{financials.subtotal.toLocaleString()}</span>
              </div>

              {financials.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#EF4444' }}>
                  <span>Discount:</span>
                  <span>- ₹{financials.discount.toLocaleString()}</span>
                </div>
              )}

              {billingType === 'GST' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                    <span>Taxable Base Value:</span>
                    <span>₹{(financials.baseAmount || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                    <span>CGST ({serviceType === 'room' ? '2.5%' : '9%'}):</span>
                    <span>₹{(financials.cgst || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                    <span>SGST ({serviceType === 'room' ? '2.5%' : '9%'}):</span>
                    <span>₹{(financials.sgst || 0).toLocaleString()}</span>
                  </div>
                  {financials.roundOff !== 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                      <span>Round Off Offset:</span>
                      <span>₹{(financials.roundOff || 0).toLocaleString()}</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                  <span>GST Tax (0%):</span>
                  <span>₹0</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px', fontSize: '1rem', fontWeight: 800 }}>
                <span style={{ color: '#C9A227' }}>Total Chargeable:</span>
                <span style={{ color: '#C9A227' }}>₹{financials.total.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34D399', fontSize: '0.85rem' }}>
                <span>Advance Paid:</span>
                <span>₹{financials.advancePaid.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '6px', fontSize: '0.9rem', fontWeight: 800, color: financials.balanceDue > 0 ? '#F87171' : '#34D399' }}>
                <span>Balance Due:</span>
                <span>₹{financials.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            {/* Tip section */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', backgroundColor: 'rgba(2,132,199,0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(2,132,199,0.2)', fontSize: '0.75rem', color: '#93C5FD' }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Stay invoices will be logged in reports. You can download or print the PDF invoice immediately after saving.
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
