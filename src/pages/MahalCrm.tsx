import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building, Save, ShieldAlert } from 'lucide-react';
import type { MahalConfig, MahalPackage } from '../types';

export const MahalCrm: React.FC = () => {
  const { mahalConfig, updateMahal, currentUserRole } = useApp();

  // Local Form states initialized from context configuration
  const [name, setName] = useState(mahalConfig.name || 'SV Mahal Banquet Hall');
  const [capacity, setCapacity] = useState(mahalConfig.capacity || 1000);
  const [diningCapacity, setDiningCapacity] = useState(mahalConfig.diningCapacity || 350);
  const [price, setPrice] = useState(mahalConfig.price || 120000);

  // Packages state
  const [packages, setPackages] = useState<MahalPackage[]>(
    mahalConfig.packages || [
      { name: 'Basic', price: 100000, description: '', amenities: [] },
      { name: 'Standard', price: 150000, description: '', amenities: [] },
      { name: 'Premium', price: 220000, description: '', amenities: [] }
    ]
  );

  const handlePackagePriceChange = (index: number, newPrice: number) => {
    const updated = [...packages];
    updated[index].price = newPrice;
    setPackages(updated);
  };

  const handlePackageDescChange = (index: number, newDesc: string) => {
    const updated = [...packages];
    updated[index].description = newDesc;
    setPackages(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== 'admin') {
      alert('Only administrators can configure SV Mahal pricing or capacity attributes.');
      return;
    }

    const updatedConfig: MahalConfig = {
      ...mahalConfig,
      name,
      capacity: Number(capacity),
      diningCapacity: Number(diningCapacity),
      price: Number(price),
      packages
    };

    updateMahal(updatedConfig);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
            SV Mahal Hall Configurations
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Configure banquet seating capacities, modify rental packages, and adjust pricing.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Core settings form */}
        <form onSubmit={handleSave} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-sans)', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={16} color="#C9A227" /> General Parameters
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>BANQUET HALL NAME</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>TOTAL SEATING CAP</label>
              <input
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>DINING SEATING CAP</label>
              <input
                type="number"
                required
                value={diningCapacity}
                onChange={(e) => setDiningCapacity(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>BASE HALL RENT (₹ / day)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
            />
          </div>

          {currentUserRole === 'admin' ? (
            <button
              type="submit"
              style={{
                width: '100%',
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
                gap: '8px',
                marginTop: '8px'
              }}
            >
              <Save size={16} /> Save Mahal Configurations
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#FFFBEB', borderRadius: '6px', border: '1px solid #FEF3C7', fontSize: '0.75rem', color: '#B45309', fontWeight: 600 }}>
              <ShieldAlert size={14} /> View Only: Managers are blocked from editing Mahal parameters.
            </div>
          )}
        </form>

        {/* Packages Configuration Block */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-sans)', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
            Rental Packages Scaling
          </h3>

          {packages.map((pkg, idx) => (
            <div
              key={pkg.name}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '14px',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>{pkg.name} Package</span>
                
                {currentUserRole === 'admin' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>₹</span>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={(e) => handlePackagePriceChange(idx, Number(e.target.value))}
                      style={{ width: '90px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 700 }}
                    />
                  </div>
                ) : (
                  <span style={{ fontWeight: 700, color: '#C9A227', fontSize: '0.9rem' }}>₹{pkg.price.toLocaleString()}</span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>DESCRIPTION</label>
                {currentUserRole === 'admin' ? (
                  <textarea
                    value={pkg.description}
                    onChange={(e) => handlePackageDescChange(idx, e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', outline: 'none', resize: 'vertical' }}
                  />
                ) : (
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>{pkg.description || 'No description configured.'}</p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
