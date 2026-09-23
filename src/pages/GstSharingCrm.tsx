import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Search, Table } from 'lucide-react';

export const GstSharingCrm: React.FC = () => {
  const { bookings } = useApp();
  const [search, setSearch] = useState('');

  // Filter for GST invoices
  const gstBookings = bookings.filter(b => b.billingType === 'GST');

  // Filter list by search query
  const filteredGstBookings = gstBookings.filter(b => {
    const term = search.toLowerCase().trim();
    return (
      b.id.toLowerCase().includes(term) ||
      b.customerName.toLowerCase().includes(term) ||
      (b.companyName && b.companyName.toLowerCase().includes(term)) ||
      (b.companyGst && b.companyGst.toLowerCase().includes(term))
    );
  });

  // Calculate overall aggregates
  const totalBase = filteredGstBookings.reduce((sum, b) => sum + (b.financials.baseAmount ?? b.financials.total), 0);
  const totalCgst = filteredGstBookings.reduce((sum, b) => sum + (b.financials.cgst ?? 0), 0);
  const totalSgst = filteredGstBookings.reduce((sum, b) => sum + (b.financials.sgst ?? 0), 0);
  const totalTax = totalCgst + totalSgst;
  const totalInvoiceVal = filteredGstBookings.reduce((sum, b) => sum + b.financials.total, 0);

  // Helper: Format invoice number
  const getInvoiceNum = (id: string) => `GST-${id.substring(id.indexOf('-') + 1)}`;

  // CSV Export Handler
  const handleExportCsv = () => {
    if (filteredGstBookings.length === 0) {
      alert('No GST invoice data available to export.');
      return;
    }

    const headers = [
      'Invoice Number',
      'Invoice Date',
      'Service Type',
      'Customer Name',
      'Company Name',
      'GSTIN',
      'Taxable Base Value (INR)',
      'CGST (INR)',
      'SGST (INR)',
      'Total GST Tax (INR)',
      'Round Off Offset (INR)',
      'Grand Total (INR)',
      'Check-in Stay Time',
      'Check-out Stay Time'
    ];

    const rows = filteredGstBookings.map(b => {
      const invNum = getInvoiceNum(b.id);
      const dateStr = new Date(b.createdAt).toLocaleDateString('en-IN');
      const base = b.financials.baseAmount ?? b.financials.total;
      const cgst = b.financials.cgst ?? 0;
      const sgst = b.financials.sgst ?? 0;
      const taxTotal = cgst + sgst;
      const roundOff = b.financials.roundOff ?? 0;
      const chkIn = b.actualCheckInTime || b.checkInDate;
      const chkOut = b.actualCheckOutTime || b.checkOutDate;

      return [
        invNum,
        dateStr,
        b.serviceType.toUpperCase(),
        b.customerName,
        b.companyName || 'N/A',
        b.companyGst || 'N/A',
        base.toString(),
        cgst.toString(),
        sgst.toString(),
        taxTotal.toString(),
        roundOff.toString(),
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
    link.setAttribute('download', `GST_CA_Claim_Sheet_${new Date().toISOString().split('T')[0]}.csv`);
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
            GST Sharing & CA filings
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Audit tax invoices and export GSTR-1 sheets for tax accountants and claims.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#16A34A',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)'
          }}
        >
          <Download size={16} /> Export CA Sheet (CSV)
        </button>
      </div>

      {/* Aggregates Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Taxable Base Total</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F2942', marginTop: '4px' }}>₹{totalBase.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>CGST Collected</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F2942', marginTop: '4px' }}>₹{totalCgst.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>SGST Collected</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F2942', marginTop: '4px' }}>₹{totalSgst.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Tax Value</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284C7', marginTop: '4px' }}>₹{totalTax.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Grand Invoice Total</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>₹{totalInvoiceVal.toLocaleString()}</div>
        </div>
      </div>

      {/* Search Filter bar */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '14px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
          <Table size={16} color="#64748B" />
          <span>Active Filter Count: {filteredGstBookings.length} Invoices</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 12px', width: '300px' }}>
          <Search size={16} color="#94A3B8" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search company, GSTIN or guest..."
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
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Client / Company</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>GSTIN</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Base Amount</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>CGST</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>SGST</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Round Off</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Invoice Total</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Check-in/out Stay</th>
            </tr>
          </thead>
          <tbody>
            {filteredGstBookings.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                  No GST bookings found matching search criteria.
                </td>
              </tr>
            ) : (
              filteredGstBookings.map(b => {
                const invNum = getInvoiceNum(b.id);
                const dateStr = new Date(b.createdAt).toLocaleDateString('en-IN');
                const base = b.financials.baseAmount ?? b.financials.total;
                const cgst = b.financials.cgst ?? 0;
                const sgst = b.financials.sgst ?? 0;
                const roundOff = b.financials.roundOff ?? 0;
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
                      {b.companyName && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{b.companyName}</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>
                      {b.companyGst || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                      ₹{base.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748B' }}>
                      ₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748B' }}>
                      ₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#94A3B8' }}>
                      {roundOff !== 0 ? `₹${roundOff.toFixed(2)}` : '₹0.00'}
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
