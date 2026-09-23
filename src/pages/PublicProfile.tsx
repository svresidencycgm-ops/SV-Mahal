import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, User, Phone, Mail, ShieldCheck, AlertCircle, Check } from 'lucide-react';

export const PublicProfile: React.FC = () => {
  const { bookings, customerUser, setView } = useApp();

  if (!customerUser) {
    return (
      <div className="container animate-fade-in" style={{ padding: '60px 0', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', border: '1px solid #D2E3F8', maxWidth: '400px', boxShadow: 'var(--shadow-md)' }}>
          <AlertCircle size={48} color="#DC2626" style={{ marginBottom: '16px', margin: '0 auto' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0F2942', fontWeight: 800 }}>Profile Unavailable</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '8px 0 20px 0' }}>
            Please log in with your phone number via OTP to access your booking dashboard.
          </p>
          <button
            onClick={() => setView('public/home')}
            style={{ padding: '10px 20px', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Filter bookings of this customer phone number
  const guestBookings = bookings.filter(
    b => b.customerPhone.replace(/\D/g, '') === customerUser.phone.replace(/\D/g, '')
  );

  const getStepProgress = (status: string) => {
    // Return step indexes: 1 = Submitted, 2 = Approved, 3 = CheckedIn, 4 = Completed
    if (['Inquiry', 'Pending'].includes(status)) return 1;
    if (['Confirmed'].includes(status)) return 2;
    if (['Checked-in'].includes(status)) return 3;
    if (['Completed', 'Checked-out'].includes(status)) return 4;
    return 0; // Cancelled / No-show
  };

  const stepsList = [
    { idx: 1, label: 'Submitted' },
    { idx: 2, label: 'Approved' },
    { idx: 3, label: 'In-House' },
    { idx: 4, label: 'Completed' }
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 0', minHeight: '80vh' }}>
      
      {/* 1. PROFILE DETAILS BAR */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F2942, #1E3A5F)',
          borderRadius: '12px',
          padding: '24px 30px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '40px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF' }}>
            <User size={28} color="#FFFFFF" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{customerUser.name}</h2>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#CBD5E1', marginTop: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {customerUser.phone}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {customerUser.email}</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color="#0284C7" /> Verified OTP profile
        </div>
      </div>

      {/* 2. BOOKINGS HISTORY LIST */}
      <div>
        <h3 style={{ fontSize: '1.5rem', color: '#0F2942', fontWeight: 800, marginBottom: '20px', fontFamily: 'var(--font-sans)' }}>
          My Bookings & Stays
        </h3>

        {guestBookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <Calendar size={40} color="#64748B" style={{ marginBottom: '12px', margin: '0 auto 12px auto' }} />
            <h4 style={{ margin: 0, color: '#0F2942' }}>No bookings found</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.825rem', color: '#64748B' }}>
              You don't have any stays or banquet events booked on this number yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {guestBookings.map(b => {
              const currentStep = getStepProgress(b.status);
              const isCancelled = ['Cancelled', 'No-show'].includes(b.status);

              return (
                <div
                  key={b.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}
                >
                  {/* Card Header details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
                        BOOKING CODE: <strong style={{ color: '#0284C7' }}>{b.id}</strong>
                      </span>
                      <h4 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', color: '#0F2942', fontWeight: 800 }}>
                        {b.serviceType === 'mahal' ? 'SV Mahal Banquet Hall' : `Residency Room stay (${b.packageName || 'Lodging'})`}
                      </h4>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Check-in: <strong>{b.checkInDate}</strong></span>
                      <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, color: '#0F2942', marginTop: '2px' }}>
                        Total: ₹{b.financials.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 3. LIFECYCLE PROGRESS TRACK */}
                  {isCancelled ? (
                    <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontSize: '0.85rem', fontWeight: 700 }}>
                      <AlertCircle size={18} /> Booking Cancelled / Rejected by Venue Management
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '600px', margin: '0 auto 10px auto', position: 'relative', padding: '10px 0' }}>
                        {/* Horizontal connector line background */}
                        <div style={{ position: 'absolute', top: '50%', left: '5%', right: '5%', height: '3px', backgroundColor: '#E2E8F0', transform: 'translateY(-50%)', zIndex: 1 }} />
                        
                        {/* Horizontal connector line active fill */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '5%',
                            width: currentStep === 1 ? '0%' : (currentStep === 2 ? '30%' : (currentStep === 3 ? '65%' : '90%')),
                            height: '3px',
                            backgroundColor: '#0284C7',
                            transform: 'translateY(-50%)',
                            transition: 'width 0.4s ease',
                            zIndex: 2
                          }}
                        />

                        {stepsList.map(step => {
                          const isActive = currentStep >= step.idx;
                          return (
                            <div key={step.idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative' }}>
                              <div
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  backgroundColor: isActive ? '#0284C7' : '#FFFFFF',
                                  border: isActive ? '2px solid #0284C7' : '2px solid #CBD5E1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  color: isActive ? '#FFFFFF' : '#94A3B8',
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                {isActive ? <Check size={14} /> : step.idx}
                              </div>
                              <span
                                style={{
                                  marginTop: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: currentStep === step.idx ? 800 : 500,
                                  color: currentStep === step.idx ? '#0284C7' : '#64748B'
                                }}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Booking details checklist footer */}
                  <div style={{ backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', flexWrap: 'wrap', gap: '10px' }}>
                    <span>Special requirements: {b.specialRequirements}</span>
                    <span>Advance paid: <strong style={{ color: '#16A34A' }}>₹{b.financials.advancePaid.toLocaleString()}</strong> | Balance due: <strong style={{ color: '#DC2626' }}>₹{b.financials.balanceDue.toLocaleString()}</strong></span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
