import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, Shield, Globe, Radio, ArrowRight, CheckCircle2, MessageCircle
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { bookings, rooms, payments, setView, setSelectedBooking, currentUserRole, customers, updateBooking, addToast } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // CALCULATE CORE KPIs
  const checkInsToday = bookings.filter(
    b => b.serviceType === 'room' && b.checkInDate === todayStr && b.status === 'Confirmed'
  );
  
  const outstandingBalance = bookings
    .filter(b => !['Cancelled', 'Completed'].includes(b.status))
    .reduce((sum, b) => sum + b.financials.balanceDue, 0);

  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance' || r.status === 'Blocked').length;
  const availableRooms = rooms.length - occupiedRooms - maintenanceRooms;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

  const activeMahalBookings = bookings.filter(
    b => b.serviceType === 'mahal' && b.checkInDate.startsWith('2026') && !['Cancelled'].includes(b.status)
  ).length;

  const upcomingMahalEvents = [...bookings]
    .filter(b => b.serviceType === 'mahal' && b.checkInDate >= todayStr && b.status !== 'Cancelled')
    .sort((a, b) => a.checkInDate.localeCompare(b.checkInDate))
    .slice(0, 3);

  const recentPayments = [...payments]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, 4);

  const todayOperations = bookings.filter(b => {
    if (b.status === 'Cancelled') return false;
    if (b.serviceType === 'room') {
      return b.checkInDate === todayStr || b.checkOutDate === todayStr;
    }
    return b.checkInDate === todayStr;
  });

  const otaBookings = bookings.filter(
    b => b.bookingSource === 'MakeMyTrip' || b.bookingSource === 'Goibibo' || b.channel === 'makemytrip' || b.channel === 'goibibo'
  );

  const handleQuickCheckIn = (b: any) => {
    updateBooking({ ...b, status: 'Active' });
    addToast(`Guest ${b.customerName} checked in. Room allocated.`, 'success');
  };

  const handleWhatsAppGuest = (b: any) => {
    const text = encodeURIComponent(
      `Vanakkam ${b.customerName}, greeting from SV Residency Chengam! We have confirmed your ${b.bookingSource || 'IngoMMT API'} reservation (Ref: ${b.id}). Front desk helpline: 95008 21550 / 90437 80215.`
    );
    window.open(`https://wa.me/${(b.customerPhone || '9500821550').replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', fontFamily: 'var(--font-sans)' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#0F172A', margin: 0, fontWeight: 800 }}>
            Operations Command Console
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Live Status Matrix • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • Welcome back, {currentUserRole === 'admin' ? 'Administrator' : 'Duty Manager'}.
          </p>
        </div>
      </div>

      {/* ROW 1: CORE KPI CARDS (Matching top widgets from Mockup) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Card 1: Daily Health Summary (Left widget in mockup) */}
        <div className="neomorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EAB308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} color="#FFFFFF" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#0F172A', margin: 0, fontWeight: 700 }}>Residency Desk</h4>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Thukkapet, Chengam</span>
              </div>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>{availableRooms} Free</div>
          </div>
          <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.825rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748B' }}>Room Occupancy</span>
              <span style={{ fontWeight: 700, color: '#10B981' }}>{occupancyRate}% (+6.7%)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748B' }}>Outstanding Ledger</span>
              <span style={{ fontWeight: 700, color: '#F59E0B' }}>₹{outstandingBalance.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748B' }}>Registered Profiles</span>
              <span style={{ fontWeight: 700, color: '#6366F1' }}>{customers.length} (+5.4%)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748B' }}>Scheduled Events</span>
              <span style={{ fontWeight: 700, color: '#EC4899' }}>{activeMahalBookings} (+3.8%)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Capacity Circular Metrics (Middle widget in mockup) */}
        <div className="neomorphic-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Capacity Indicators</h4>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexGrow: 1 }}>
            {/* Circle 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <svg width="84" height="84" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - occupancyRate / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="56" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0F172A">{occupancyRate}%</text>
              </svg>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Stays Occupancy</span>
            </div>

            {/* Circle 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <svg width="84" height="84" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - 0.33)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="56" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0F172A">33%</text>
              </svg>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Banquet Capacity</span>
            </div>
          </div>
        </div>

        {/* Card 3: Sparkline Waves & Totals (Right widget in mockup) */}
        <div className="neomorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Spark 1 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Daily Check-ins</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{checkInsToday.length} bookings</h3>
            </div>
            <svg viewBox="0 0 120 60" style={{ width: '80px', height: '35px' }}>
              <path d="M 0,50 Q 30,10 60,35 T 120,20 L 120,60 L 0,60 Z" fill="#F3E8FF" />
              <path d="M 0,50 Q 30,10 60,35 T 120,20" fill="none" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          
          <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

          {/* Spark 2 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Total Customers</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{customers.length} guests</h3>
            </div>
            <svg viewBox="0 0 120 60" style={{ width: '80px', height: '35px' }}>
              <path d="M 0,40 Q 30,15 60,45 T 120,10 L 120,60 L 0,60 Z" fill="#FEF9C3" />
              <path d="M 0,40 Q 30,15 60,45 T 120,10" fill="none" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* ROW 2: DETAILED ANALYTICS CHARTS (Double Line & Cash Flow from mockup) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Line Curve Chart */}
        <div className="neomorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Stays vs Banquet Event Analytics</h4>
          
          <svg viewBox="0 0 460 220" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <line x1="40" y1="20" x2="420" y2="20" stroke="#F1F5F9" strokeWidth="1.5" />
            <line x1="40" y1="70" x2="420" y2="70" stroke="#F1F5F9" strokeWidth="1.5" />
            <line x1="40" y1="120" x2="420" y2="120" stroke="#F1F5F9" strokeWidth="1.5" />
            <line x1="40" y1="170" x2="420" y2="170" stroke="#F1F5F9" strokeWidth="1.5" />
            
            <line x1="120" y1="20" x2="120" y2="170" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="240" y1="20" x2="240" y2="170" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="360" y1="20" x2="360" y2="170" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3,3" />

            {/* Line 1 (Pink) */}
            <path d="M 40,150 Q 120,40 240,110 T 400,60" fill="none" stroke="#EC4899" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="120" cy="78" r="6" fill="#EC4899" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="240" cy="110" r="6" fill="#EC4899" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="360" cy="85" r="6" fill="#EC4899" stroke="#FFFFFF" strokeWidth="2.5" />

            {/* Line 2 (Cyan) */}
            <path d="M 40,170 Q 120,120 240,140 T 400,80" fill="none" stroke="#06B6D4" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="120" cy="132" r="6" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="240" cy="140" r="6" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="360" cy="100" r="6" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="2.5" />

            <text x="120" y="200" textAnchor="middle" fontSize="11" fill="#94A3B8" fontWeight="700">180</text>
            <text x="240" y="200" textAnchor="middle" fontSize="11" fill="#94A3B8" fontWeight="700">340</text>
            <text x="360" y="200" textAnchor="middle" fontSize="11" fill="#94A3B8" fontWeight="700">460</text>
          </svg>
        </div>

        {/* Cash Flow Area Chart */}
        <div className="neomorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Monthly Operations Cash Flow</h4>
          
          <svg viewBox="0 0 500 220" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <line x1="30" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1.5" />
            <line x1="30" y1="70" x2="480" y2="70" stroke="#F1F5F9" strokeWidth="1.5" />
            <line x1="30" y1="120" x2="480" y2="120" stroke="#F1F5F9" strokeWidth="1.5" />
            <line x1="30" y1="170" x2="480" y2="170" stroke="#F1F5F9" strokeWidth="1.5" />

            <path d="M 30,170 Q 120,60 210,130 T 390,70 T 480,90 L 480,170 L 30,170 Z" fill="#D1FAE5" opacity="0.65" />
            <path d="M 30,170 Q 120,60 210,130 T 390,70 T 480,90" fill="none" stroke="#10B981" strokeWidth="4.5" strokeLinecap="round" />
            
            <circle cx="210" cy="130" r="5" fill="#10B981" />
            <rect x="195" y="102" width="30" height="18" rx="4" fill="#1E293B" />
            <text x="210" y="114" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#FFFFFF">3,455</text>

            <circle cx="390" cy="70" r="5" fill="#10B981" />
            <rect x="375" y="42" width="30" height="18" rx="4" fill="#1E293B" />
            <text x="390" y="54" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#FFFFFF">7,678</text>

            <text x="30" y="200" textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="700">0</text>
            <text x="120" y="200" textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="700">100</text>
            <text x="210" y="200" textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="700">200</text>
            <text x="300" y="200" textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="700">300</text>
            <text x="390" y="200" textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="700">400</text>
            <text x="480" y="200" textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="700">500</text>
          </svg>
        </div>

        {/* Card 6: Room Status Matrix & Action Toggles (Bottom right in mockup) */}
        <div className="neomorphic-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 12px 0', fontWeight: 700, textTransform: 'uppercase' }}>Status Actions</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Room Stays</span>
                <span style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: '#10B981', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700 }}>ACTIVE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Mahal Weddings</span>
                <span style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: '#EC4899', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700 }}>ACTIVE</span>
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Rooms Status Matrix</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {rooms.map(r => {
                let color = '#10B981'; // Available
                if (r.status === 'Occupied') color = '#EF4444';
                if (r.status === 'Reserved') color = '#F59E0B';
                if (r.status === 'Maintenance' || r.status === 'Blocked') color = '#64748B';
                
                return (
                  <div
                    key={r.id}
                    title={`Room ${r.number}: ${r.status}`}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS PANEL */}
      <div className="neomorphic-card" style={{ padding: '20px 24px' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '16px' }}>
          Operations Quick Desk
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => setView('crm/onsite-booking')}
            style={{
              padding: '10px 18px',
              backgroundColor: '#0F2942',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '24px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={14} /> New Room Check-in
          </button>
          
          <button
            onClick={() => setView('crm/onsite-booking-mahal')}
            style={{
              padding: '10px 18px',
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '24px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={14} /> New Mahal Event
          </button>

          <button
            onClick={() => setView('crm/customers')}
            style={{
              padding: '10px 18px',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: '24px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            View Customer base
          </button>
        </div>
      </div>

      {/* INCOMING OTA BOOKINGS (MakeMyTrip & Goibibo API Integration for Admin & Duty Manager) */}
      <div className="neomorphic-card" style={{ padding: '20px 24px', borderLeft: '4px solid #EF4444' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={22} color="#DC2626" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  MakeMyTrip & Goibibo API Live Bookings
                </h3>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '0.72rem', fontWeight: 700 }}>
                  <Radio size={12} className="animate-pulse" /> IngoMMT API v2.4 Active
                </span>
                <span style={{ padding: '3px 10px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: '0.72rem', fontWeight: 700 }}>
                  {currentUserRole === 'admin' ? 'Admin Full Access' : 'Duty Manager Fast Check-in'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '4px 0 0 0' }}>
                Automated webhook sync for SV Residency Front Office • Property Code: <code style={{ backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>MMT_CGM_SV_RESIDENCY_01</code>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setView('crm/ota-channels')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                backgroundColor: '#0F2942',
                color: '#FFFFFF',
                borderRadius: '24px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Open OTA Channel Manager <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {otaBookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {otaBookings.slice(0, 3).map((b) => {
              const isMMT = b.bookingSource === 'MakeMyTrip';
              return (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: isMMT ? '#FEE2E2' : '#FFEDD5',
                        color: isMMT ? '#DC2626' : '#EA580C',
                        border: `1px solid ${isMMT ? '#FECACA' : '#FED7AA'}`
                      }}
                    >
                      {b.bookingSource || 'IngoMMT'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.875rem' }}>
                        {b.customerName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Dates: {b.checkInDate} to {b.checkOutDate} • Stay: ₹{b.financials.total.toLocaleString()} • Status: <strong style={{ color: b.status === 'Active' ? '#16A34A' : '#0284C7' }}>{b.status}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {b.status !== 'Active' && (
                      <button
                        onClick={() => handleQuickCheckIn(b)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <CheckCircle2 size={13} /> Quick Check-in
                      </button>
                    )}
                    <button
                      onClick={() => handleWhatsAppGuest(b)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        backgroundColor: '#25D366',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </button>
                    <button
                      onClick={() => setSelectedBooking(b)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#FFFFFF',
                        color: '#475569',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem' }}>
                IngoMMT API Stream Connected & Listening
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                MakeMyTrip & Goibibo reservations are ingested automatically into SV Residency CRM via API endpoint.
              </div>
            </div>
            <button
              onClick={() => setView('crm/ota-channels')}
              style={{
                padding: '7px 16px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Fetch Live IngoMMT Bookings
            </button>
          </div>
        )}
      </div>

      {/* ROW 3: DETAILED OPERATIONS LOGS TABLES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Today's Operations checklist */}
        <div className="neomorphic-card" style={{ display: 'flex', flexDirection: 'column', height: '320px' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
            Today's Check-ins & Check-outs
          </h3>
          <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {todayOperations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94A3B8', fontSize: '0.8rem' }}>
                No operations checklist for today.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {todayOperations.map(b => {
                  const isCheckIn = b.checkInDate === todayStr;
                  return (
                    <div
                      key={b.id}
                      onClick={() => { setSelectedBooking(b); }}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        backgroundColor: '#F8FAFC',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: '#334155' }}>{b.customerName}</span>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          Ref: {b.id} | {b.serviceType === 'room' ? 'Room Stay' : 'Mahal Event'}
                        </div>
                      </div>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: isCheckIn ? '#DCFCE7' : '#FEF3C7',
                        color: isCheckIn ? '#16A34A' : '#D97706'
                      }}>
                        {isCheckIn ? 'Check-in' : 'Checkout'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Mahal Events */}
        <div className="neomorphic-card" style={{ display: 'flex', flexDirection: 'column', height: '320px' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
            Upcoming weddings & Celebrations
          </h3>
          <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {upcomingMahalEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94A3B8', fontSize: '0.8rem' }}>
                No wedding events booked yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingMahalEvents.map(b => (
                  <div
                    key={b.id}
                    onClick={() => { setSelectedBooking(b); }}
                    style={{
                      padding: '12px 14px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontSize: '0.825rem',
                      backgroundColor: '#F8FAFC',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: '#334155' }}>
                        {b.checkInDate} — {b.eventDetails?.eventType}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                        Client: {b.customerName} | Rent: ₹{b.financials.total.toLocaleString()}
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: b.paymentStatus === 'Paid' ? '#DCFCE7' : '#FEE2E2',
                      color: b.paymentStatus === 'Paid' ? '#16A34A' : '#DC2626'
                    }}>
                      {b.paymentStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent payments / Recent bookings log */}
        <div className="neomorphic-card" style={{ display: 'flex', flexDirection: 'column', height: '320px' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
            {currentUserRole === 'manager' ? 'Recent Stays & Bookings' : 'Recent Payment Ledger Entries'}
          </h3>
          <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {currentUserRole === 'manager' ? (
              bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94A3B8', fontSize: '0.8rem' }}>
                  No bookings registered.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[...bookings].slice(0, 4).map(b => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        backgroundColor: '#F8FAFC'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: '#334155' }}>{b.customerName}</span>
                        <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>
                          Ref: {b.id} | {b.serviceType === 'room' ? 'Room Stay' : 'Mahal Event'}
                        </div>
                      </div>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: '#E0F2FE',
                        color: '#0284C7'
                      }}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              recentPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94A3B8', fontSize: '0.8rem' }}>
                  No ledger entries.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentPayments.map(p => (
                    <div
                      key={p.id}
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.825rem',
                        backgroundColor: '#F8FAFC'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: '#16A34A' }}>+ ₹{p.amount.toLocaleString()}</span>
                        <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>
                          Ref: {p.bookingId} | Method: {p.method}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>{p.date}</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
