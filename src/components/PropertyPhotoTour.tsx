import React, { useState } from 'react';
import { PROPERTY_PHOTOS, GALLERY_CATEGORIES } from '../data/propertyGallery';
import { PropertyGalleryModal } from './PropertyGalleryModal';
import { Sparkles, Camera, Eye, Check, Maximize2 } from 'lucide-react';

interface PropertyPhotoTourProps {
  title?: string;
  subtitle?: string;
  defaultCategory?: string;
  compact?: boolean;
}

export const PropertyPhotoTour: React.FC<PropertyPhotoTourProps> = ({
  title = "Authentic Property & Suites Tour",
  subtitle = "Real, unedited photographs of our luxury guest rooms, modern elevator, scenic mountain corridors, front desk, and wedding campus in Chengam.",
  defaultCategory = "all",
  compact = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const filteredPhotos = selectedCategory === 'all'
    ? PROPERTY_PHOTOS
    : PROPERTY_PHOTOS.filter(p => p.category === selectedCategory);

  const openPhotoModal = (id: string) => {
    setActivePhotoId(id);
    setIsModalOpen(true);
  };

  return (
    <section style={{ padding: compact ? '40px 0' : '70px 0', backgroundColor: '#F8FAFC' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', gap: '20px' }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(201, 162, 39, 0.12)',
              border: '1px solid rgba(201, 162, 39, 0.3)',
              color: '#9A7B1C',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              <Camera size={13} color="#C9A227" /> 100% REAL PHOTOGRAPHS (10 HD VIEWS)
            </div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              color: '#0F172A',
              fontWeight: 800,
              lineHeight: 1.2,
              margin: '0 0 10px 0',
              fontFamily: 'var(--font-sans)'
            }}>
              {title}
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
              {subtitle}
            </p>
          </div>

          {/* Quick Launch Fullscreen Tour Button */}
          <button
            onClick={() => openPhotoModal(PROPERTY_PHOTOS[0].id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid #C9A227',
              borderRadius: '10px',
              padding: '12px 22px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#1E293B';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#0F172A';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Maximize2 size={16} color="#C9A227" />
            <span>Launch Virtual Tour (10 Photos)</span>
          </button>
        </div>

        {/* Interactive Category Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '24px',
          scrollbarWidth: 'none'
        }}>
          {GALLERY_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '30px',
                  border: isSelected ? '1px solid #C9A227' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#0F172A' : '#FFFFFF',
                  color: isSelected ? '#F1D675' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Photo Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}
        >
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => openPhotoModal(photo.id)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)';
                e.currentTarget.style.borderColor = '#CBD5E1';
                const img = e.currentTarget.querySelector('img');
                if (img) img.style.transform = 'scale(1.06)';
                const overlay = e.currentTarget.querySelector('.explore-overlay') as HTMLElement;
                if (overlay) overlay.style.opacity = '1';
                const btn = e.currentTarget.querySelector('.card-action-btn') as HTMLElement;
                if (btn) {
                  btn.style.backgroundColor = '#0F172A';
                  btn.style.color = '#F1D675';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#E2E8F0';
                const img = e.currentTarget.querySelector('img');
                if (img) img.style.transform = 'scale(1)';
                const overlay = e.currentTarget.querySelector('.explore-overlay') as HTMLElement;
                if (overlay) overlay.style.opacity = '0';
                const btn = e.currentTarget.querySelector('.card-action-btn') as HTMLElement;
                if (btn) {
                  btn.style.backgroundColor = '#F8FAFC';
                  btn.style.color = '#0F172A';
                }
              }}
            >
              {/* Image Frame with Uniform 220px Aspect Frame */}
              <div
                style={{
                  height: '220px',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#0F172A'
                }}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease'
                  }}
                />

                {/* Subtle bottom gradient */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.1) 50%, transparent 100%)'
                }} />

                {/* Top Badge: Category & Real Verified Marker */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#F1D675',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <Sparkles size={11} color="#C9A227" />
                  {photo.badge || photo.categoryLabel}
                </div>

                {/* Photo ID number */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(4px)',
                  color: '#CBD5E1',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  Photo {PROPERTY_PHOTOS.findIndex(p => p.id === photo.id) + 1} of 10
                </div>

                {/* Interactive Hover Reveal Overlay */}
                <div
                  className="explore-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.55)',
                    backdropFilter: 'blur(3px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.25s ease',
                    gap: '8px'
                  }}
                >
                  <span style={{
                    backgroundColor: '#C9A227',
                    color: '#0F172A',
                    padding: '8px 18px',
                    borderRadius: '24px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.35)'
                  }}>
                    <Eye size={14} /> Tap to Inspect in HD
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#9A7B1C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {photo.categoryLabel}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                    Chengam Campus
                  </span>
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: '0 0 8px 0',
                  lineHeight: 1.35,
                  fontFamily: 'var(--font-sans)'
                }}>
                  {photo.title}
                </h3>
                <p style={{
                  fontSize: '0.84rem',
                  color: '#64748B',
                  lineHeight: 1.55,
                  margin: '0 0 16px 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {photo.description}
                </p>

                {/* Highlights tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {photo.highlights.slice(0, 2).map((h, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: '#F8FAFC',
                        color: '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Check size={11} color="#10B981" /> {h}
                    </span>
                  ))}
                </div>

                {/* Card Action Row */}
                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    className="card-action-btn"
                    style={{
                      width: '100%',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Maximize2 size={13} />
                    <span>View HD Real Photo</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <PropertyGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialPhotoId={activePhotoId || undefined}
      />
    </section>
  );
};
