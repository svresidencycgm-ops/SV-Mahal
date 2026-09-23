import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, User, Plus, Phone, Mail, MapPin, ClipboardList, X } from 'lucide-react';
import type { Customer } from '../types';

export const CustomersCrm: React.FC = () => {
  const { customers, addCustomer, getCustomerMetrics, setSelectedBooking } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  
  // Drawer states
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add customer form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Filter list
  const filteredCustomers = customers.filter(c => {
    const query = search.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert('Please fill in required fields (Name, Phone, Email).');
      return;
    }

    addCustomer({
      name,
      phone,
      email,
      address,
      notes
    });

    // Reset
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setIsAddOpen(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: selectedCust ? '1.1fr 0.9fr' : '1fr', gap: '24px', transition: 'all 0.3s' }}>
      
      {/* LEFT COLUMN: CUSTOMERS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#0F172A', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
              Customers Database CRM
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
              Maintain verified customer stay logs, contact listings, and profile history records.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
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
            <Plus size={14} /> Add Customer
          </button>
        </div>

        {/* Search filter */}
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 14px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}>
          <Search size={16} color="#94A3B8" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search database by client name, mobile, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
          />
        </div>

        {/* Customer Table */}
        <div className="table-container shadow-sm">
          {filteredCustomers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', fontSize: '0.9rem' }}>
              No customer records found.
            </div>
          ) : (
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact Info</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(c => {
                  const metrics = getCustomerMetrics(c.phone);
                  return (
                    <tr
                      key={c.id}
                      style={{
                        backgroundColor: selectedCust?.id === c.id ? '#F8FAFC' : '#FFFFFF',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedCust(c)}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: {c.id}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{c.phone}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{c.email}</div>
                        <div style={{ fontSize: '0.7rem', color: '#C9A227', fontWeight: 600 }}>
                          {metrics.totalBookings} stays • ₹{metrics.totalSpent.toLocaleString()} spent
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {c.address.substring(0, 30)}{c.address.length > 30 ? '...' : ''}
                      </td>
                      <td>
                        <button
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: ACTIVE PROFILE DRAWER PANEL */}
      {selectedCust && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: 'var(--shadow-md)',
            alignSelf: 'flex-start',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'sticky',
            top: '84px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0F172A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#C9A227" /> Client Profile
            </h3>
            <button
              onClick={() => setSelectedCust(null)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Details header */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', color: '#0F172A', fontWeight: 800 }}>{selectedCust.name}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <Phone size={14} color="#64748B" /> {selectedCust.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <Mail size={14} color="#64748B" /> {selectedCust.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <MapPin size={14} color="#64748B" /> {selectedCust.address}
              </div>
            </div>
            {selectedCust.notes && (
              <div style={{ marginTop: '12px', fontSize: '0.8rem', padding: '8px 10px', backgroundColor: '#F8FAFC', borderLeft: '3px solid #CBD5E1', borderRadius: '4px', fontStyle: 'italic', color: '#64748B' }}>
                Note: {selectedCust.notes}
              </div>
            )}
          </div>

          {/* Calculated Metrics */}
          {(() => {
            const m = getCustomerMetrics(selectedCust.phone);
            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>TOTAL BOOKINGS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>{m.totalBookings}</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>LAST STAY DATE</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{m.lastBookingDate}</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>TOTAL REVENUE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A34A' }}>₹{m.totalSpent.toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>OUTSTANDING</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: m.outstandingAmount > 0 ? '#DC2626' : '#16A34A' }}>
                      ₹{m.outstandingAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* History Lists */}
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <ClipboardList size={14} color="#C9A227" /> Booking History Log
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {m.bookings.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>No reservations logged.</div>
                    ) : (
                      m.bookings.map(b => (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBooking(b)}
                          style={{
                            padding: '8px 10px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: '#334155' }}>{b.id}</span>
                            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                              {b.serviceType === 'room' ? 'Room Suite' : b.eventDetails?.eventType} | {b.checkInDate}
                            </div>
                          </div>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{b.financials.total.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ADD CUSTOMER MODAL DRAWER OVERLAY */}
      {isAddOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-fade-in" style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '24px', maxWidth: '440px', width: '100%', position: 'relative' }}>
            <button onClick={() => setIsAddOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.2rem', color: '#0F172A', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-sans)' }}>
              Add New Customer Profile
            </h3>

            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>CLIENT NAME *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>MOBILE NUMBER *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  placeholder="10-digit number"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>EMAIL ADDRESS *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@domain.com"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>CONTACT ADDRESS</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street details, City"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>NOTES</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '10px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                Create Customer Profile
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
