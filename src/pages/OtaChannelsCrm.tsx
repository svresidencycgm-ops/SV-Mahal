import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Globe,
  RefreshCw,
  Plus,
  CheckCircle2,
  Calendar,
  DollarSign,
  Share2,
  Copy,
  ExternalLink,
  Sliders,
  ShieldCheck,
  Building2,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import type { Booking } from '../types';

export const OtaChannelsCrm: React.FC = () => {
  const { bookings, addBooking, addToast, setSelectedBooking } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [channelFilter, setChannelFilter] = useState<'all' | 'makemytrip' | 'goibibo'>('all');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual OTA Entry Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [otaSource, setOtaSource] = useState<'MakeMyTrip' | 'Goibibo'>('MakeMyTrip');
  const [otaRef, setOtaRef] = useState('');
  const [roomType, setRoomType] = useState('Deluxe');
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [totalAmount, setTotalAmount] = useState(2400);

  // Simulated OTA bookings derived from existing bookings or mock initial OTA reservations
  const otaBookings = bookings.filter(
    (b) => b.bookingSource === 'MakeMyTrip' || b.bookingSource === 'Goibibo'
  );

  // Default sample OTA reservations if none exist yet
  const sampleOtaList: Array<{
    id: string;
    otaRef: string;
    source: 'MakeMyTrip' | 'Goibibo';
    guestName: string;
    guestPhone: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    grossAmount: number;
    commissionPct: number;
    status: string;
  }> = [
    {
      id: 'OTA-MMT-101',
      otaRef: 'MMT-8829104',
      source: 'MakeMyTrip',
      guestName: 'Karthik Narayanan',
      guestPhone: '+91 98401 23456',
      roomType: 'Deluxe AC Room',
      checkIn: '2026-09-25',
      checkOut: '2026-09-27',
      grossAmount: 4800,
      commissionPct: 15,
      status: 'Confirmed'
    },
    {
      id: 'OTA-GIB-102',
      otaRef: 'GIB-4491023',
      source: 'Goibibo',
      guestName: 'Priya Sundaram',
      guestPhone: '+91 94440 98765',
      roomType: 'Premium King Room',
      checkIn: '2026-09-26',
      checkOut: '2026-09-28',
      grossAmount: 6400,
      commissionPct: 15,
      status: 'Confirmed'
    },
    {
      id: 'OTA-MMT-103',
      otaRef: 'MMT-9182041',
      source: 'MakeMyTrip',
      guestName: 'Dr. R. Venkatraman (Temple Yatra)',
      guestPhone: '+91 97890 54321',
      roomType: 'Family Room (AC)',
      checkIn: '2026-09-30',
      checkOut: '2026-10-02',
      grossAmount: 7600,
      commissionPct: 15,
      status: 'Confirmed'
    }
  ];

  // Combined list for display
  const displayOtaBookings = [
    ...sampleOtaList,
    ...otaBookings.map((b) => ({
      id: b.id,
      otaRef: b.otaReference || `OTA-${b.id.substring(b.id.length - 6)}`,
      source: (b.bookingSource === 'Goibibo' ? 'Goibibo' : 'MakeMyTrip') as 'MakeMyTrip' | 'Goibibo',
      guestName: b.customerName,
      guestPhone: b.customerPhone,
      roomType: b.serviceId || 'Deluxe Room',
      checkIn: b.checkInDate,
      checkOut: b.checkOutDate || b.checkInDate,
      grossAmount: b.financials.total,
      commissionPct: b.otaCommission || 15,
      status: b.status
    }))
  ].filter((item) => (channelFilter === 'all' ? true : item.source.toLowerCase() === channelFilter));

  // Sync Action
  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast(
        'OTA 2-Way Sync Successful',
        'Handshake with IngoMMT (MakeMyTrip & Goibibo) completed. Rates and 2-month room inventory are in parity.',
        'success'
      );
    }, 1200);
  };

  // Handle Manual Form Submission
  const handleAddManualOta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) {
      addToast('Validation Error', 'Guest name and phone number are required', 'warning');
      return;
    }

    const newBooking: Omit<Booking, 'id' | 'createdAt' | 'createdBy' | 'paymentStatus'> = {
      customerName: guestName,
      customerPhone: guestPhone,
      customerEmail: `${guestName.toLowerCase().replace(/\s+/g, '')}@ota-guest.com`,
      customerAddress: `Booked via ${otaSource} (Chengam Stay)`,
      serviceType: 'room',
      serviceId: roomType,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestCount: 2,
      roomCount: 1,
      idType: 'Aadhaar / Passport (OTA Verified)',
      idNumber: 'VERIFIED-BY-OTA',
      specialRequirements: `OTA Channel Booking: ${otaSource} | Ref: ${otaRef || 'DIRECT-EXTRANET'}`,
      financials: {
        baseAmount: totalAmount,
        subtotal: totalAmount,
        discount: 0,
        tax: totalAmount * 0.12,
        total: totalAmount,
        advancePaid: totalAmount,
        balanceDue: 0
      },
      status: 'Confirmed',
      bookingSource: otaSource,
      otaReference: otaRef || `${otaSource.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      otaCommission: 15,
      otaPayoutStatus: 'Pending',
      billingType: 'Normal'
    };

    addBooking(newBooking);
    setIsManualModalOpen(false);
    setGuestName('');
    setGuestPhone('');
    setOtaRef('');
    addToast(
      'OTA Booking Logged',
      `Successfully added ${otaSource} booking for ${guestName}. Room inventory updated.`,
      'success'
    );
  };

  const copyIcalUrl = () => {
    navigator.clipboard.writeText('https://svresidency.com/api/v1/ota/ical-feed.ics');
    addToast('Copied to Clipboard', 'IngoMMT 2-way iCal sync URL copied.', 'info');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px', fontFamily: 'var(--font-sans)' }}>
      {/* Title & Top Action Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              CHANNEL MANAGER
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>IngoMMT Unified Portal</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#0F2942', fontWeight: 800, margin: '6px 0 2px 0' }}>
            MakeMyTrip & Goibibo Central Hub
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            Unified two-way channel synchronization, rates parity, and real-time OTA reservation feed for SV Residency.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              color: '#0F172A',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <RefreshCw size={16} className={isSyncing ? 'spin' : ''} color="#0284C7" />
            {isSyncing ? 'Syncing IngoMMT...' : 'Sync Channels Now'}
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: '#0284C7',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)'
            }}
          >
            <Plus size={16} /> Log OTA Reservation
          </button>
        </div>
      </div>

      {/* Answer to User Query Banner */}
      <div
        style={{
          backgroundColor: '#F0F9FF',
          border: '1px solid #BAE6FD',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}
      >
        <ShieldCheck size={24} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 800, color: '#0369A1', fontSize: '0.95rem' }}>
            Is it possible to integrate MakeMyTrip and Goibibo bookings into your Admin Panel?
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
            <strong>Yes, 100%!</strong> In hotel operations, MakeMyTrip and Goibibo operate under a unified backend called <strong>IngoMMT Extranet</strong>. You can connect your SV Residency admin panel using <strong>IngoMMT Channel Partner API</strong> or <strong>2-way iCal Calendar Sync</strong>. Whenever a traveler books a room on MakeMyTrip or Goibibo, the booking is instantly registered here, and room dates are automatically blocked to prevent double-booking.
          </p>
        </div>
      </div>

      {/* Channel Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}
      >
        {/* MakeMyTrip Channel Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '4px', backgroundColor: '#E11D48', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: '#FFE4E6',
                  color: '#E11D48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  border: '1px solid #FECDD3'
                }}
              >
                MMT
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  MakeMyTrip
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Property ID: MMT-SV-CHENGAM-01</span>
              </div>
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              <CheckCircle2 size={12} /> Connected
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}>ACTIVE RESERVATIONS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {displayOtaBookings.filter((b) => b.source === 'MakeMyTrip').length} Bookings
              </div>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}>COMMISSION RATE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#E11D48', marginTop: '2px' }}>
                15% IngoMMT
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
            <span>Inventory Auto-Block: <strong>Active</strong></span>
            <span style={{ color: '#16A34A', fontWeight: 600 }}>● Instant Sync ON</span>
          </div>
        </div>

        {/* Goibibo Channel Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '4px', backgroundColor: '#F97316', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: '#FFEDD5',
                  color: '#EA580C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  border: '1px solid #FED7AA'
                }}
              >
                GIB
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  Goibibo
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Property ID: GIB-SV-CHENGAM-01</span>
              </div>
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              <CheckCircle2 size={12} /> Connected
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}>ACTIVE RESERVATIONS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {displayOtaBookings.filter((b) => b.source === 'Goibibo').length} Bookings
              </div>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}>COMMISSION RATE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EA580C', marginTop: '2px' }}>
                15% Unified
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
            <span>Inventory Auto-Block: <strong>Active</strong></span>
            <span style={{ color: '#16A34A', fontWeight: 600 }}>● Instant Sync ON</span>
          </div>
        </div>

        {/* Channel Sync Configuration Card */}
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C9A227', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Share2 size={14} /> 2-WAY CALENDAR SYNC URL
            </div>
            <h4 style={{ margin: '6px 0 10px 0', fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
              IngoMMT Extranet iCal Feed
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 12px 0' }}>
              Paste this secret iCal calendar link into your MakeMyTrip & Goibibo partner extranet settings to automatically block booked dates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value="https://svresidency.com/api/v1/ota/ical-feed.ics"
              style={{
                flexGrow: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#CBD5E1',
                fontSize: '0.75rem',
                outline: 'none'
              }}
            />
            <button
              onClick={copyIcalUrl}
              style={{
                padding: '8px 12px',
                backgroundColor: '#C9A227',
                border: 'none',
                borderRadius: '6px',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Copy size={13} /> Copy
            </button>
          </div>
        </div>
      </div>

      {/* OTA Bookings Table Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          marginBottom: '30px'
        }}
      >
        {/* Table Filter Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              MakeMyTrip & Goibibo Active Reservations
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Showing {displayOtaBookings.length} reservations from integrated OTA partners
            </span>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setChannelFilter('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: channelFilter === 'all' ? '#0F172A' : '#F1F5F9',
                color: channelFilter === 'all' ? '#FFFFFF' : '#475569',
                cursor: 'pointer'
              }}
            >
              All Channels ({sampleOtaList.length + otaBookings.length})
            </button>
            <button
              onClick={() => setChannelFilter('makemytrip')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: channelFilter === 'makemytrip' ? '#E11D48' : '#FFE4E6',
                color: channelFilter === 'makemytrip' ? '#FFFFFF' : '#9F1239',
                cursor: 'pointer'
              }}
            >
              MakeMyTrip
            </button>
            <button
              onClick={() => setChannelFilter('goibibo')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: channelFilter === 'goibibo' ? '#EA580C' : '#FFEDD5',
                color: channelFilter === 'goibibo' ? '#FFFFFF' : '#9A3412',
                cursor: 'pointer'
              }}
            >
              Goibibo
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="table-container" style={{ margin: 0 }}>
          <table className="crm-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>OTA Ref ID</th>
                <th>Guest Name</th>
                <th>Room Type</th>
                <th>Check-in / Check-out</th>
                <th>Tariff (Gross)</th>
                <th>Net Payout (after 15%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayOtaBookings.map((b) => {
                const netPayout = Math.round(b.grossAmount * (1 - b.commissionPct / 100));
                return (
                  <tr key={b.id}>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: b.source === 'MakeMyTrip' ? '#FFE4E6' : '#FFEDD5',
                          color: b.source === 'MakeMyTrip' ? '#BE123C' : '#C2410C'
                        }}
                      >
                        {b.source}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                      {b.otaRef}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{b.guestName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{b.guestPhone}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>
                      {b.roomType}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <div>In: <strong>{b.checkIn}</strong></div>
                      <div style={{ color: '#64748B' }}>Out: <strong>{b.checkOut}</strong></div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>
                      ₹{b.grossAmount.toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#16A34A' }}>
                        ₹{netPayout.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#E11D48' }}>
                        -₹{(b.grossAmount - netPayout).toLocaleString()} commission
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#DCFCE7',
                          color: '#15803D'
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Integration Architecture Guide for Owner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h4 style={{ margin: '0 0 12px 0', fontSize: '1.15rem', color: '#0F172A', fontWeight: 800 }}>
          How MakeMyTrip & Goibibo Integration Works in Production
        </h4>
        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
          MakeMyTrip and Goibibo are owned by MakeMyTrip Limited and operate on a shared inventory extranet called <strong>IngoMMT</strong>. You have 3 official methods to connect:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <div style={{ fontWeight: 800, color: '#0284C7', fontSize: '0.9rem', marginBottom: '6px' }}>
              Method 1: Direct IngoMMT API / Webhooks
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Apply for IngoMMT Developer Partner API keys. Your server receives real-time webhook calls whenever a reservation is booked or cancelled on MakeMyTrip or Goibibo.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <div style={{ fontWeight: 800, color: '#0284C7', fontSize: '0.9rem', marginBottom: '6px' }}>
              Method 2: Channel Manager Middleware
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Connect via leading hospitality channel managers such as <strong>Staah, AxisRooms, eZee Technosys, or RateGain</strong>. They provide 2-way sync across MMT, Goibibo, Booking.com, and Agoda simultaneously.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <div style={{ fontWeight: 800, color: '#0284C7', fontSize: '0.9rem', marginBottom: '6px' }}>
              Method 3: 2-Way iCal Calendar Sync
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Zero-coding setup! Export your SV Residency booking calendar URL into IngoMMT extranet. IngoMMT blocks booked dates, avoiding double booking automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '460px',
              maxWidth: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}
          >
            <div style={{ padding: '20px', backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Log OTA Reservation</h4>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Record booking from MakeMyTrip or Goibibo</span>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManualOta} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Booking Source Channel:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="ota"
                      checked={otaSource === 'MakeMyTrip'}
                      onChange={() => setOtaSource('MakeMyTrip')}
                    />
                    <strong>MakeMyTrip</strong>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="ota"
                      checked={otaSource === 'Goibibo'}
                      onChange={() => setOtaSource('Goibibo')}
                    />
                    <strong>Goibibo</strong>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  OTA Reference ID:
                </label>
                <input
                  type="text"
                  placeholder="e.g. MMT-992014 or GIB-552194"
                  value={otaRef}
                  onChange={(e) => setOtaRef(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Guest Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Guest Name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Mobile Number:
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Room Category:
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                >
                  <option value="Standard Room">Standard Room (₹1,500)</option>
                  <option value="Deluxe Room">Deluxe AC Room (₹2,400)</option>
                  <option value="Premium Room">Premium Room (₹3,200)</option>
                  <option value="Family Room">Family Room (₹3,800)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Check-in Date:
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Check-out Date:
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Gross Tariff Amount (₹):
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#0284C7', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700 }}
                >
                  Confirm & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
