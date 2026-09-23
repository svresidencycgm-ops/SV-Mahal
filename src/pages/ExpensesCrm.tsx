import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, ArrowDownRight, Plus, Calendar, DollarSign, Tag, Landmark } from 'lucide-react';
import type { Expense } from '../types';

export const ExpensesCrm: React.FC = () => {
  const { expenses, addExpense, deleteExpense, currentUserRole, addToast } = useApp();

  // Expense form state
  const [expCategory, setExpCategory] = useState<Expense['category']>('Maintenance');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('');
  const [expMethod, setExpMethod] = useState<Expense['paymentMethod']>('Cash');

  // Total Expenses calculation
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

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
      description: expDesc.toUpperCase(), // also uppercase the description!
      paymentMethod: expMethod
    });

    addToast('Expense Logged', `Recorded ₹${amountNum.toLocaleString()} for ${expCategory}.`, 'success');

    // Reset
    setExpAmount('');
    setExpDesc('');
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm(`Are you sure you want to delete expense record ${id}?`)) {
      deleteExpense(id);
      addToast('Expense Deleted', 'Expense record was removed.', 'danger');
    }
  };

  // Get color badges for categories
  const getCategoryColor = (cat: Expense['category']) => {
    switch (cat) {
      case 'Maintenance': return { bg: '#FEE2E2', text: '#EF4444' };
      case 'Electricity': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Salary': return { bg: '#E0F2FE', text: '#0284C7' };
      case 'Cleaning': return { bg: '#DCFCE7', text: '#16A34A' };
      case 'Decoration': return { bg: '#F3E8FF', text: '#A855F7' };
      case 'Catering': return { bg: '#FCE7F3', text: '#DB2777' };
      case 'Supplies': return { bg: '#E2E8F0', text: '#475569' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-sans)' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#0F2942', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Expenses Manager Desk
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Record operational overhead costs, maintenance bills, salaries, and utility outflows.
          </p>
        </div>

        {/* Expenses KPI Widget */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '12px 24px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Total Outflow</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DC2626' }}>₹{totalExpenses.toLocaleString()}</span>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifycontent: 'center' }}>
            <ArrowDownRight size={18} color="#DC2626" style={{ margin: 'auto' }} />
          </div>
        </div>
      </div>

      {/* TWO PANEL CONTENT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Form */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#0F2942', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Record Outflow Log
          </h3>

          <form onSubmit={handleAddExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                OUTFLOW CATEGORY *
              </label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value as any)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', backgroundColor: '#FFFFFF' }}
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Electricity">Electricity / Utility</option>
                <option value="Salary">Salary Payment</option>
                <option value="Cleaning">Housekeeping & Cleaning</option>
                <option value="Decoration">floral / Stage Decor</option>
                <option value="Catering">Event Catering</option>
                <option value="Supplies">Daily Supplies & Goods</option>
                <option value="Other">Other Expenses</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                EXPENSE AMOUNT (INR) *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 12px' }}>
                <span style={{ color: '#94A3B8', fontWeight: 700, marginRight: '6px' }}>₹</span>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5200"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  style={{ border: 'none', width: '100%', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                TRANSACTION DATE *
              </label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', backgroundColor: '#FFFFFF' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                SETTLEMENT METHOD *
              </label>
              <select
                value={expMethod}
                onChange={(e) => setExpMethod(e.target.value as any)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', backgroundColor: '#FFFFFF' }}
              >
                <option value="Cash">Cash Account</option>
                <option value="UPI">UPI Transaction</option>
                <option value="Card">Business Credit Card</option>
                <option value="Bank Transfer">Bank NEFT/IMPS</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                MEMO / DESCRIPTION *
              </label>
              <textarea
                required
                placeholder="DETAILS IN CAPS ONLY (E.G. ROOM 105 AC COMPRESSOR REPAIR)"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value.toUpperCase())}
                rows={3}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Log Expense Outflow
            </button>
          </form>
        </div>

        {/* Right Side: Ledger list */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <h3 style={{ margin: 0, padding: '20px', fontSize: '1rem', color: '#0F2942', fontWeight: 800, borderBottom: '1px solid #F1F5F9' }}>
            Operational Expense Outflow Ledger
          </h3>

          <div style={{ maxHeight: '550px', overflowY: 'auto' }}>
            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                No expenses logged in database.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Details / Memo</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Method</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...expenses].sort((a,b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).map(e => {
                    const badge = getCategoryColor(e.category);
                    return (
                      <tr key={e.id} style={{ borderBottom: '1px solid #F1F5F9', color: '#334155' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                          <div>{e.description}</div>
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>ID: {e.id}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: badge.bg, color: badge.text }}>
                            {e.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{e.paymentMethod}</td>
                        <td style={{ padding: '12px 16px' }}>{e.date}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#DC2626' }}>
                          ₹{e.amount.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {currentUserRole === 'admin' ? (
                            <button
                              onClick={() => handleDeleteExpense(e.id)}
                              title="Delete record"
                              style={{ padding: '4px 6px', borderRadius: '4px', border: 'none', backgroundColor: 'transparent', color: '#DC2626', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>Locked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
