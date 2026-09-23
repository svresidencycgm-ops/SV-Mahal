import React from 'react';
import { useApp } from '../context/AppContext';


export const AuditLogsCrm: React.FC = () => {
  const { logs } = useApp();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
            Operational Audit Trail
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            System logs recording database modifications, reservation status transitions, and staff entries.
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="table-container shadow-sm">
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', fontSize: '0.9rem' }}>
            No logs recorded.
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator Desk</th>
                <th>Action Performed</th>
                <th>Target Object</th>
                <th>Object ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 600, color: '#334155' }}>
                    {log.user}
                  </td>
                  <td style={{ fontWeight: 500, color: '#0F172A' }}>
                    {log.action}
                  </td>
                  <td>
                    <span className="badge badge-muted">
                      {log.entity}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600 }}>
                    {log.entityId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
