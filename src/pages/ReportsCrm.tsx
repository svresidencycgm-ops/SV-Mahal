import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Download, Clipboard, DollarSign, Bed } from 'lucide-react';

export const ReportsCrm: React.FC = () => {
  const { bookings, payments, expenses, rooms, currentUserRole, addExpense } = useApp();

  // Expense form state
  const [expCategory, setExpCategory] = React.useState('Maintenance');
  const [expAmount, setExpAmount] = React.useState('');
  const [expDate, setExpDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = React.useState('');
  const [expMethod, setExpMethod] = React.useState('Cash');

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid expense amount greater than 0.');
      return;
    }

    addExpense({
      category: expCategory as any,
      amount: amountNum,
      date: expDate,
      description: expDesc,
      paymentMethod: expMethod as any
    });

    setExpAmount('');
    setExpDesc('');
    alert('Expense recorded successfully!');
  };

  // Aggregate stats
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBookings = bookings.length;
  
  // Dynamic Occupancy
  const totalRooms = rooms.length;
  const occupiedCount = rooms.filter(r => r.status === 'Occupied').length;
  const roomOccupancyPct = totalRooms > 0 ? ((occupiedCount / totalRooms) * 100).toFixed(0) : '0';

  // Export functions (Generate CSV downloads natively)
  const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers row
    csvContent += headers.join(',') + '\n';
    
    // Add data rows (sanitize values to escape commas)
    rows.forEach(row => {
      const escapedRow = row.map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      });
      csvContent += escapedRow.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportBookings = () => {
    const headers = ['Booking ID', 'Customer Name', 'Phone', 'Service Type', 'Setup', 'Check-in/Event Date', 'Check-out Date', 'Total Value', 'Amount Paid', 'Balance Due', 'Status'];
    const rows = bookings.map(b => [
      b.id,
      b.customerName,
      b.customerPhone,
      b.serviceType,
      b.serviceType === 'room' ? `${b.roomCount} Rooms` : `${b.packageName} Package`,
      b.checkInDate,
      b.serviceType === 'room' ? b.checkOutDate : 'N/A',
      b.financials.total.toString(),
      b.financials.advancePaid.toString(),
      b.financials.balanceDue.toString(),
      b.status
    ]);
    downloadCsv('Booking_Report', headers, rows);
  };

  const handleExportPayments = () => {
    const headers = ['Payment ID', 'Booking ID', 'Customer Name', 'Amount', 'Payment Method', 'Reference Number', 'Date'];
    const rows = payments.map(p => [
      p.id,
      p.bookingId,
      p.customerName,
      p.amount.toString(),
      p.method,
      p.referenceNumber,
      p.date
    ]);
    downloadCsv('Revenue_Ledger_Report', headers, rows);
  };

  const handleExportExpenses = () => {
    const headers = ['Expense ID', 'Category', 'Description', 'Amount', 'Payment Method', 'Date', 'Recorded By'];
    const rows = expenses.map(e => [
      e.id,
      e.category,
      e.description,
      e.amount.toString(),
      e.paymentMethod,
      e.date,
      e.recordedBy
    ]);
    downloadCsv('Expense_Ledger_Report', headers, rows);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
            Management Reports Center
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Compile ledger statements, evaluate room occupancy, and download operational CSV sheets.
          </p>
        </div>
      </div>

      {/* RENDER ANALYTIC SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Bookings performance */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clipboard size={18} color="#2563EB" />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>RESERVATION VOLUME</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{totalBookings} Total Bookings</div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
            Includes {bookings.filter(b => b.serviceType === 'room').length} Room Stay bookings and {bookings.filter(b => b.serviceType === 'mahal').length} Mahal Banquet events.
          </p>
        </div>

        {/* Financial performance */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#16A34A" />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>FINANCIAL HEALTH</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16A34A' }}>₹{totalRevenue.toLocaleString()} Net Cash</div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
            Aggregated gross revenue is ₹{totalRevenue.toLocaleString()} against operational expenses of ₹{totalExpenses.toLocaleString()}.
          </p>
        </div>

        {/* Occupancy stats */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bed size={18} color="#D97706" />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>SUITE OCCUPANCY</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706' }}>{roomOccupancyPct}% Occupied</div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
            Currently {occupiedCount} rooms out of {totalRooms} total rooms are occupied. {rooms.filter(r => r.status === 'Maintenance').length} rooms in maintenance.
          </p>
        </div>
      </div>

      {currentUserRole === 'manager' ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-sans)', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', marginBottom: '20px' }}>
            Record Operational Expense
          </h3>
          <form onSubmit={handleAddExpenseSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Category</label>
              <select value={expCategory} onChange={e => setExpCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}>
                <option value="Electricity">Electricity</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Salaries">Salaries</option>
                <option value="Supplies">Supplies</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Amount (₹)</label>
              <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Payment Method</label>
              <select value={expMethod} onChange={e => setExpMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }}>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Description</label>
              <input type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="E.g. Plumber fix" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #CBD5E1', outline: 'none' }} required />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>
                Record Expense
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-sans)', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#C9A227" /> Export Reports Database
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Booking CSV */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: '#0F172A', fontWeight: 700 }}>Booking Reservations Report</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4, flexGrow: 1 }}>
                Export complete booking histories, stay date parameters, payment statuses, and guest count records.
              </p>
              <button
                onClick={handleExportBookings}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Download size={14} /> Export Bookings CSV
              </button>
            </div>

            {/* Revenue CSV */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: '#0F172A', fontWeight: 700 }}>Payments Ledger Statement</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4, flexGrow: 1 }}>
                Export detailed transaction records, payment methods (UPI/Cash/Card), and reference verification logs.
              </p>
              <button
                onClick={handleExportPayments}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Download size={14} /> Export Payments CSV
              </button>
            </div>

            {/* Expense CSV */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: '#0F172A', fontWeight: 700 }}>Expense Audit Ledger</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4, flexGrow: 1 }}>
                Export detailed operational expenditure audits categorized by electricity, maintenance, cleaning, salaries, etc.
              </p>
              <button
                onClick={handleExportExpenses}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Download size={14} /> Export Expenses CSV
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
