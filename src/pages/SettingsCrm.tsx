import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Download, Upload, RefreshCw, ShieldAlert } from 'lucide-react';

export const SettingsCrm: React.FC = () => {
  const { exportAppData, importAppData, resetAppData, currentUserRole } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = exportAppData();
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `SV_Residency_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAppData(content);
        if (success) {
          alert('Database restored successfully.');
        } else {
          alert('Failed to restore database. Invalid file schema.');
        }
      }
    };
    fileReader.readAsText(files[0]);
  };

  const handleReset = () => {
    if (currentUserRole !== 'admin') {
      alert('Only administrators can reset the core databases.');
      return;
    }
    
    if (window.confirm('WARNING: Are you sure you want to delete all current bookings, expenses, payments, and customers, and reset the database to the initial seed state? This action cannot be undone.')) {
      resetAppData();
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
            Database Backup & Restore Settings
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Export local storage records, restore previous backup configurations, or reset variables.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Backup widget */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-sans)', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="#C9A227" /> Export Database Backup
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
            Download a serialized JSON backup file of all rooms, mahal configuration packages, client logs, booking entries, recorded transactions, and expenses.
          </p>
          <button
            onClick={handleExport}
            style={{
              padding: '12px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} /> Download Backup (.json)
          </button>
        </div>

        {/* Restore widget */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-sans)', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={16} color="#C9A227" /> Restore Database Backup
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
            Upload a previously exported `.json` database file to overwrite the current LocalStorage state and re-sync all parameters.
          </p>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            style={{ display: 'none' }}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '12px',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #0F172A',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Upload size={16} /> Choose Backup File
          </button>
        </div>

        {/* Reset Database */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-sans)', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} color="#DC2626" /> Reset Demo Data
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
            Deletes all custom bookings, payments, and expense audits, resetting the system variables to the original populated demo seed.
          </p>
          
          {currentUserRole === 'admin' ? (
            <button
              onClick={handleReset}
              style={{
                padding: '12px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} /> Reset Database to Demo Seed
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#FEE2E2', borderRadius: '6px', border: '1px solid #FCA5A5', fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>
              <ShieldAlert size={14} /> Reset Denied: Managers do not have permissions to reset databases.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
