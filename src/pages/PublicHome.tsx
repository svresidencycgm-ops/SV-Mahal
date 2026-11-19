import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, Phone, Search, ChevronRight, ChevronLeft, Check, Calendar, 
  Users, Sparkles, Bed, Building, MessageCircle, Maximize2, Eye 
} from 'lucide-react';
import { PropertyPhotoTour } from '../components/PropertyPhotoTour';
import { PropertyGalleryModal } from '../components/PropertyGalleryModal';

export const PublicHome: React.FC = () => {
  const { setView } = useApp();
  const [activeTab, setActiveTab] = useState<'rooms' | 'mahal'>('rooms');

  // Search Console inputs
  const [destination, setDestination] = useState('SV Residency, Thukkapet, Chengam');
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [guestsCount, setGuestsCount] = useState('2 Adult, 0 Child');

  // Mahal specific form inputs
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [eventGuests, setEventGuests] = useState('500 Guests');

  // Interactive Interior tabs selector
  const [selectedInterior, setSelectedInterior] = useState<'classic' | 'deluxe' | 'terrace' | 'hall'>('classic');

  // Interactive Hero Slides with Real Photographs
  const HERO_SLIDES = [
    {
      id: 'aerial-mountain-view',
      title: 'Scenic Mountain Vistas & Rural Calm',
      subtitle: 'SV Thirumana Mahal & Residency Campus in Chengam',
      image: '/images/property/aerial-mountain-view.jpg',
      tag: 'Drone Panoramic View',
      badge: 'Majestic Eastern Ghats'
    },
    {
      id: 'room-302-suite',
      title: 'Executive Deluxe Suite',
      subtitle: 'Spacious King Bed, Split AC, Wardrobe & Vanity',
      image: '/images/property/room-302-suite.jpg',
      tag: 'Authentic Room Photo',
      badge: 'Deluxe AC Suite'
    },
    {
      id: 'elevator-lobby',
      title: 'High-Speed Elevator & Black Granite Lobby',
      subtitle: 'Senior Citizen & Wheelchair Accessible Vertical Access',
      image: '/images/property/elevator-lobby.jpg',
      tag: 'Modern Amenity',
      badge: 'Granite & Teak Finishes'
    },
    {
      id: 'reception-desk',
      title: '24/7 Front Desk & Auspicious Lord Balaji Sanctum',
      subtitle: 'Welcoming Traditional Hospitality & Dedicated Service',
      image: '/images/property/reception-desk.jpg',
      tag: 'Front Desk',
      badge: 'Round-the-Clock Support'
    },
    {
      id: 'campus-panoramic',
      title: 'Grand SV Mahal & Accommodation Complex',
      subtitle: 'Integrated Wedding Auditorium, Temple & 200+ Parking',
      image: '/images/property/campus-panoramic.jpg',
      tag: 'Grand Campus',
      badge: '1000+ Guests Capacity'
    }
  ];

  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | undefined>(undefined);

  // Card 1 & Card 2 interactive thumbnail states
  const [card1ActiveImg, setCard1ActiveImg] = useState('/images/property/room-302-suite.jpg');
  const [card2ActiveImg, setCard2ActiveImg] = useState('/images/property/aerial-mountain-view.jpg');

  // Auto-play hero slides
  useEffect(() => {
    if (isHeroPaused) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHeroPaused, HERO_SLIDES.length]);

  const interiorsData = {
    classic: {
      title: 'Standard Comfort Room',
      category: 'Comfort Accommodations',
      description: 'Elegant air-conditioned rooms designed for standard transit stays and pilgrimage yatris, featuring clean linens, flat-screen TV, and modern attached washrooms.',
      image: '/images/property/room-comfort-2.jpg',
      specs: ['King/Double Bed', 'Free High-Speed Wi-Fi', '24/7 Hot Water & Power', 'AC & Ceiling Fan']
    },
    deluxe: {
      title: 'Deluxe Suite',
      category: 'Executive Luxury Stays',
      description: 'Spacious deluxe suites offering luxury dark-wood furniture, split air conditioning, dressing vanity, wardrobe, and immaculate porcelain flooring.',
      image: '/images/property/room-302-suite.jpg',
      specs: ['King Size Bed', 'Split Air Conditioning', 'Floating LED TV Shelf', 'Dressing Table & Wardrobe']
    },
    terrace: {
      title: 'Sunlit Mountain-View Corridor',
      category: 'Scenic Hillside Views',
      description: 'Bright guest floors lined with Italian Calacatta-style marble wall tiles and wide windows overlooking Chengam’s green valley hills.',
      image: '/images/property/scenic-corridor.jpg',
      specs: ['Mountain Vista Windows', 'Polished Calacatta Marble', 'Natural Airflow & Sunlight', 'Quiet Guest Wings']
    },
    hall: {
      title: 'SV Mahal Grand Campus & Temple',
      category: 'Auspicious Banquet & Mandapam',
      description: 'Grand air-conditioned banquet hall with Dravidian temple shrine, multi-tier gopuram, spacious interlocking paver parking, and luxury rooms opposite.',
      image: '/images/property/campus-panoramic.jpg',
      specs: ['1000+ Guests Capacity', 'On-Campus Temple Shrine', 'High-Speed Elevator Access', '200+ Car & Bus Parking']
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'rooms') {
      setView('public/rooms');
      window.location.hash = `public/rooms?in=${checkIn}&out=${checkOut}&guests=${encodeURIComponent(guestsCount)}`;
    } else {
      setView('public/mahal');
      window.location.hash = `public/mahal?date=${eventDate || new Date().toISOString().split('T')[0]}&type=${eventType}&guests=${encodeURIComponent(eventGuests)}`;
    }
  };

  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '100vh', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      
      {/* 1. NEW REDESIGNED HERO SECTION (INTERACTIVE REAL PHOTO SHOWCASE) */}
      <section 
        style={{ padding: '0', maxWidth: '100%', margin: '0 auto', position: 'relative', display: 'flex', flexWrap: 'wrap', minHeight: '82vh' }}
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
      >
        {/* Left Content Column */}
        <div style={{ flex: '1 1 500px', padding: '8% 5%', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)', color: '#9A7B1C', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', width: 'fit-content', marginBottom: '14px' }}>
            <Sparkles size={12} color="#C9A227" /> CHENGAM'S PREMIER WEDDING & LODGING DESTINATION
          </div>
          <h2 style={{ fontSize: 'clamp(2.4rem, 4.8vw, 4.2rem)', fontWeight: 800, color: '#1E293B', margin: 0, lineHeight: 1.12, fontFamily: 'var(--font-sans)' }}>
            SV Residency for <span style={{ fontFamily: '"Caveat", cursive', color: '#C9A227', fontSize: '115%', fontWeight: 400 }}>memorable</span> moments rich in emotions
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64748B', marginTop: '20px', marginBottom: '32px', maxWidth: '500px', lineHeight: 1.6 }}>
            Spacious air-conditioned suites, high-speed elevator, sunlit mountain-view corridors, and a grand 1,000+ guest wedding hall right in Chengam.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
            <button 
              onClick={() => setView('public/book')}
              style={{ 
                backgroundColor: '#C9A227', 
                color: '#0F172A', 
                padding: '16px 36px', 
                borderRadius: '30px', 
                fontSize: '1rem', 
                fontWeight: 800, 
                border: 'none', 
                cursor: 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '10px', 
                boxShadow: '0 10px 25px -5px rgba(201, 162, 39, 0.4)',
                transition: 'all 0.2s',
                letterSpacing: '0.02em'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#B38E1B';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#C9A227';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Book Now</span>
              <Calendar size={18} color="#0F172A" />
            </button>
          </div>
        </div>

        {/* Right Image Column with Interactive Showcase & Diagonal Cut */}
        <div style={{ 
          flex: '1 1 500px', 
          position: 'relative', 
          minHeight: '440px',
          clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)',
          backgroundColor: '#0F172A',
          boxShadow: '-20px 0 50px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }}>
          {/* Active Background Image with Crossfade */}
          <img
            key={HERO_SLIDES[currentHeroSlide].id}
            src={HERO_SLIDES[currentHeroSlide].image}
            alt={HERO_SLIDES[currentHeroSlide].title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              inset: 0,
              animation: 'fadeIn 0.6s ease-in-out'
            }}
          />

          {/* Dark overlay gradient */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 50%, rgba(15,23,42,0.4) 100%)'
          }} />

          {/* Top Left Tag */}
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '18%',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#F1D675',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 3
          }}>
            <Sparkles size={12} color="#C9A227" />
            {HERO_SLIDES[currentHeroSlide].tag}
          </div>

          {/* Slide Navigation Overlay Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentHeroSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
            }}
            aria-label="Previous Slide"
            style={{
              position: 'absolute',
              left: '14%',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentHeroSlide(prev => (prev + 1) % HERO_SLIDES.length);
            }}
            aria-label="Next Slide"
            style={{
              position: 'absolute',
              right: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Bottom Caption & Interactive Slide Switcher Pills */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '12%',
            right: '24px',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 800 }}>
                  {HERO_SLIDES[currentHeroSlide].title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#CBD5E1' }}>
                  {HERO_SLIDES[currentHeroSlide].subtitle}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedPhotoId(HERO_SLIDES[currentHeroSlide].id);
                  setGalleryModalOpen(true);
                }}
                style={{
                  background: 'rgba(201, 162, 39, 0.2)',
                  border: '1px solid #C9A227',
                  color: '#F1D675',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Maximize2 size={12} /> Inspect in HD
              </button>
            </div>

            {/* Interactive Thumbnail Selector Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {HERO_SLIDES.map((slide, idx) => {
                const isActive = idx === currentHeroSlide;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentHeroSlide(idx)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      border: isActive ? '1px solid #C9A227' : '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: isActive ? 'rgba(201, 162, 39, 0.3)' : 'rgba(15, 23, 42, 0.65)',
                      color: isActive ? '#F1D675' : '#CBD5E1',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      backdropFilter: 'blur(4px)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {idx + 1}. {slide.badge}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

        {/* Floating Search Bar (Capsule) */}
        <div
          style={{
            position: 'relative',
            marginTop: '-60px',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            padding: '0 16px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px 30px',
              width: '100%',
              maxWidth: '960px',
              boxShadow: '0 25px 60px -15px rgba(99, 102, 241, 0.2), 0 4px 20px rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(99, 102, 241, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Toggle tabs for service type */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('rooms')}
                style={{
                  background: activeTab === 'rooms' ? 'linear-gradient(135deg, #E0E7FF 0%, #EEF2F6 100%)' : 'none',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: activeTab === 'rooms' ? '#4F46E5' : '#64748B',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Bed size={15} color={activeTab === 'rooms' ? '#4F46E5' : '#64748B'} />
                Residency Rooms Stay
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mahal')}
                style={{
                  background: activeTab === 'mahal' ? 'linear-gradient(135deg, #FCE7F3 0%, #EEF2F6 100%)' : 'none',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: activeTab === 'mahal' ? '#DB2777' : '#64748B',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Building size={15} color={activeTab === 'mahal' ? '#DB2777' : '#64748B'} />
                SV Mahal Banquet
              </button>
            </div>

            {/* Inputs Row */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', width: '100%' }}>
              
              {activeTab === 'rooms' ? (
                // Rooms inputs
                <div style={{ display: 'flex', flexWrap: 'wrap', flexGrow: 1, gap: '16px', width: '100%', maxWidth: 'calc(100% - 70px)' }}>
                  
                  {/* Location */}
                  <div style={{ flex: '1 1 220px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '14px', border: '1px solid #E2E8F0', transition: 'border-color 0.2s' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={15} color="#4F46E5" />
                    </div>
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</span>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Where are you going?"
                        style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', width: '100%', padding: 0 }}
                      />
                    </div>
                  </div>

                  {/* Check-in */}
                  <div style={{ flex: '1 1 140px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={15} color="#D97706" />
                    </div>
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check in</span>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', width: '100%', padding: 0, cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  {/* Check-out */}
                  <div style={{ flex: '1 1 140px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={15} color="#D97706" />
                    </div>
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check out</span>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', width: '100%', padding: 0, cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div style={{ flex: '1 1 140px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={15} color="#16A34A" />
                    </div>
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guests</span>
                      <select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(e.target.value)}
                        style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', width: '100%', cursor: 'pointer', padding: 0 }}
                      >
                        <option value="1 Adult, 0 Child">1 Adult</option>
                        <option value="2 Adult, 0 Child">2 Adults</option>
                        <option value="3 Adult, 1 Child">3 Adults, 1 Child</option>
                        <option value="4 Adult, 2 Child">Family Group</option>
                      </select>
                    </div>
                  </div>

                </div>
              ) : (
                // Mahal inputs
                <div style={{ display: 'flex', flexWrap: 'wrap', flexGrow: 1, gap: '16px', width: '100%', maxWidth: 'calc(100% - 70px)' }}>
                  
                  {/* Location */}
                  <div style={{ flex: '1 1 220px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={15} color="#DB2777" />
                    </div>
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Location</span>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', width: '100%', padding: 0 }}
                      />
                    </div>
                  </div>

                  {/* Event Date */}
                  <div style={{ flex: '1 1 140px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={15} color="#D97706" />
                    </div>
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Date</span>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', width: '100%', padding: 0, cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  {/* Event Type */}
                  <div style={{ flex: '1 1 140px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={15} color="#0284C7" />
                    </div>
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Type</span>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', width: '100%', cursor: 'pointer', padding: 0 }}
                      >
                        <option value="Wedding">Wedding Ceremony</option>
                        <option value="Reception">Reception</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Birthday Party">Birthday Bash</option>
                      </select>
                    </div>
                  </div>

                  {/* Guests */}
                  <div style={{ flex: '1 1 140px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={15} color="#16A34A" />
                    </div>
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guests Volume</span>
                      <select
                        value={eventGuests}
                        onChange={(e) => setEventGuests(e.target.value)}
                        style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', width: '100%', cursor: 'pointer', padding: 0 }}
                      >
                        <option value="200 Guests">Up to 200 Guests</option>
                        <option value="500 Guests">Up to 500 Guests</option>
                        <option value="1000 Guests">Up to 1000 Guests</option>
                      </select>
                    </div>
                  </div>

                </div>
              )}

              {/* Search Icon Button */}
              <button
                type="submit"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: activeTab === 'rooms' ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : 'linear-gradient(135deg, #EC4899 0%, #D946EF 100%)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.35)',
                  transition: 'transform 0.2s, opacity 0.2s',
                  flexShrink: 0,
                  marginLeft: 'auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.opacity = '0.95';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Search size={22} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>

      {/* 2. POPULAR SUITES / HOTELS SECTION */}
      <section style={{ padding: '60px 24px 20px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', textAlign: 'center', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>
          Popular Hotels & Packages
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#64748B', textAlign: 'center', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          Explore our most frequently booked highway AC lodging suites and auspicious luxury banquet hall configurations.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '30px' }}>
          {/* Card 1: Residency Lodging with Interactive Thumbnail Switcher */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <div style={{ height: '230px', position: 'relative', overflow: 'hidden', backgroundColor: '#0F172A' }}>
              <img
                src={card1ActiveImg}
                alt="SV Residency Real Photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%)' }} />

              <div style={{ position: 'absolute', top: '14px', left: '14px', backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.72rem', fontWeight: 700, color: '#F1D675', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Sparkles size={11} style={{ display: 'inline', marginRight: '4px' }} /> Real Suite Photo
              </div>

              {/* Interactive Mini-Pills to switch photos right on card */}
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', display: 'flex', gap: '6px', overflowX: 'auto', zIndex: 2 }}>
                {[
                  { label: 'Deluxe Suite', img: '/images/property/room-302-suite.jpg' },
                  { label: 'King Bed', img: '/images/property/room-deluxe-1.jpg' },
                  { label: 'Granite Lift', img: '/images/property/elevator-lobby.jpg' },
                  { label: 'Corridor', img: '/images/property/scenic-corridor.jpg' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCard1ActiveImg(item.img);
                    }}
                    style={{
                      backgroundColor: card1ActiveImg === item.img ? '#C9A227' : 'rgba(15, 23, 42, 0.85)',
                      color: card1ActiveImg === item.img ? '#0F172A' : '#FFFFFF',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0, fontFamily: 'var(--font-sans)' }}>
                  SV Residency Lodging Stay
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="#CBD5E1" /> Main Road, Chengam Highway
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setView('public/rooms')}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  View Room Rates
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPhotoId('room-302-suite');
                    setGalleryModalOpen(true);
                  }}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={13} /> HD Photos
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: SV Mahal with Drone & Ground Perspectives */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <div style={{ height: '230px', position: 'relative', overflow: 'hidden', backgroundColor: '#0F172A' }}>
              <img
                src={card2ActiveImg}
                alt="SV Thirumana Mahal Architecture"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%)' }} />

              <div style={{ position: 'absolute', top: '14px', left: '14px', backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.72rem', fontWeight: 700, color: '#F1D675', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Sparkles size={11} style={{ display: 'inline', marginRight: '4px' }} /> 1000+ Guests
              </div>

              {/* Interactive Mini-Pills */}
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', display: 'flex', gap: '6px', overflowX: 'auto', zIndex: 2 }}>
                {[
                  { label: 'Drone View', img: '/images/property/aerial-mountain-view.jpg' },
                  { label: 'Campus', img: '/images/property/campus-panoramic.jpg' },
                  { label: 'Temple Shrine', img: '/images/property/temple-shrine.jpg' },
                  { label: 'Facade', img: '/images/sv-mahal-day.webp' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCard2ActiveImg(item.img);
                    }}
                    style={{
                      backgroundColor: card2ActiveImg === item.img ? '#C9A227' : 'rgba(15, 23, 42, 0.85)',
                      color: card2ActiveImg === item.img ? '#0F172A' : '#FFFFFF',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', fontFamily: 'var(--font-sans)' }}>
                SV Thirumana Mahal (Grand Architecture)
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="#CBD5E1" /> Opposite Residency, Chengam
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setView('public/mahal')}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    backgroundColor: '#C9A227',
                    color: '#0F172A',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Explore Hall
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPhotoId('aerial-mountain-view');
                    setGalleryModalOpen(true);
                  }}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={13} /> HD Drone
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Night Illumination */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <div style={{ height: '230px', backgroundImage: 'url("/images/sv-mahal-night.webp")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', top: '14px', right: '14px', backgroundColor: '#FFFFFF', padding: '5px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', boxShadow: 'var(--shadow-sm)' }}>
                1000+ Guests <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 500 }}>Capacity</span>
              </div>
              <div style={{ position: 'absolute', top: '14px', left: '14px', backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.72rem', fontWeight: 700, color: '#F1D675', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Sparkles size={11} style={{ display: 'inline', marginRight: '4px' }} /> Evening Spectacular
              </div>
            </div>
            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', fontFamily: 'var(--font-sans)' }}>
                SV Mahal Festive Night Illumination
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="#CBD5E1" /> Luxury AC Banquet Hall, Chengam
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setView('public/mahal')}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Book Hall Date
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPhotoId('campus-panoramic');
                    setGalleryModalOpen(true);
                  }}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={13} /> HD View
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2B. INTERACTIVE PROPERTY & SUITES PHOTO TOUR (ALL 10 REAL PHOTOGRAPHS) */}
      <PropertyPhotoTour />

      {/* 43 Authentic Wedding Decors & Stage Mandapam Showcase Preview */}
      <section style={{ padding: '60px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#C9A227', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#C9A227" /> IN-HOUSE DECORATOR PORTFOLIO
              </span>
              <h3 style={{ fontSize: '2.2rem', color: '#0F172A', margin: '6px 0 0 0', fontWeight: 800, fontFamily: 'var(--font-sans)' }}>
                43+ Grand Stage & Mandapam Themes
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '6px 0 0 0', maxWidth: '560px' }}>
                From sacred Vedic floral mandapams to illuminated evening reception backdrops, customize your wedding aesthetic at SV Mahal.
              </p>
            </div>
            <button
              onClick={() => setView('public/mahal')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: '1px solid #C9A227',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(15,23,42,0.1)'
              }}
            >
              Explore All 43 Designs <span>→</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              { id: 1, img: 'Decor1.jpg', title: 'Royal Gold Mandapam', type: 'Grand Mandapam' },
              { id: 7, img: 'Decor7.jpg', title: 'Ornate Temple Carvings', type: 'Vedic Wedding' },
              { id: 12, img: 'Decor12.jpg', title: 'Exotic Jasmine & Marigold', type: 'Floral Canopy' },
              { id: 24, img: 'Decor24.jpg', title: 'Illuminated Starlight Backdrop', type: 'Evening Reception' }
            ].map((d) => (
              <div
                key={d.id}
                onClick={() => setView('public/mahal')}
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#0F172A',
                  position: 'relative',
                  height: '240px',
                  cursor: 'pointer',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img
                  src={`/images/decors/${d.img}`}
                  alt={d.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.85)', color: '#F1D675', padding: '3px 8px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 700 }}>
                  {d.type}
                </div>
                <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px' }}>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '1rem', color: '#FFFFFF', fontWeight: 700 }}>
                    {d.title}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Design #{d.id} • Tap to view</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LUXURY INTERIORS SECTION (From mockup left-side selection list) */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              OUR GALLERY SHOWCASE
            </span>
            <h2 style={{ fontSize: '2.2rem', color: '#0F2942', fontWeight: 850 }}>Luxary interior</h2>
            <p style={{ color: '#64748B', maxWidth: '540px', margin: '0 auto', fontSize: '0.9rem' }}>
              Swipe or tap categories to inspect standard lodgings, deluxe rooms, penthouse patios, and halls.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '40px', alignItems: 'center' }}>
            
            {/* Left Selector vertical cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(Object.keys(interiorsData) as Array<keyof typeof interiorsData>).map((key) => {
                const isActive = selectedInterior === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedInterior(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      backgroundColor: isActive ? '#FFFFFF' : '#F8FAFC',
                      border: isActive ? '1px solid #0284C7' : '1px solid #E2E8F0',
                      boxShadow: isActive ? '0 10px 15px -3px rgba(2, 132, 199, 0.08)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.25s'
                    }}
                    className="interactive-hover-card"
                  >
                    {/* Circle badge */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#0284C7' : '#E2E8F0',
                        color: isActive ? '#FFFFFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                      }}
                    >
                      {key.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: isActive ? '#0F2942' : '#64748B' }}>
                        {interiorsData[key].title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: isActive ? '#0284C7' : '#94A3B8', fontWeight: 600 }}>
                        {interiorsData[key].category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Large Preview Image Frame */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: 'var(--shadow-md)'
              }}
              className="animate-scale-bounce"
            >
              <div style={{ borderRadius: '12px', overflow: 'hidden', height: '340px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <img
                  src={interiorsData[selectedInterior].image}
                  alt={interiorsData[selectedInterior].title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flexGrow: 1, maxWidth: '400px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#0F2942', fontWeight: 800 }}>
                    {interiorsData[selectedInterior].title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                    {interiorsData[selectedInterior].description}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      if (selectedInterior === 'hall') {
                        setView('public/mahal');
                      } else {
                        setView('public/rooms');
                      }
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#0F2942',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Specifications indicators */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                {interiorsData[selectedInterior].specs.map(spec => (
                  <div key={spec} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#475569', backgroundColor: '#F8FAFC', padding: '4px 10px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                    <Check size={12} color="#10B981" /> {spec}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Prime Location & Map section */}
      <section style={{ padding: '60px 0', backgroundColor: '#F8FAFC' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
            
            {/* Info details */}
            <div>
              <span style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                GET DIRECTIONS
              </span>
              <h2 style={{ fontSize: '2rem', color: '#0F2942', fontWeight: 800, marginBottom: '16px' }}>
                Convenient Highway Location
              </h2>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Situated directly on Chengam Main Highway Road. Perfect stop-over lodgings for devotees traveling to Tiruvannamalai Arunachaleswarar Temple (30 mins drive). Extended parking space fits up to 100+ wedding cars.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <MapPin size={18} color="#0284C7" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0F2942' }}>Address Details</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Main Road, Thukkapet, Chengam, Tamil Nadu - 606701</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Phone size={18} color="#0284C7" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0F2942' }}>Reservation & Assistance Helplines</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                        <strong>Manager Desk:</strong> <a href="tel:+919500821550" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 700 }}>+91 95008 21550</a>
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                        <strong>Bookings & Support:</strong> <a href="tel:+919043780215" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 700 }}>+91 90437 80215</a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '24px' }}>
                <a href="tel:+919500821550" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#0284C7', color: '#FFFFFF', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                  <Phone size={14} /> Call 95008 21550
                </a>
                <a href="tel:+919043780215" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#0369A1', color: '#FFFFFF', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                  <Phone size={14} /> Call 90437 80215
                </a>
                <a href="https://wa.me/919500821550?text=Hello%20SV%20Residency%2C%20I%20would%20like%20to%20inquire%20about%20room%20availability%20and%20rates." target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#16A34A', color: '#FFFFFF', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                  <MessageCircle size={15} /> WhatsApp Us
                </a>
                <a href="https://maps.app.goo.gl/zRvUWvK4A74i88W17" target="_blank" rel="noreferrer" style={{ padding: '10px 16px', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', backgroundColor: '#FFFFFF' }}>
                  View Map Directions
                </a>
              </div>
            </div>

            {/* Map Frame */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', height: '300px', position: 'relative', boxShadow: 'var(--shadow-md)', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#0F2942 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
              <div style={{ zIndex: 1, textAlign: 'center', padding: '24px' }}>
                <MapPin size={36} color="#DC2626" style={{ margin: '0 auto 8px auto' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#0F2942', fontWeight: 800 }}>SV.MAHAL & SV.RESIDENCY</h4>
                <p style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: '240px', margin: '0 auto 16px auto' }}>Main Road, Thukkapet, Chengam, Tamil Nadu - 606701</p>
                <a href="https://maps.app.goo.gl/zRvUWvK4A74i88W17" target="_blank" rel="noreferrer" style={{ padding: '8px 16px', backgroundColor: '#0F2942', color: '#FFFFFF', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 700, textDecoration: 'none' }}>Open Live Google Maps</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Lightbox Photo Explorer Modal */}
      <PropertyGalleryModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        initialPhotoId={selectedPhotoId}
      />

    </div>
  );
};
