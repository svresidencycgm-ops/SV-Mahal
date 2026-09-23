import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, ArrowDownRight, ArrowUpRight, FileText, Search, Filter } from 'lucide-react';

interface UnifiedTransaction {
  id: string;
  date: string;
  type: 'STAY BOOKING' | 'PAYMENT RECEIVED' | 'OPERATIONAL EXPENSE';
  description: string;
  customerName: string;
  amount: number;
  methodOrBilling: string;
  flowType: 'INFLOW' | 'OUTFLOW' | 'VALUE LOG';
}

export const ConsolidatedLedgerCrm: React.FC = () => {
  const { bookings, payments, expenses } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INFLOW' | 'OUTFLOW' | 'VALUE LOG'>('ALL');

  // Compile unified transactions list
  const list: UnifiedTransaction[] = [];

  // 1. Add Bookings (value logs)
  bookings.forEach(b => {
    list.push({
      id: b.id,
      date: b.createdAt.split('T')[0] || b.checkInDate,
      type: 'STAY BOOKING',
      description: `${b.serviceType.toUpperCase()} STAY - ROOMS assigned: ${b.roomIds?.map(id => id.replace('room-', '').toUpperCase()).join(', ') || 'MAHAL BANQUET'}`,
      customerName: b.customerName,
      amount: b.financials.total,
      methodOrBilling: b.billingType || 'GST',
      flowType: 'VALUE LOG'
    });
  });

  // 2. Add Payments received (actual cash inflows)
  payments.forEach(p => {
    list.push({
      id: p.id,
      date: p.date,
      type: 'PAYMENT RECEIVED',
      description: `PAYMENT LOG FOR BOOKING ${p.bookingId} - ${p.notes || 'SETTLEMENT'}`,
      customerName: p.customerName,
      amount: p.amount,
      methodOrBilling: p.method,
      flowType: 'INFLOW'
    });
  });

  // 3. Add Expenses (actual cash outflows)
  expenses.forEach(e => {
    list.push({
      id: e.id,
      date: e.date,
      type: 'OPERATIONAL EXPENSE',
      description: `OUTFLOW CATEGORY: ${e.category.toUpperCase()} - MEMO: ${e.description}`,
      customerName: 'SV MAHAL & RESIDENCY',
      amount: e.amount,
      methodOrBilling: e.paymentMethod,
      flowType: 'OUTFLOW'
    });
  });

  // Sort chronologically (newest first)
  const sortedList = list.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  // Filter
  const filteredList = sortedList.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(search.toLowerCase().trim()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase().trim()) ||
      t.description.toLowerCase().includes(search.toLowerCase().trim());
      
    const matchesFilter = filterType === 'ALL' ? true : t.flowType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Aggregations
  const totalInflows = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutflows = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netInHand = totalInflows - totalOutflows;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-sans)' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#0F2942', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Consolidated Financial Ledger
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Centralized financial database logging stay value contracts, payment receipts, and operational outflows.
          </p>
        </div>
      </div>

      {/* 3-WAY FINANCIAL STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Cash Inflow (Payments)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
              ₹{totalInflows.toLocaleString()}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={20} color="#16A34A" />
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Cash Outflow (Expenses)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
              ₹{totalOutflows.toLocaleString()}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowDownRight size={20} color="#DC2626" />
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Net Cash Balance</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: netInHand >= 0 ? '#16A34A' : '#DC2626', marginTop: '4px' }}>
              ₹{netInHand.toLocaleString()}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: netInHand >= 0 ? '#DCFCE7' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={20} color={netInHand >= 0 ? '#16A34A' : '#DC2626'} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH DESK */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'All Entries' },
            { id: 'INFLOW', label: 'Payments (Inflow)' },
            { id: 'OUTFLOW', label: 'Expenses (Outflow)' },
            { id: 'VALUE LOG', label: 'Bookings (Value)' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id as any)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filterType === btn.id ? '#0F2942' : '#F1F5F9',
                color: filterType === btn.id ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 12px', width: '300px' }}>
          <Search size={16} color="#94A3B8" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search memo, ID or guest..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', width: '100%', outline: 'none', fontSize: '0.85rem', backgroundColor: 'transparent' }}
          />
        </div>
      </div>

      {/* DATABASE GRID TABLE */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <tr style={{ color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Transaction ID</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Particulars / Description</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Entity / Client</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Ref / Billing</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                  No transaction records found matching active filters.
                </td>
              </tr>
            ) : (
              filteredList.map((t, idx) => {
                let badgeBg = '#F1F5F9';
                let badgeText = '#475569';
                let amountColor = '#1E293B';
                let prefixSymbol = '';

                if (t.flowType === 'INFLOW') {
                  badgeBg = '#DCFCE7';
                  badgeText = '#16A34A';
                  amountColor = '#16A34A';
                  prefixSymbol = '+ ';
                } else if (t.flowType === 'OUTFLOW') {
                  badgeBg = '#FEE2E2';
                  badgeText = '#DC2626';
                  amountColor = '#DC2626';
                  prefixSymbol = '- ';
                } else if (t.flowType === 'VALUE LOG') {
                  badgeBg = '#E0F2FE';
                  badgeText = '#0284C7';
                  amountColor = '#0F2942';
                  prefixSymbol = '✦ ';
                }

                return (
                  <tr key={`${t.id}-${idx}`} style={{ borderBottom: '1px solid #F1F5F9', color: '#334155' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{t.id}</td>
                    <td style={{ padding: '12px 16px' }}>{t.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: badgeBg, color: badgeText }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.description}>
                      {t.description}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{t.customerName}</td>
                    <td style={{ padding: '12px 16px' }}>{t.methodOrBilling}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: amountColor, fontSize: '0.9rem' }}>
                      {prefixSymbol}₹{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
