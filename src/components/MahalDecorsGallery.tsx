import React, { useState } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, X, ZoomIn, MessageCircle, Phone, CheckCircle2 } from 'lucide-react';

interface DecorItem {
  id: number;
  filename: string;
  title: string;
  category: 'Mandapam' | 'Floral' | 'Reception' | 'Traditional';
  tag: string;
  desc: string;
}

// Generate the 43 decor items with curated titles and categories
const DECOR_ITEMS: DecorItem[] = Array.from({ length: 43 }, (_, idx) => {
  const num = idx + 1;
  let category: DecorItem['category'] = 'Mandapam';
  let tag = 'Royal Mandapam';
  let desc = 'Magnificent wedding stage mandapam setup with royal drapery and auspicious florals.';

  if (num >= 1 && num <= 12) {
    category = 'Mandapam';
    tag = 'Grand Mandapam';
    desc = 'Traditional Vedic wedding mandapam with ornate temple pillars and sacred floral arches.';
  } else if (num >= 13 && num <= 24) {
    category = 'Floral';
    tag = 'Exotic Floral Theme';
    desc = 'Lush natural jasmine, rose, and marigold canopy with cascading floral backdrops.';
  } else if (num >= 25 && num <= 34) {
    category = 'Reception';
    tag = 'Modern Reception Stage';
    desc = 'Contemporary evening reception stage featuring geometric LED illumination and crystal chandeliers.';
  } else {
    category = 'Traditional';
    tag = 'Heritage & Festivity';
    desc = 'Rich South Indian heritage backdrop tailored for Muhurtham, engagement, and auspicious celebrations.';
  }

  return {
    id: num,
    filename: `Decor${num}.jpg`,
    title: `SV Mahal Stage Design #${num}`,
    category,
    tag,
    desc
  };
});

export const MahalDecorsGallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedDecor, setSelectedDecor] = useState<DecorItem | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const categories = [
    { label: 'All Designs', value: 'All', count: DECOR_ITEMS.length },
    { label: 'Grand Mandapams', value: 'Mandapam', count: DECOR_ITEMS.filter(d => d.category === 'Mandapam').length },
    { label: 'Floral Canopies', value: 'Floral', count: DECOR_ITEMS.filter(d => d.category === 'Floral').length },
    { label: 'Reception Stages', value: 'Reception', count: DECOR_ITEMS.filter(d => d.category === 'Reception').length },
    { label: 'Heritage Themes', value: 'Traditional', count: DECOR_ITEMS.filter(d => d.category === 'Traditional').length },
  ];

  const filteredItems = activeCategory === 'All'
    ? DECOR_ITEMS
    : DECOR_ITEMS.filter(item => item.category === activeCategory);

  const displayedItems = filteredItems.slice(0, visibleCount);

  const handleNext = () => {
    if (!selectedDecor) return;
    const currentIndex = filteredItems.findIndex(d => d.id === selectedDecor.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedDecor(filteredItems[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedDecor) return;
    const currentIndex = filteredItems.findIndex(d => d.id === selectedDecor.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedDecor(filteredItems[prevIndex]);
  };

  const handleWhatsAppInquiry = (decor: DecorItem) => {
    const text = encodeURIComponent(
      `Hello SV Mahal, I am interested in Decor Design #${decor.id} (${decor.title}) for an upcoming wedding/event in Chengam. Please share availability and customization options.`
    );
    window.open(`https://wa.me/919500821550?text=${text}`, '_blank');
  };

  return (
    <section style={{ margin: '50px 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)', color: '#92400E', padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          <Sparkles size={14} color="#C9A227" /> EXCLUSIVE STAGE & MANDAPAM PORTFOLIO (43 DESIGNS)
        </div>
        <h3 style={{ fontSize: '2.2rem', color: '#0F172A', fontWeight: 800, margin: '0 0 10px 0', fontFamily: 'var(--font-sans)' }}>
          Grand Wedding Decors & Mandapam Styles
        </h3>
        <p style={{ color: '#64748B', maxWidth: '680px', margin: '0 auto', fontSize: '0.92rem', lineHeight: 1.6 }}>
          Explore our vast catalog of in-house decorator themes executed at SV Thirumana Mahal. From traditional sacred Vedic mandapams to contemporary illuminated reception stages, tailor your dream wedding backdrop.
        </p>
      </div>

      {/* Filter Category Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '30px' }}>
        {categories.map(cat => {
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => {
                setActiveCategory(cat.value);
                setVisibleCount(12);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '30px',
                border: isActive ? '1px solid #C9A227' : '1px solid #E2E8F0',
                backgroundColor: isActive ? '#0F172A' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 12px rgba(15,23,42,0.15)' : 'none'
              }}
            >
              <span>{cat.label}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  backgroundColor: isActive ? '#C9A227' : '#F1F5F9',
                  color: isActive ? '#0F172A' : '#64748B',
                  fontWeight: 800
                }}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Decors Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}
      >
        {displayedItems.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedDecor(item)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 20px -3px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
            }}
          >
            {/* Image Wrapper */}
            <div style={{ position: 'relative', height: '210px', backgroundColor: '#0F172A', overflow: 'hidden' }}>
              <img
                src={`/images/decors/${item.filename}`}
                alt={item.title}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 50%)' }} />
              
              {/* Category pill */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', color: '#F1D675', padding: '3px 10px', borderRadius: '14px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>
                {item.tag}
              </div>

              {/* Number Badge */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#C9A227', color: '#0F172A', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                #{item.id}
              </div>

              {/* Click to Zoom hint */}
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.9)', color: '#0F172A', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                <ZoomIn size={12} /> View Full
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
                  {item.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.4 }}>
                  {item.desc}
                </p>
              </div>

              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Customizable
                </span>
                <span style={{ fontSize: '0.74rem', color: '#0284C7', fontWeight: 700 }}>
                  Inquire Now →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination / Expand All */}
      {visibleCount < filteredItems.length && (
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            onClick={() => setVisibleCount(prev => Math.min(prev + 12, filteredItems.length))}
            style={{
              padding: '12px 32px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid #C9A227',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
              transition: 'background-color 0.2s ease'
            }}
          >
            Load More Designs ({filteredItems.length - visibleCount} Remaining)
          </button>
          <div style={{ marginTop: '8px' }}>
            <button
              onClick={() => setVisibleCount(filteredItems.length)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.8rem',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Show all {filteredItems.length} designs at once
            </button>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {selectedDecor && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedDecor(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '920px',
              width: '100%',
              backgroundColor: '#0F172A',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(201, 162, 39, 0.4)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedDecor(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 10,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            {/* Nav Arrows */}
            <button
              onClick={handlePrev}
              style={{
                position: 'absolute',
                top: '50%',
                left: '14px',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                top: '50%',
                right: '14px',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={22} />
            </button>

            {/* Modal Image */}
            <div style={{ maxHeight: '65vh', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617' }}>
              <img
                src={`/images/decors/${selectedDecor.filename}`}
                alt={selectedDecor.title}
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }}
              />
            </div>

            {/* Details Footer */}
            <div style={{ padding: '20px 24px', backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ background: '#C9A227', color: '#0F172A', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                    #{selectedDecor.id} of {DECOR_ITEMS.length}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#F1D675', fontWeight: 600 }}>
                    {selectedDecor.tag}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 800 }}>
                  {selectedDecor.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94A3B8', maxWidth: '520px' }}>
                  {selectedDecor.desc}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleWhatsAppInquiry(selectedDecor)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <MessageCircle size={15} /> Book This Decor on WhatsApp
                </button>
                <a
                  href="tel:+919500821550"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    backgroundColor: '#1E293B',
                    color: '#FFFFFF',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  <Phone size={14} /> Call Manager
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
