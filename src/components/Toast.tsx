import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
        width: '100%',
        pointerEvents: 'none'
      }}
    >
      {toasts.map(toast => {
        let Icon = Info;
        let color = '#3B82F6';
        let bg = '#EFF6FF';
        let border = '#BFDBFE';

        if (toast.type === 'success') {
          Icon = CheckCircle;
          color = '#10B981';
          bg = '#ECFDF5';
          border = '#A7F3D0';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          color = '#F59E0B';
          bg = '#FFFBEB';
          border = '#FDE68A';
        } else if (toast.type === 'danger') {
          Icon = AlertCircle;
          color = '#EF4444';
          bg = '#FEF2F2';
          border = '#FCA5A5';
        }

        return (
          <div
            key={toast.id}
            className="animate-slide-in"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              backgroundColor: bg,
              border: `1px solid ${border}`,
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              pointerEvents: 'auto',
              position: 'relative'
            }}
          >
            <Icon size={20} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flexGrow: 1, paddingRight: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1E293B' }}>
                {toast.title}
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.825rem', color: '#475569', lineHeight: 1.4 }}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#94A3B8',
                position: 'absolute',
                top: '12px',
                right: '12px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
