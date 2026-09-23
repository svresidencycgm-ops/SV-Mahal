import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import type { Expense } from '../types';

export const FinanceCrm: React.FC = () => {
  const { payments, deletePayment, expenses, addExpense, deleteExpense, currentUserRole } = useApp();

  const [activeTab, setActiveTab] = useState<'revenue' | 'expenses'>('revenue');

  // Expense form state
  const [expCategory, setExpCategory] = useState<Expense['category']>('Maintenance');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('');
  const [expMethod, setExpMethod] = useState<Expense['paymentMethod']>('Cash');

  // Financial aggregation totals
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid expense amount greater than 0.');
      return;
    }

    addExpense({
      category: expCategory,
      amount: amountNum,
      date: expDate,
      description: expDesc,
      paymentMethod: expMethod
    });

    // Reset
    setExpAmount('');
    setExpDesc('');
  };

  const handleDeletePayment = (id: string) => {
    if (window.confirm(`Are you sure you want to delete payment log ${id}?`)) {
      deletePayment(id);
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm(`Are you sure you want to delete expense log ${id}?`)) {
      deleteExpense(id);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
            Financial Ledger Manager
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Track client payments received, record operational expenses, and audit cash flow margins.
          </p>
        </div>
      </div>

      {/* 3-WAY FINANCIAL BANNER STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Income Card */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Revenue</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
              ₹{totalRevenue.toLocaleString()}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={20} color="#16A34A" />
          </div>
        </div>

        {/* Expenses Card */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total Expenses</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
              ₹{totalExpenses.toLocaleString()}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowDownRight size={20} color="#DC2626" />
          </div>
        </div>

        {/* Net margins Card */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Net Cash Flow</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: netProfit >= 0 ? '#16A34A' : '#DC2626', marginTop: '4px' }}>
              ₹{netProfit.toLocaleString()}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: netProfit >= 0 ? '#DCFCE7' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} color={netProfit >= 0 ? '#16A34A' : '#DC2626'} />
          </div>
        </div>
      </div>

      {/* TABS SELECTORS */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginTop: '10px' }}>
        <button
          onClick={() => setActiveTab('revenue')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'revenue' ? '3px solid #C9A227' : 'none',
            color: activeTab === 'revenue' ? '#0F172A' : '#64748B',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          Payments Received (Revenue)
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'expenses' ? '3px solid #C9A227' : 'none',
            color: activeTab === 'expenses' ? '#0F172A' : '#64748B',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          Expenses Ledger
        </button>
      </div>

      {/* TAB VIEWPORTS */}
      {activeTab === 'revenue' ? (
        /* REVENUE LEDGER TABLE */
        <div className="table-container shadow-sm">
          {payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
              No payments recorded in database.
            </div>
          ) : (
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference ID</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.id}</td>
                    <td style={{ fontWeight: 700, color: '#C9A227' }}>{p.bookingId}</td>
                    <td>{p.customerName}</td>
                    <td style={{ fontWeight: 700, color: '#16A34A' }}>₹{p.amount.toLocaleString()}</td>
                    <td>{p.method}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B' }}>{p.referenceNumber}</td>
                    <td>{p.date}</td>
                    <td>
                      {currentUserRole === 'admin' ? (
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          title="Delete payment"
                          style={{ padding: '6px', borderRadius: '4px', border: 'none', background: '#DC2626', color: '#FFFFFF', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* EXPENSES LEDGER WITH INPUT FORM */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Add expense form */}
          <form onSubmit={handleAddExpenseSubmit} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '14px', alignSelf: 'flex-start' }}>
            <h3 style={{ fontSize: '1rem', color: '#0F172A', fontWeight: 700, marginBottom: '6px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              Record New Expense
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>CATEGORY</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFFFFF' }}
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Salary">Salary</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Decoration">Decoration</option>
                  <option value="Catering">Catering</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>AMOUNT (₹)</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="Expense total"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>DATE</label>
                <input
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>PAY METHOD</label>
                <select
                  value={expMethod}
                  onChange={(e) => setExpMethod(e.target.value as any)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#FFFFFF' }}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>DESCRIPTION</label>
              <textarea
                required
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                placeholder="What was this expense for?"
                rows={2}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
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
              Add Expense Ledger Entry
            </button>
          </form>

          {/* Expenses Table */}
          <div className="table-container shadow-sm" style={{ flexGrow: 1 }}>
            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                No expenses logged yet.
              </div>
            ) : (
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Recorded By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 700, color: '#334155' }}>{e.category}</td>
                      <td style={{ fontSize: '0.8rem', color: '#64748B' }}>{e.description}</td>
                      <td>{e.date}</td>
                      <td style={{ fontWeight: 700, color: '#DC2626' }}>₹{e.amount.toLocaleString()}</td>
                      <td style={{ fontSize: '0.75rem', color: '#64748B' }}>{e.recordedBy}</td>
                      <td>
                        {currentUserRole === 'admin' ? (
                          <button
                            onClick={() => handleDeleteExpense(e.id)}
                            title="Delete expense"
                            style={{ padding: '6px', borderRadius: '4px', border: 'none', background: '#DC2626', color: '#FFFFFF', cursor: 'pointer' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
