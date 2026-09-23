import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, Ban, Trash2, Search, Plus, ChevronLeft, ChevronRight, Building } from 'lucide-react';
import type { Booking } from '../types';
import { MahalBookingCalendarModal } from '../components/MahalBookingCalendarModal';

export const BookingsCrm: React.FC = () => {
  const { currentView, bookings, setSelectedBooking, cancelBooking, deleteBooking, currentUserRole, setView } = useApp();

  // Search & Filters state
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'room' | 'mahal'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [isMahalModalOpen, setIsMahalModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset pagination on view change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentView]);

  // Parse query parameters from currentView (e.g. crm/bookings?service=room&source=offline)
  const queryString = currentView.includes('?') ? currentView.split('?')[1] : '';
  const urlParams = new URLSearchParams(queryString);
  const serviceParam = urlParams.get('service'); // 'room' | 'mahal' | null
  const sourceParam = urlParams.get('source'); // 'online' | 'offline' | null

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.id.toLowerCase().includes(search.toLowerCase().trim()) ||
      b.customerName.toLowerCase().includes(search.toLowerCase().trim()) ||
      b.customerPhone.includes(search.trim()) ||
      (b.otaReference && b.otaReference.toLowerCase().includes(search.toLowerCase().trim()));

    // Use query parameter if present, otherwise local dropdown filter
    const activeService = serviceParam || serviceFilter;
    const matchesService = activeService === 'all' ? true : b.serviceType === activeService;

    // Use source query parameter if present (Online / Offline)
    const activeSource = sourceParam ? (sourceParam === 'online' ? 'Online' : 'Offline') : null;
    const matchesSource = activeSource ? b.bookingSource === activeSource : true;

    const matchesStatus = statusFilter === 'all' ? true : b.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' ? true : b.paymentStatus === paymentFilter;
    const matchesChannel = channelFilter === 'all' ? true : b.bookingSource === channelFilter;

    return matchesSearch && matchesService && matchesSource && matchesStatus && matchesPayment && matchesChannel;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleCancelClick = (id: string) => {
    if (window.confirm(`Are you sure you want to cancel booking ${id}?`)) {
      cancelBooking(id);
    }
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm(`WARNING: Permanently delete booking ${id} and all related transactions?`)) {
      deleteBooking(id);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <MahalBookingCalendarModal isOpen={isMahalModalOpen} onClose={() => setIsMahalModalOpen(false)} />

      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
            Reservations CRM Panel
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Search, filter, and manage hotel room stay schedules and Mahal banquet bookings.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setView('crm/onsite-booking')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={14} /> New Room Stay
          </button>
          <button
            onClick={() => setView('crm/onsite-booking-mahal')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#C9A227',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={14} /> Book SV Mahal
          </button>
        </div>
      </div>

      {/* FILTERS WIDGET */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Search Input */}
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 12px', backgroundColor: '#F8FAFC' }}>
          <Search size={14} color="#94A3B8" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search by ID, Customer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.8rem' }}
          />
        </div>

        {/* Service Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <span style={{ fontWeight: 700, color: '#64748B' }}>SERVICE:</span>
          <select
            value={serviceFilter}
            onChange={(e) => { setServiceFilter(e.target.value as any); setCurrentPage(1); }}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#FFFFFF' }}
          >
            <option value="all">All Services</option>
            <option value="room">Hotel Room</option>
            <option value="mahal">SV Mahal</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <span style={{ fontWeight: 700, color: '#64748B' }}>STATUS:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#FFFFFF' }}
          >
            <option value="all">All Statuses</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-in">Checked-in</option>
            <option value="Checked-out">Checked-out</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No-show">No-show</option>
          </select>
        </div>

        {/* Payment Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <span style={{ fontWeight: 700, color: '#64748B' }}>PAYMENT:</span>
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#FFFFFF' }}
          >
            <option value="all">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        {/* OTA Channel Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <span style={{ fontWeight: 700, color: '#64748B' }}>CHANNEL:</span>
          <select
            value={channelFilter}
            onChange={(e) => { setChannelFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#FFFFFF', fontWeight: 600 }}
          >
            <option value="all">All Channels</option>
            <option value="Direct">Direct Website</option>
            <option value="MakeMyTrip">MakeMyTrip (MMT)</option>
            <option value="Goibibo">Goibibo</option>
            <option value="Offline">Front Desk / Walk-in</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="table-container shadow-sm">
        {paginatedBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', fontSize: '0.9rem' }}>
            No matching bookings found.
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service & Channel</th>
                <th>Schedule Date</th>
                <th>Financials</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{b.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{b.customerPhone}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: 600 }}>
                        {b.serviceType === 'room' ? `Room Stay (${b.roomCount || 1} rooms)` : 'SV Mahal banquet'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {b.bookingSource === 'MakeMyTrip' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#FFF1F2', color: '#E11D48', border: '1px solid #FECDD3', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800 }}>
                            ● MakeMyTrip
                          </span>
                        )}
                        {b.bookingSource === 'Goibibo' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800 }}>
                            ● Goibibo
                          </span>
                        )}
                        {(b.bookingSource === 'Direct' || b.bookingSource === 'Online') && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                            ● Direct Web
                          </span>
                        )}
                        {(!b.bookingSource || b.bookingSource === 'Offline') && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                            ● Front Desk
                          </span>
                        )}
                        {b.otaReference && (
                          <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                            #{b.otaReference}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    {b.serviceType === 'room' ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        <div>In: {b.checkInDate}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Out: {b.checkOutDate}</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{b.checkInDate}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div>Total: ₹{b.financials.total.toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#D97706' }}>Due: ₹{b.financials.balanceDue.toLocaleString()}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      b.status === 'Completed' || b.status === 'Checked-out'
                        ? 'badge-success'
                        : ['Confirmed', 'Checked-in'].includes(b.status)
                        ? 'badge-info'
                        : b.status === 'Cancelled'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      b.paymentStatus === 'Paid'
                        ? 'badge-success'
                        : b.paymentStatus === 'Partially Paid'
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleViewDetails(b)}
                        title="View Details"
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                      >
                        <Eye size={14} color="#475569" />
                      </button>

                      <button
                        onClick={() => {
                          const cleanPhone = b.customerPhone.replace(/\D/g, '');
                          const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                          const balance = Math.max(0, b.financials.total - b.financials.advancePaid);
                          const message = `*SV MAHAL & SV RESIDENCY*\n---------------------------------------\nHello *${b.customerName}*,\n\nThis is a booking confirmation alert regarding booking ID: *${b.id}*.\n\n*Details Summary:*\n- Type: ${b.serviceType === 'mahal' ? 'SV Mahal Hall' : 'Rooms Lodging Stay'}\n- Date: ${b.checkInDate}\n- Total Cost: ₹${b.financials.total.toLocaleString()}\n- Status: ${b.status}\n- Outstanding Balance: ₹${balance.toLocaleString()}\n\nThank you for choosing us!\nPhone / WhatsApp: 95008 21550 / 90437 80215`;
                          const link = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
                          window.open(link, '_blank');
                        }}
                        title="Share on WhatsApp"
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #86EFAC', background: '#ECFDF5', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#D1FAE5'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ECFDF5'}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#25D366">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.464L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.451 5.375 0 9.752-4.37 9.755-9.743.002-2.602-1.005-5.048-2.839-6.883-1.832-1.832-4.274-2.84-6.877-2.841-5.38 0-9.76 4.374-9.764 9.75-.002 1.9.492 3.754 1.433 5.365L1.47 21.847l5.177-1.893zm11.758-5.326c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fillRule="evenodd"/>
                        </svg>
                      </button>
                      
                      {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                        <button
                          onClick={() => handleCancelClick(b.id)}
                          title="Cancel booking"
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                        >
                          <Ban size={14} color="#DC2626" />
                        </button>
                      )}

                      {currentUserRole === 'admin' && (
                        <button
                          onClick={() => handleDeleteClick(b.id)}
                          title="Delete booking record"
                          style={{ padding: '6px', borderRadius: '4px', border: 'none', background: '#DC2626', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '6px 12px',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 12px',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

    </div>
  );
};
