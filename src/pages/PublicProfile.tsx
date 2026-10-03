import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, User, Phone, Mail, ShieldCheck, AlertCircle, Check, 
  Download, Printer, Camera, UploadCloud, Award,
  Bed, Building, Sparkles, QrCode 
} from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';
import { printInvoice } from '../utils/invoicePrinter';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import { UpiPaymentModal } from '../components/UpiPaymentModal';
import type { Booking } from '../types';

export const PublicProfile: React.FC = () => {
  const { bookings, customerUser, setView, addToast, payments, updateBooking, addPayment } = useApp();

  const [activeTab, setActiveTab] = useState<'bookings' | 'documents' | 'loyalty'>('bookings');
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  
  // Custom customer avatar and ID document states backed by localStorage / Cloudinary
  const [profileAvatar, setProfileAvatar] = useState<string>(() => {
    return localStorage.getItem(`sv_cust_avatar_${customerUser?.phone}`) || '';
  });
  const [customerDocUrl, setCustomerDocUrl] = useState<string>(() => {
    return localStorage.getItem(`sv_cust_doc_${customerUser?.phone}`) || '';
  });

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  if (!customerUser) {
    return (
      <div className="container animate-fade-in" style={{ padding: '60px 0', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', backgroundColor: '#FFFFFF', padding: '44px 32px', borderRadius: '20px', border: '1px solid #E2E8F0', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <AlertCircle size={32} color="#DC2626" />
          </div>
          <h3 style={{ fontSize: '1.35rem', color: '#0F2942', fontWeight: 800 }}>Profile Sign-In Required</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '8px 0 24px 0', lineHeight: 1.5 }}>
            Please log in with your verified mobile number to view and manage your bookings, invoices, and saved identity documents.
          </p>
          <button
            onClick={() => setView('public/home')}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#6320EE', 
              color: '#FFFFFF', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 800, 
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: '0 8px 16px rgba(99, 32, 238, 0.25)'
            }}
          >
            Go to Home & Sign In
          </button>
        </div>
      </div>
    );
  }

  // Filter bookings belonging to this customer phone
  const cleanPhone = customerUser.phone.replace(/\D/g, '');
  const guestBookings = bookings.filter(
    b => b.customerPhone && b.customerPhone.replace(/\D/g, '') === cleanPhone
  );

  const totalSpent = guestBookings.reduce((sum, b) => sum + (b.financials?.total || 0), 0);
  const totalStays = guestBookings.filter(b => b.status === 'Completed' || b.status === 'Checked-in').length;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setProfileAvatar(base64);
      localStorage.setItem(`sv_cust_avatar_${customerUser.phone}`, base64);
      try {
        const res = await uploadToCloudinary(base64, 'sv_residency_customer_profiles');
        if (res.isCloudinary && res.url) {
          setProfileAvatar(res.url);
          localStorage.setItem(`sv_cust_avatar_${customerUser.phone}`, res.url);
          addToast('Photo Uploaded', 'Profile image updated successfully.', 'success');
        }
      } catch (err) {
        console.warn('Avatar Cloudinary upload deferred:', err);
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setCustomerDocUrl(base64);
      localStorage.setItem(`sv_cust_doc_${customerUser.phone}`, base64);
      try {
        const res = await uploadToCloudinary(base64, 'sv_residency_customer_documents');
        if (res.isCloudinary && res.url) {
          setCustomerDocUrl(res.url);
          localStorage.setItem(`sv_cust_doc_${customerUser.phone}`, res.url);
          addToast('Document Stored', 'Customer ID proof verified and saved securely.', 'success');
        }
      } catch (err) {
        console.warn('Doc Cloudinary upload deferred:', err);
      } finally {
        setIsUploadingDoc(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getStepProgress = (status: string) => {
    if (['Inquiry', 'Pending'].includes(status)) return 1;
    if (['Confirmed'].includes(status)) return 2;
    if (['Checked-in'].includes(status)) return 3;
    if (['Completed', 'Checked-out'].includes(status)) return 4;
    return 0; // Cancelled
  };

  const stepsList = [
    { idx: 1, label: 'Confirmed' },
    { idx: 2, label: 'Arrival Desk' },
    { idx: 3, label: 'Checked-In' },
    { idx: 4, label: 'Completed' }
  ];

  const handleUpiSuccess = (referenceNumber: string) => {
    if (!payingBooking || !payingBooking.paymentRequest) return;
    
    const reqAmount = payingBooking.paymentRequest.amount;
    const currentAdvance = payingBooking.financials?.advancePaid || 0;
    const totalAmount = payingBooking.financials?.total || 0;
    const newAdvance = currentAdvance + reqAmount;
    const newBalance = Math.max(0, totalAmount - newAdvance);
    const newPaymentStatus = newBalance <= 0 ? 'Paid' : 'Partially Paid';

    // 1. Record payment transaction
    addPayment({
      bookingId: payingBooking.id,
      customerName: payingBooking.customerName,
      amount: reqAmount,
      method: 'UPI',
      date: new Date().toISOString().split('T')[0],
      referenceNumber: referenceNumber,
      recordedBy: 'Customer (Online Portal)',
      notes: `Online UPI Settlement (Ref: ${referenceNumber}) - Note: ${payingBooking.paymentRequest.note || 'Settled via Guest Portal'}`
    });

    // 2. Update booking state
    const updatedBooking: Booking = {
      ...payingBooking,
      status: payingBooking.status === 'Inquiry' ? 'Confirmed' : payingBooking.status,
      financials: {
        ...payingBooking.financials,
        advancePaid: newAdvance,
        balanceDue: newBalance
      },
      paymentStatus: newPaymentStatus as any,
      paymentRequest: {
        ...payingBooking.paymentRequest,
        status: 'Completed'
      }
    };

    const res = updateBooking(updatedBooking);
    if (res.success) {
      addToast('Payment Received via UPI', `Payment of ₹${reqAmount.toLocaleString()} logged with Ref #${referenceNumber}. Your booking status is updated!`, 'success');
    }

    setPayingBooking(null);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 0 80px 0', minHeight: '85vh', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* 1. INTERACTIVE HERO PROFILE CARD */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F2942 0%, #1E3A5F 50%, #6320EE 100%)',
          borderRadius: '24px',
          padding: '32px 36px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '32px',
          boxShadow: '0 20px 40px rgba(15, 41, 66, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 2 }}>
          {/* Avatar with Cloudinary update trigger */}
          <div style={{ position: 'relative', width: '74px', height: '74px', flexShrink: 0 }}>
            {profileAvatar ? (
              <img
                src={profileAvatar}
                alt={customerUser.name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #C9A227' }}
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
                  border: '3px solid #C9A227'
                }}
              >
                <User size={36} />
              </div>
            )}
            
            <button
              onClick={() => avatarInputRef.current?.click()}
              title="Upload Profile Picture"
              disabled={isUploadingAvatar}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#6320EE',
                color: '#FFFFFF',
                border: '2px solid #FFFFFF',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
            >
              <Camera size={13} />
            </button>

            <input
              type="file"
              ref={avatarInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>{customerUser.name}</h2>
              <span style={{ backgroundColor: 'rgba(201, 162, 39, 0.25)', border: '1px solid #C9A227', color: '#FDE047', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={12} /> SV Member
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '18px', fontSize: '0.85rem', color: '#E2E8F0', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={14} color="#38BDF8" /> {customerUser.phone}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={14} color="#38BDF8" /> {customerUser.email}</span>
            </div>
          </div>
        </div>

        {/* Quick operational stats */}
        <div style={{ display: 'flex', gap: '20px', zIndex: 2, flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(6px)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.15)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#93C5FD', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Total Stays</span>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800 }}>{totalStays}</strong>
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(6px)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.15)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#93C5FD', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Spent Value</span>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800 }}>₹{totalSpent.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #E2E8F0', marginBottom: '28px', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'bookings' ? '3px solid #6320EE' : '3px solid transparent',
            color: activeTab === 'bookings' ? '#6320EE' : '#64748B',
            fontWeight: 800,
            fontSize: '0.925rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <Calendar size={18} /> My Stays & Bookings ({guestBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'documents' ? '3px solid #6320EE' : '3px solid transparent',
            color: activeTab === 'documents' ? '#6320EE' : '#64748B',
            fontWeight: 800,
            fontSize: '0.925rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <UploadCloud size={18} /> My ID Proof & Documents
        </button>

        <button
          onClick={() => setActiveTab('loyalty')}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'loyalty' ? '3px solid #6320EE' : '3px solid transparent',
            color: activeTab === 'loyalty' ? '#6320EE' : '#64748B',
            fontWeight: 800,
            fontSize: '0.925rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <Sparkles size={18} /> Benefits & Loyalty
        </button>
      </div>

      {/* TAB CONTENT 1: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {guestBookings.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', border: '1px dashed #CBD5E1' }}>
                <Calendar size={30} color="#94A3B8" />
              </div>
              <h4 style={{ margin: 0, color: '#0F2942', fontSize: '1.2rem', fontWeight: 800 }}>No bookings recorded yet</h4>
              <p style={{ margin: '6px 0 20px 0', fontSize: '0.85rem', color: '#64748B' }}>
                Plan your upcoming stay at SV Residency or organize an auspicious event at SV Thirumana Mahal.
              </p>
              <button
                onClick={() => setView('public/book')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6320EE',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 16px rgba(99, 32, 238, 0.25)'
                }}
              >
                Book a Room / Mahal Now
              </button>
            </div>
          ) : (
            guestBookings.map((b) => {
              const currentStep = getStepProgress(b.status);
              const isCancelled = ['Cancelled', 'No-show'].includes(b.status);
              const isRoom = b.serviceType === 'room';

              return (
                <div
                  key={b.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    padding: '24px',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}
                >
                  {/* Booking Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6320EE', backgroundColor: '#F3E8FF', padding: '3px 8px', borderRadius: '6px' }}>
                          {b.id}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: b.status === 'Confirmed' ? '#15803D' : (b.status === 'Checked-in' ? '#0369A1' : '#64748B'), backgroundColor: b.status === 'Confirmed' ? '#DCFCE7' : (b.status === 'Checked-in' ? '#E0F2FE' : '#F1F5F9'), padding: '3px 8px', borderRadius: '6px' }}>
                          ● {b.status}
                        </span>
                      </div>
                      <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#0F2942', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isRoom ? <Bed size={20} color="#6320EE" /> : <Building size={20} color="#C9A227" />}
                        {isRoom ? `SV Residency (${b.packageName || 'Lodging Stay'})` : 'SV Thirumana Mahal Banquet Hall'}
                      </h4>
                    </div>

                    {/* Financial summary & Action buttons */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Schedule: <strong>{b.checkInDate} {isRoom ? `to ${b.checkOutDate}` : ''}</strong></span>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F2942' }}>
                          ₹{(b.financials?.total || 0).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => generateInvoicePdf(b, payments.filter(p => p.bookingId === b.id))}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#F8FAFC',
                            color: '#0F2942',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={13} /> PDF
                        </button>
                        <button
                          onClick={() => printInvoice(b, 'customer')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#6320EE',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Printer size={13} /> Print Invoice
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lifecycle Tracker */}
                  {isCancelled ? (
                    <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', color: '#991B1B', fontSize: '0.85rem', fontWeight: 700 }}>
                      <AlertCircle size={20} /> Booking Cancelled / Slot Released
                    </div>
                  ) : (
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '650px', margin: '0 auto', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '8%', right: '8%', height: '3px', backgroundColor: '#E2E8F0', transform: 'translateY(-50%)', zIndex: 1 }} />
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '8%',
                            width: currentStep === 1 ? '15%' : (currentStep === 2 ? '45%' : (currentStep === 3 ? '75%' : '90%')),
                            height: '3px',
                            backgroundColor: '#6320EE',
                            transform: 'translateY(-50%)',
                            transition: 'width 0.4s ease',
                            zIndex: 2
                          }}
                        />

                        {stepsList.map((st) => {
                          const isActive = currentStep >= st.idx;
                          return (
                            <div key={st.idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative' }}>
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: isActive ? '#6320EE' : '#FFFFFF',
                                  border: isActive ? '2px solid #6320EE' : '2px solid #CBD5E1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  color: isActive ? '#FFFFFF' : '#94A3B8'
                                }}
                              >
                                {isActive ? <Check size={14} /> : st.idx}
                              </div>
                              <span style={{ marginTop: '6px', fontSize: '0.75rem', fontWeight: currentStep === st.idx ? 800 : 600, color: currentStep === st.idx ? '#6320EE' : '#64748B' }}>
                                {st.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Active Front Desk Payment Request Notice */}
                  {b.paymentRequest && b.paymentRequest.status === 'Pending' && (
                    <div
                      style={{
                        backgroundColor: '#FEF3C7',
                        border: '1.5px solid #F59E0B',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <QrCode size={22} color="#B45309" />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: '#B45309', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px' }}>
                              Payment Requested
                            </span>
                            <strong style={{ fontSize: '1.1rem', color: '#78350F' }}>
                              ₹{b.paymentRequest.amount.toLocaleString()}
                            </strong>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.825rem', color: '#92400E' }}>
                            {b.paymentRequest.note || 'Front desk management has requested this payment for your reservation.'}
                          </p>
                          <span style={{ fontSize: '0.72rem', color: '#B45309', marginTop: '2px', display: 'inline-block' }}>
                            Requested by {b.paymentRequest.requestedBy} • VPA: <strong>{b.paymentRequest.upiId || 'svresidencycgm@upi'}</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setPayingBooking(b)}
                        style={{
                          padding: '10px 18px',
                          backgroundColor: '#16A34A',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                        }}
                      >
                        <QrCode size={16} /> Pay ₹{b.paymentRequest.amount.toLocaleString()} via UPI QR
                      </button>
                    </div>
                  )}

                  {/* Card Details Footer */}
                  <div style={{ backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748B', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      {b.roomIds && b.roomIds.length > 0 && (
                        <span>Room Units: <strong style={{ color: '#0F2942' }}>{b.roomIds.join(', ').replace(/room-/g, '#')}</strong> | </span>
                      )}
                      <span>Guests: <strong style={{ color: '#0F2942' }}>{b.guestCount || 1}</strong></span>
                    </div>

                    <div>
                      <span>Advance: <strong style={{ color: '#16A34A' }}>₹{(b.financials?.advancePaid || 0).toLocaleString()}</strong> | </span>
                      <span>Balance Due: <strong style={{ color: (b.financials?.balanceDue || 0) > 0 ? '#DC2626' : '#16A34A' }}>₹{(b.financials?.balanceDue || 0).toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT 2: DOCUMENTS VAULT (Stored on Cloudinary) */}
      {activeTab === 'documents' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#0F2942', fontWeight: 800, margin: 0 }}>
                Customer Document Vault
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '4px 0 0 0' }}>
                Encrypted identity documents uploaded and stored securely in the cloud.
              </p>
            </div>

            <button
              onClick={() => docInputRef.current?.click()}
              disabled={isUploadingDoc}
              style={{
                padding: '10px 18px',
                backgroundColor: '#6320EE',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(99, 32, 238, 0.25)'
              }}
            >
              <UploadCloud size={16} /> {customerDocUrl ? 'Update ID Proof' : 'Upload ID Proof'}
            </button>

            <input
              type="file"
              ref={docInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleDocUpload}
            />
          </div>

          {isUploadingDoc && (
            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#F3E8FF', borderRadius: '12px', border: '1px dashed #D8B4FE', marginBottom: '20px', color: '#6320EE', fontWeight: 700, fontSize: '0.85rem' }}>
              Encrypting & Uploading document securely...
            </div>
          )}

          {customerDocUrl ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
                <div style={{ height: '200px', width: '100%', overflow: 'hidden', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={customerDocUrl} alt="Uploaded Document" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F2942' }}>Aadhaar / ID Card Proof</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: '20px' }}>
                      ✓ Verified
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', wordBreak: 'break-all' }}>
                    Status: {customerDocUrl.startsWith('http') ? 'Secure Cloud Stored' : 'Locally Staged'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px dashed #CBD5E1' }}>
              <ShieldCheck size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: 0, color: '#334155', fontSize: '1rem', fontWeight: 700 }}>No ID Document Uploaded Yet</h4>
              <p style={{ margin: '4px 0 16px 0', fontSize: '0.8rem', color: '#94A3B8' }}>
                Upload your Aadhaar or Gov ID once to enable express contactless check-in during all your stays.
              </p>
              <button
                onClick={() => docInputRef.current?.click()}
                style={{ padding: '9px 18px', backgroundColor: '#0F2942', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Upload ID Proof
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: LOYALTY & REWARDS */}
      {activeTab === 'loyalty' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#FFFBEB', color: '#C9A227', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #FDE68A' }}>
              <Award size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0F2942', fontWeight: 800 }}>SV Patron Club Membership</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>Priority reservations and exclusive banquet perks at Chengam</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '24px' }}>
            <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <strong style={{ fontSize: '0.9rem', color: '#0F2942', display: 'block', marginBottom: '6px' }}>⚡ Express Reception Check-in</strong>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>Verified ID holders can directly receive room keys at front desk without physical paper forms.</p>
            </div>
            <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <strong style={{ fontSize: '0.9rem', color: '#0F2942', display: 'block', marginBottom: '6px' }}>🎁 Best Price Guarantee</strong>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>Direct bookings on our guest portal get preferential tariffs compared to OTA aggregators.</p>
            </div>
            <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <strong style={{ fontSize: '0.9rem', color: '#0F2942', display: 'block', marginBottom: '6px' }}>🏛️ Priority Banquet Hall Dates</strong>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>Hold tentative wedding dates at SV Mahal for up to 48 hours without immediate forfeiting.</p>
            </div>
          </div>
        </div>
      )}

      {/* UPI Payment Modal for Customer Payment Settlement */}
      {payingBooking && payingBooking.paymentRequest && (
        <UpiPaymentModal
          isOpen={!!payingBooking}
          onClose={() => setPayingBooking(null)}
          amount={payingBooking.paymentRequest.amount}
          bookingId={payingBooking.id}
          customerName={payingBooking.customerName}
          upiId={payingBooking.paymentRequest.upiId || (payingBooking.serviceType === 'mahal' ? 'svmahal@upi' : 'svresidencycgm@upi')}
          onPaymentSuccess={handleUpiSuccess}
        />
      )}

    </div>
  );
};
