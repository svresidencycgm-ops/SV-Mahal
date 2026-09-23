import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Search, Table, FileText } from 'lucide-react';

export const BillInventoryCrm: React.FC = () => {
  const { bookings } = useApp();
  const [search, setSearch] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState<'all' | 'GST' | 'Normal'>('all');

  // Filter list by search query and type
  const filteredBookings = bookings.filter(b => {
    const term = search.toLowerCase().trim();
    const matchSearch = (
      b.id.toLowerCase().includes(term) ||
      b.customerName.toLowerCase().includes(term) ||
      (b.companyName && b.companyName.toLowerCase().includes(term)) ||
      (b.companyGst && b.companyGst.toLowerCase().includes(term))
    );
    const matchType = billTypeFilter === 'all' || b.billingType === billTypeFilter;
    
    // Only show completed or checked-in bookings (ones with bills)
    // Actually, any booking has a bill.
    return matchSearch && matchType && (b.status === 'Completed' || b.status === 'Checked-in' || b.status === 'Confirmed');
  });

  // Calculate overall aggregates
  const totalBase = filteredBookings.reduce((sum, b) => sum + (b.financials.baseAmount ?? b.financials.total), 0);
  const totalCgst = filteredBookings.reduce((sum, b) => sum + (b.financials.cgst ?? 0), 0);
  const totalSgst = filteredBookings.reduce((sum, b) => sum + (b.financials.sgst ?? 0), 0);
  const totalTax = totalCgst + totalSgst;
  const totalInvoiceVal = filteredBookings.reduce((sum, b) => sum + b.financials.total, 0);

  // Helper: Format invoice number
  const getInvoiceNum = (id: string, type: 'GST' | 'Normal') => 
    type === 'GST' ? `GST-${id.substring(id.indexOf('-') + 1)}` : `STD-${id.substring(id.indexOf('-') + 1)}`;

  // CSV Export Handler
  const handleExportCsv = () => {
    if (filteredBookings.length === 0) {
      alert('No invoice data available to export.');
      return;
    }

    const headers = [
      'Invoice Type',
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
      'Grand Total (INR)'
    ];

    const rows = filteredBookings.map(b => {
      const type = b.billingType || 'Normal';
      const invNum = getInvoiceNum(b.id, type);
      const dateStr = new Date(b.createdAt).toLocaleDateString('en-IN');
      const base = b.financials.baseAmount ?? b.financials.total;
      const cgst = b.financials.cgst ?? 0;
      const sgst = b.financials.sgst ?? 0;
      const totalTaxAmt = cgst + sgst;
      
      return [
        type,
        invNum,
        dateStr,
        b.serviceType === 'room' ? 'Room Stay' : 'Mahal Event',
        `"${b.customerName}"`,
        `"${b.companyName || ''}"`,
        b.companyGst || '',
        base.toFixed(2),
        cgst.toFixed(2),
        sgst.toFixed(2),
        totalTaxAmt.toFixed(2),
        b.financials.total.toFixed(2)
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bill_inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A', margin: 0, fontWeight: 800 }}>Bill Inventory</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Unified ledger for GST and Standard bills. Track all generated invoices and financial compliance data.
          </p>
        </div>
        
        <button
          onClick={handleExportCsv}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            backgroundColor: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '6px',
            fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)'
          }}
        >
          <Download size={16} /> Export Inventory Data (CSV)
        </button>
      </div>

      {/* Aggregate Overview Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', borderLeft: '4px solid #0F2942' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Total Invoices</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>{filteredBookings.length}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Total Taxable Base Value</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>₹{totalBase.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Total GST Tax Generated</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>₹{totalTax.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Total Invoice Value</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>₹{totalInvoiceVal.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
        
        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by ID, Name, Company, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={billTypeFilter}
              onChange={(e) => setBillTypeFilter(e.target.value as 'all' | 'GST' | 'Normal')}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', backgroundColor: '#F8FAFC' }}
            >
              <option value="all">All Bill Types</option>
              <option value="GST">GST Bills (Taxed)</option>
              <option value="Normal">Standard Bills (0% Tax)</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Invoice #</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Type</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Billed To</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Service</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Taxable Base</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>GST (C+S)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Table size={24} color="#94A3B8" />
                      <span>No invoice data found for the current filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const type = b.billingType || 'Normal';
                  const base = b.financials.baseAmount ?? b.financials.total;
                  const tax = (b.financials.cgst ?? 0) + (b.financials.sgst ?? 0);
                  
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background-color 0.2s', cursor: 'pointer' }} className="hover-bg-slate-50">
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F2942' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} color="#64748B" />
                          {getInvoiceNum(b.id, type)}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                          backgroundColor: type === 'GST' ? '#DBEAFE' : '#F1F5F9',
                          color: type === 'GST' ? '#1D4ED8' : '#475569'
                        }}>
                          {type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {new Date(b.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{b.customerName}</div>
                        {b.companyName && (
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                            {b.companyName} {b.companyGst ? `(${b.companyGst})` : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {b.serviceType === 'room' ? 'Room Stay' : 'Mahal Event'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>₹{base.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>₹{tax.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0F172A', textAlign: 'right' }}>
                        ₹{b.financials.total.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
