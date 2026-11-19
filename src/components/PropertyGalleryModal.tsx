import React, { useState, useEffect, useCallback } from 'react';
import { PROPERTY_PHOTOS, type PropertyPhoto } from '../data/propertyGallery';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Sparkles, Check, MapPin, ArrowRight, Share2, CheckCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PropertyGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPhotoId?: string;
}

export const PropertyGalleryModal: React.FC<PropertyGalleryModalProps> = ({
  isOpen,
  onClose,
  initialPhotoId
}) => {
  const { setView } = useApp();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync initial photo ID
  useEffect(() => {
    if (initialPhotoId) {
      const idx = PROPERTY_PHOTOS.findIndex(p => p.id === initialPhotoId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [initialPhotoId]);

  // Reset zoom on index change
  useEffect(() => {
    setZoomLevel(1);
  }, [currentIndex]);

  const activePhoto: PropertyPhoto = PROPERTY_PHOTOS[currentIndex] || PROPERTY_PHOTOS[0];

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % PROPERTY_PHOTOS.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + PROPERTY_PHOTOS.length) % PROPERTY_PHOTOS.length);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen) return null;

  const toggleZoom = () => {
    setZoomLevel(prev => (prev === 1 ? 1.6 : prev === 1.6 ? 2.2 : 1));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + activePhoto.src);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCta = () => {
    onClose();
    if (activePhoto.bookingLink) {
      setView(activePhoto.bookingLink.view);
    } else {
      setView('public/rooms');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(10, 15, 29, 0.96)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#FFFFFF',
        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)'
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #C9A227 0%, #D4AF37 100%)',
            color: '#0F172A',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Sparkles size={12} /> {activePhoto.badge || 'Verified Real Photo'}
          </div>
          <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            <span style={{ color: '#F1D675', fontWeight: 700 }}>{currentIndex + 1}</span> of {PROPERTY_PHOTOS.length}
          </span>
          <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'none', md: 'inline' } as any}>
            • Use ← → arrow keys to navigate
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={toggleZoom}
            title={zoomLevel > 1 ? 'Reset Zoom' : 'Zoom In'}
            style={{
              background: zoomLevel > 1 ? 'rgba(201, 162, 39, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: zoomLevel > 1 ? '#F1D675' : '#FFFFFF',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            {zoomLevel > 1 ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
          </button>

          <button
            onClick={handleShare}
            title="Copy Photo Link"
            style={{
              background: copied ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: copied ? '#34D399' : '#FFFFFF',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            {copied ? <CheckCheck size={18} /> : <Share2 size={18} />}
          </button>

          <button
            onClick={onClose}
            title="Close (Esc)"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area: Image + Details Panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Left / Center: Interactive Image Viewer */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'auto',
            padding: '20px',
            backgroundColor: '#070C18'
          }}
        >
          {/* Previous Arrow Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous Photo"
            style={{
              position: 'absolute',
              left: '20px',
              zIndex: 20,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#C9A227';
              e.currentTarget.style.color = '#0F172A';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Active Photo Container */}
          <div
            style={{
              position: 'relative',
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease-out'
            }}
          >
            <img
              key={activePhoto.id}
              src={activePhoto.src}
              alt={activePhoto.alt}
              style={{
                maxWidth: zoomLevel === 1 ? '85vw' : 'none',
                maxHeight: zoomLevel === 1 ? '72vh' : 'none',
                width: zoomLevel > 1 ? `${zoomLevel * 100}%` : 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in',
                transition: 'transform 0.25s ease'
              }}
              onClick={toggleZoom}
            />

            {/* Quick Pill overlay on image */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(10px)',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: '0.78rem',
                color: '#E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                pointerEvents: 'none'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              {activePhoto.subtitle}
            </div>
          </div>

          {/* Next Arrow Button */}
          <button
            onClick={handleNext}
            aria-label="Next Photo"
            style={{
              position: 'absolute',
              right: '20px',
              zIndex: 20,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#C9A227';
              e.currentTarget.style.color = '#0F172A';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Right Info Drawer (Collapsible / Responsive on Desktop) */}
        <aside
          style={{
            width: '380px',
            maxWidth: '100%',
            backgroundColor: '#0F172A',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '24px',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '16px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#C9A227',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '4px'
              }}
            >
              {activePhoto.categoryLabel}
            </span>
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '0 0 6px 0',
                lineHeight: 1.25
              }}
            >
              {activePhoto.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94A3B8' }}>
              <MapPin size={14} color="#C9A227" />
              <span>{activePhoto.subtitle}</span>
            </div>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: '0.88rem',
              color: '#CBD5E1',
              lineHeight: 1.6,
              margin: '0 0 20px 0',
              backgroundColor: 'rgba(255,255,255,0.03)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            {activePhoto.description}
          </p>

          {/* Highlights */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#94A3B8',
                margin: '0 0 10px 0'
              }}
            >
              Featured Highlights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activePhoto.highlights.map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '0.82rem',
                    color: '#E2E8F0'
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '2px',
                      flexShrink: 0
                    }}
                  >
                    <Check size={11} color="#34D399" />
                  </div>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specs / Meta */}
          {activePhoto.specs && (
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px'
                }}
              >
                {activePhoto.specs.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase' }}>{s.label}</div>
                    <div style={{ fontSize: '0.82rem', color: '#F1F5F9', fontWeight: 600, marginTop: '2px' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTA */}
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <button
              onClick={handleCta}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #C9A227 0%, #D4AF37 100%)',
                color: '#0F172A',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(201, 162, 39, 0.35)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>{activePhoto.bookingLink?.text || 'Book Now'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom Thumbnail Strip */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '10px 16px',
          overflowX: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10
        }}
      >
        <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, paddingLeft: '8px', flexShrink: 0 }}>
          ALL 10 PHOTOS:
        </span>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px' }}>
          {PROPERTY_PHOTOS.map((photo, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={photo.id}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  position: 'relative',
                  width: '68px',
                  height: '46px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: isSelected ? '2px solid #C9A227' : '1px solid rgba(255, 255, 255, 0.2)',
                  opacity: isSelected ? 1 : 0.6,
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s'
                }}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.7)',
                    fontSize: '0.58rem',
                    color: '#FFFFFF',
                    padding: '1px 3px',
                    borderTopLeftRadius: '3px'
                  }}
                >
                  #{idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
