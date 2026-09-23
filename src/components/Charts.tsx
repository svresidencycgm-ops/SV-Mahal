import React, { useState } from 'react';

// ----------------------------------------------------
// 1. REVENUE TREND CHART (Income vs Expenses Area/Line)
// ----------------------------------------------------
interface RevenueData {
  month: string;
  income: number;
  expenses: number;
}

export const RevenueTrendChart: React.FC = () => {
  const data: RevenueData[] = [
    { month: 'Mar', income: 320000, expenses: 110000 },
    { month: 'Apr', income: 450000, expenses: 140000 },
    { month: 'May', income: 610000, expenses: 200000 },
    { month: 'Jun', income: 380000, expenses: 120000 },
    { month: 'Jul', income: 540000, expenses: 190000 },
    { month: 'Aug', income: 720000, expenses: 210000 }
  ];

  const width = 500;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = 800000; // Hard limit for Y axis scaling

  // Calculate coordinates
  const getX = (index: number) => paddingLeft + (index / (data.length - 1)) * chartWidth;
  const getY = (value: number) => paddingTop + chartHeight - (value / maxVal) * chartHeight;

  // Generate paths
  const incomePoints = data.map((d, i) => `${getX(i)},${getY(d.income)}`).join(' ');
  const expensePoints = data.map((d, i) => `${getX(i)},${getY(d.expenses)}`).join(' ');

  const incomeArea = `${getX(0)},${paddingTop + chartHeight} ${incomePoints} ${getX(data.length - 1)},${paddingTop + chartHeight}`;
  const expenseArea = `${getX(0)},${paddingTop + chartHeight} ${expensePoints} ${getX(data.length - 1)},${paddingTop + chartHeight}`;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16A34A" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid lines */}
        {[0, 200000, 400000, 600000, 800000].map((val, i) => {
          const y = getY(val);
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#E2E8F0" strokeDasharray="3,3" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#64748B">
                ₹{(val / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        {/* Areas */}
        <polygon points={incomeArea} fill="url(#incomeGrad)" />
        <polygon points={expenseArea} fill="url(#expenseGrad)" />

        {/* Lines */}
        <polyline points={incomePoints} fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
        <polyline points={expensePoints} fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />

        {/* X Axis Labels */}
        {data.map((d, i) => {
          const x = getX(i);
          return (
            <text key={i} x={x} y={height - 15} textAnchor="middle" fontSize="11" fill="#64748B" fontWeight="500">
              {d.month}
            </text>
          );
        })}

        {/* Data points and hover zones */}
        {data.map((d, i) => {
          const x = getX(i);
          const yInc = getY(d.income);
          const yExp = getY(d.expenses);

          return (
            <g key={i}>
              {/* Highlight line on hover */}
              {hoverIdx === i && (
                <line x1={x} y1={paddingTop} x2={x} y2={paddingTop + chartHeight} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2,2" />
              )}
              
              {/* Income Circle */}
              <circle cx={x} cy={yInc} r={hoverIdx === i ? 6 : 4} fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
              {/* Expense Circle */}
              <circle cx={x} cy={yExp} r={hoverIdx === i ? 6 : 4} fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />

              {/* Hover activation bar */}
              <rect
                x={x - 20}
                y={paddingTop}
                width="40"
                height={chartHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoverIdx !== null && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: `${(hoverIdx / (data.length - 1)) * 60 + 20}%`,
            transform: 'translateX(-50%)',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <div style={{ fontWeight: 600, borderBottom: '1px solid #334155', paddingBottom: '2px', marginBottom: '4px' }}>
            {data[hoverIdx].month} 2026
          </div>
          <div>Income: <span style={{ color: '#4ADE80', fontWeight: 600 }}>₹{data[hoverIdx].income.toLocaleString()}</span></div>
          <div>Expense: <span style={{ color: '#F87171', fontWeight: 600 }}>₹{data[hoverIdx].expenses.toLocaleString()}</span></div>
        </div>
      )}
    </div>
  );
};


// ----------------------------------------------------
// 2. ROOM OCCUPANCY CHART (Bar Chart: Booked vs Total)
// ----------------------------------------------------
export const RoomOccupancyChart: React.FC = () => {
  const data = [
    { type: 'Standard', booked: 2, total: 3 },
    { type: 'Deluxe', booked: 2, total: 3 },
    { type: 'Premium', booked: 1, total: 2 },
    { type: 'Family', booked: 1, total: 2 }
  ];

  const width = 500;
  const height = 240;
  const paddingLeft = 80;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const barWidth = 40;
  const groupSpacing = chartWidth / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* Grid Lines */}
      {[0, 25, 50, 75, 100].map((pct, i) => {
        const y = paddingTop + (chartHeight * (100 - pct)) / 100;
        return (
          <g key={i}>
            <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#E2E8F0" strokeDasharray="3,3" />
            <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#64748B">
              {pct}%
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x = paddingLeft + i * groupSpacing + (groupSpacing - barWidth) / 2;
        const occupancyPct = (d.booked / d.total) * 100;
        
        // Total Height Bar (Grey)
        const yTotal = paddingTop;
        const hTotal = chartHeight;

        // Occupancy Height Bar (Midnight Blue / Accent Gold)
        const hOccupied = (chartHeight * occupancyPct) / 100;
        const yOccupied = paddingTop + chartHeight - hOccupied;

        return (
          <g key={i}>
            {/* Total Capacity outline */}
            <rect
              x={x}
              y={yTotal}
              width={barWidth}
              height={hTotal}
              fill="#F1F5F9"
              rx="4"
            />
            {/* Occupied Bar */}
            <rect
              x={x}
              y={yOccupied}
              width={barWidth}
              height={hOccupied}
              fill="url(#goldGradient)"
              rx="4"
            />
            
            {/* Label below bar */}
            <text x={x + barWidth / 2} y={height - 15} textAnchor="middle" fontSize="11" fill="#64748B" fontWeight="600">
              {d.type}
            </text>

            {/* Occupancy stats inside/above bar */}
            <text x={x + barWidth / 2} y={yOccupied - 6} textAnchor="middle" fontSize="10" fill="#0F172A" fontWeight="700">
              {d.booked}/{d.total}
            </text>
          </g>
        );
      })}

      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DFB943" />
          <stop offset="100%" stopColor="#C9A227" />
        </linearGradient>
      </defs>
    </svg>
  );
};


// ----------------------------------------------------
// 3. MAHAL BOOKINGS CHART (Donut Event Share)
// ----------------------------------------------------
export const MahalBookingsChart: React.FC = () => {
  const data = [
    { label: 'Wedding', value: 5, color: '#0F172A' },
    { label: 'Reception', value: 4, color: '#C9A227' },
    { label: 'Engagement', value: 3, color: '#2563EB' },
    { label: 'Birthday', value: 2, color: '#16A34A' },
    { label: 'Other', value: 1, color: '#F59E0B' }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = 200;
  const radius = 70;
  const center = size / 2;
  const strokeWidth = 24;

  let currentAngle = -90; // Start from top

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, i) => {
          const percentage = (item.value / total) * 360;
          
          const circumference = 2 * Math.PI * radius;
          const strokeLength = (item.value / total) * circumference;
          const rotation = currentAngle;
          
          currentAngle += percentage;

          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeLength} ${circumference}`}
              strokeDashoffset={0}
              transform={`rotate(${rotation} ${center} ${center})`}
              style={{ transition: 'stroke-width 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.setAttribute('stroke-width', String(strokeWidth + 4))}
              onMouseLeave={(e) => e.currentTarget.setAttribute('stroke-width', String(strokeWidth))}
            />
          );
        })}

        {/* Center cutout content */}
        <circle cx={center} cy={center} r={radius - strokeWidth / 2} fill="#FFFFFF" />
        <text x={center} y={center - 2} textAnchor="middle" fontSize="18" fontWeight="800" fill="#0F172A">
          {total}
        </text>
        <text x={center} y={center + 14} textAnchor="middle" fontSize="9" fontWeight="600" fill="#64748B" letterSpacing="0.05em">
          EVENTS
        </text>
      </svg>

      {/* Legends */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }} />
            <span style={{ fontWeight: 500, color: '#334155', minWidth: '90px' }}>{item.label}</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>
              {item.value} ({((item.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


// ----------------------------------------------------
// 4. FINANCIAL SUMMARY (Outstanding vs Revenue Progress)
// ----------------------------------------------------
interface FinancialStatsProps {
  totalRevenue: number;
  totalExpenses: number;
  outstandingPayments: number;
}

export const PaymentStatusChart: React.FC<FinancialStatsProps> = ({
  totalRevenue,
  totalExpenses,
  outstandingPayments
}) => {
  const netProfit = totalRevenue - totalExpenses;
  const aggregate = totalRevenue + outstandingPayments;
  
  const revenuePct = aggregate > 0 ? (totalRevenue / aggregate) * 100 : 0;
  const outstandingPct = aggregate > 0 ? (outstandingPayments / aggregate) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
      {/* Stacked Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: '#475569', marginBottom: '8px' }}>
          <span>Received (₹{totalRevenue.toLocaleString()})</span>
          <span>Pending (₹{outstandingPayments.toLocaleString()})</span>
        </div>
        <div
          style={{
            height: '16px',
            width: '100%',
            backgroundColor: '#E2E8F0',
            borderRadius: '9999px',
            overflow: 'hidden',
            display: 'flex'
          }}
        >
          {revenuePct > 0 && (
            <div
              style={{
                width: `${revenuePct}%`,
                backgroundColor: '#16A34A',
                height: '100%',
                transition: 'width 0.4s'
              }}
              title={`Received: ${revenuePct.toFixed(1)}%`}
            />
          )}
          {outstandingPct > 0 && (
            <div
              style={{
                width: `${outstandingPct}%`,
                backgroundColor: '#F59E0B',
                height: '100%',
                transition: 'width 0.4s'
              }}
              title={`Outstanding: ${outstandingPct.toFixed(1)}%`}
            />
          )}
        </div>
      </div>

      {/* Numerical Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
        <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>NET PROFIT</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: netProfit >= 0 ? '#16A34A' : '#DC2626' }}>
            ₹{netProfit.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
            Revenue - Expenses
          </div>
        </div>
        
        <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>OUTSTANDING</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#D97706' }}>
            ₹{outstandingPayments.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
            Awaiting final checkouts
          </div>
        </div>
      </div>
    </div>
  );
};
