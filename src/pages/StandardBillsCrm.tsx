import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Search, Table } from 'lucide-react';

export const StandardBillsCrm: React.FC = () => {
  const { bookings } = useApp();
  const [search, setSearch] = useState('');

  // Filter for Normal (Standard) invoices
  const stdBookings = bookings.filter(b => b.billingType === 'Normal');

  // Filter list by search query
  const filteredStdBookings = stdBookings.filter(b => {
    const term = search.toLowerCase().trim();
    return (
      b.id.toLowerCase().includes(term) ||
      b.customerName.toLowerCase().includes(term)
    );
  });

  // Calculate overall aggregates
  const totalInvoiceVal = filteredStdBookings.reduce((sum, b) => sum + b.financials.total, 0);

  // Helper: Format invoice number
  const getInvoiceNum = (id: string) => `STD-${id.substring(id.indexOf('-') + 1)}`;

  // CSV Export Handler
  const handleExportCsv = () => {
    if (filteredStdBookings.length === 0) {
      alert('No Standard invoice data available to export.');
      return;
    }

    const headers = [
      'Invoice Number',
      'Invoice Date',
      'Service Type',
      'Customer Name',
      'Discount (INR)',
      'Grand Total (INR)',
      'Check-in Stay Time',
      'Check-out Stay Time'
    ];

    const rows = filteredStdBookings.map(b => {
      const invNum = getInvoiceNum(b.id);
      const dateStr = new Date(b.createdAt).toLocaleDateString('en-IN');
      const discount = b.financials.discount ?? 0;
      const chkIn = b.actualCheckInTime || b.checkInDate;
      const chkOut = b.actualCheckOutTime || b.checkOutDate;

      return [
        invNum,
        dateStr,
        b.serviceType.toUpperCase(),
        b.customerName,
        discount.toString(),
        b.financials.total.toString(),
        chkIn,
        chkOut
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create file blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Standard_Sales_Sheet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-sans)' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#0F2942', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Standard Sales Billing
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            View and export non-tax standard invoices and service billings.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0F2942',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(15, 41, 66, 0.2)'
          }}
        >
          <Download size={16} /> Export Sales Sheet (CSV)
        </button>
      </div>

      {/* Aggregates Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Grand Invoice Total</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>₹{totalInvoiceVal.toLocaleString()}</div>
        </div>
      </div>

      {/* Search Filter bar */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '14px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
          <Table size={16} color="#64748B" />
          <span>Active Filter Count: {filteredStdBookings.length} Invoices</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 12px', width: '300px' }}>
          <Search size={16} color="#94A3B8" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search invoice or guest..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', width: '100%', outline: 'none', fontSize: '0.85rem', backgroundColor: 'transparent' }}
          />
        </div>
      </div>

      {/* DATA GRID TABLE */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <tr style={{ color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Invoice No</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Service</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Client</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Discount</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Invoice Total</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Check-in/out Stay</th>
            </tr>
          </thead>
          <tbody>
            {filteredStdBookings.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                  No standard bookings found matching search criteria.
                </td>
              </tr>
            ) : (
              filteredStdBookings.map(b => {
                const invNum = getInvoiceNum(b.id);
                const dateStr = new Date(b.createdAt).toLocaleDateString('en-IN');
                const discount = b.financials.discount ?? 0;
                const chkIn = b.actualCheckInTime || b.checkInDate;
                const chkOut = b.actualCheckOutTime || b.checkOutDate;

                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9', color: '#334155' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#C9A227' }}>{invNum}</td>
                    <td style={{ padding: '12px 16px' }}>{dateStr}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, backgroundColor: b.serviceType === 'room' ? '#E0F2FE' : '#F3E8FF', color: b.serviceType === 'room' ? '#0284C7' : '#A855F7' }}>
                        {b.serviceType.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748B' }}>
                      ₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#16A34A' }}>
                      ₹{b.financials.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#475569' }}>
                      <div>In: {chkIn}</div>
                      <div>Out: {chkOut}</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
