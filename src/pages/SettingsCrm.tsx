import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Download, Upload, RefreshCw, ShieldAlert, Cloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCloudinaryConfig, saveCloudinaryConfig, uploadToCloudinary, isCloudinaryConfigured } from '../services/cloudinary';

export const SettingsCrm: React.FC = () => {
  const { exportAppData, importAppData, resetAppData, currentUserRole, addToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloudinary Settings State
  const [cloudName, setCloudName] = useState('');
  const [uploadPreset, setUploadPreset] = useState('');
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Local Watermark Fallback Active'
  });

  useEffect(() => {
    const cfg = getCloudinaryConfig();
    setCloudName(cfg.cloudName || '');
    setUploadPreset(cfg.uploadPreset || '');
    if (isCloudinaryConfigured()) {
      setCloudStatus({ connected: true, message: `Connected to Cloud: ${cfg.cloudName}` });
    }
  }, []);

  const handleSaveCloudinary = () => {
    saveCloudinaryConfig({
      cloudName: cloudName.trim(),
      uploadPreset: uploadPreset.trim(),
      folder: 'sv_residency_multimedia'
    });
    const configured = Boolean(cloudName.trim() && uploadPreset.trim() && cloudName.trim() !== 'sv-residency');
    setCloudStatus({
      connected: configured,
      message: configured ? `Connected to Cloud: ${cloudName.trim()}` : 'Credentials Saved (Unsigned mode)'
    });
    addToast('Cloudinary Updated', 'Cloudinary multimedia settings saved.', 'success');
  };

  const handleTestCloudinary = async () => {
    setIsTestingCloud(true);
    // 1x1 transparent png test blob
    const dummyBlob = new Blob(
      [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84, 120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])],
      { type: 'image/png' }
    );
    try {
      const res = await uploadToCloudinary(dummyBlob, 'sv_residency_test');
      if (res.isCloudinary) {
        setCloudStatus({ connected: true, message: `Verified Live: ${res.url.substring(0, 45)}...` });
        addToast('Cloudinary Test', 'Test image uploaded successfully to Cloudinary!', 'success');
      } else {
        setCloudStatus({ connected: false, message: res.error || 'Failed to connect. Check cloud name & preset.' });
        addToast('Cloudinary Test', res.error || 'Cloudinary verification failed.', 'danger');
      }
    } catch (e: any) {
      setCloudStatus({ connected: false, message: e.message || 'Error communicating with Cloudinary' });
    } finally {
      setIsTestingCloud(false);
    }
  };

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

        {/* Cloudinary Multimedia Storage Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cloud size={18} color="#6320EE" /> Cloudinary Media Storage
            </h3>
            <span style={{ 
              fontSize: '0.65rem', 
              fontWeight: 700, 
              padding: '3px 8px', 
              borderRadius: '12px', 
              backgroundColor: cloudStatus.connected ? '#DCFCE7' : '#FEF3C7',
              color: cloudStatus.connected ? '#15803D' : '#B45309'
            }}>
              {cloudStatus.connected ? 'Cloud Active' : 'Fallback Mode'}
            </span>
          </div>
          
          <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>
            Stores EB meter photos (check-in/check-out), event damage logs, and guest identity documents on Cloudinary CDN.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Cloud Name
              </label>
              <input
                type="text"
                placeholder="e.g. sv-residency"
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Upload Preset (Unsigned)
              </label>
              <input
                type="text"
                placeholder="e.g. sv_residency_media"
                value={uploadPreset}
                onChange={(e) => setUploadPreset(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none' }}
              />
            </div>

            <div style={{ fontSize: '0.7rem', color: cloudStatus.connected ? '#16A34A' : '#D97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {cloudStatus.connected ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              <span>{cloudStatus.message}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleSaveCloudinary}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  backgroundColor: '#6320EE',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={handleTestCloudinary}
                disabled={isTestingCloud}
                style={{
                  padding: '9px 14px',
                  backgroundColor: '#F1F5F9',
                  color: '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: isTestingCloud ? 'not-allowed' : 'pointer'
                }}
              >
                {isTestingCloud ? 'Testing...' : 'Test Sync'}
              </button>
            </div>
          </div>
        </div>

        {/* Reset Database */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-sans)', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} color="#DC2626" /> Clear Operational Records
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
            Clears all bookings, payments, customers, and expense entries, keeping rooms inventory and hall settings ready for real user operations.
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
              <RefreshCw size={16} /> Clear All Operational Data
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
