import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Phone, Star, Search, ChevronRight, Check, Calendar, Users, Sparkles, Bed, Building, MessageCircle } from 'lucide-react';
import { OtaPartnersBanner } from '../components/OtaPartnersBanner';

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

  // Testimonial state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const interiorsData = {
    classic: {
      title: 'Classic Cozy Room',
      startingPrice: '₹1,500',
      description: 'Elegant air-conditioned rooms designed for standard transit stays, featuring premium linen, flat-screen TV, and modern attached washrooms.',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
      specs: ['Double Bed', 'Free High-Speed Wi-Fi', '24/7 Room Service', 'AC & Water Heater']
    },
    deluxe: {
      title: 'Grand Deluxe Room',
      startingPrice: '₹2,400',
      description: 'Spacious deluxe suites offering luxury seating areas, premium toiletries, complimentary refreshments, and panoramic city vistas.',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800',
      specs: ['King Size Bed', 'Complimentary Breakfast', 'Mini Fridge', 'Smart TV with Streaming']
    },
    terrace: {
      title: 'Large Penthouse Terrace',
      startingPrice: '₹4,500',
      description: 'Exclusive family-sized penthouse featuring a sprawling attached open-air terrace garden, ideal for peaceful evenings and starry nights.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
      specs: ['Two King Beds', 'Terrace Balcony', 'Outdoor Seating', 'Premium Mini Bar']
    },
    hall: {
      title: 'SV Mansion Hall',
      startingPrice: '₹1,00,000',
      description: 'Grand air-conditioned banquet hall with luxury lighting, grand entrance gates, professional acoustic speakers, and premium sofa configurations.',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
      specs: ['1000+ Guests Capacity', 'Auspicious Theme Florals', 'Two AC Green Rooms', '350 Capacity Dining Hall']
    }
  };

  const testimonials = [
    {
      quote: "The banquet hall at SV Mahal is outstanding. We celebrated my daughter's wedding here, and the lighting, decoration, and space management were flawless. Staff was extremely supportive.",
      author: "Mr. Rajendran G.",
      designation: "Chengam Local Resident",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
    },
    {
      quote: "Outstanding hotel rooms at SV Residency. Very clean, premium pearl-white styling, and located right on the main highway. Perfect lodging stay choice when visiting Tiruvannamalai temple.",
      author: "Aravind Swamy",
      designation: "Travel Blogger & Architect",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
    },
    {
      quote: "We reserved rooms for our wedding guest delegates here. Safe parking space, quick service, and standard GST billing system. Highly professional hospitality.",
      author: "Meenakshi Sundaram",
      designation: "Event Management Director",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'rooms') {
      setView('public/rooms');
      window.location.hash = `public/rooms?in=${checkIn}&out=${checkOut}&guests=${encodeURIComponent(guestsCount)}&range=${encodeURIComponent('₹1,500 - ₹4,500')}`;
    } else {
      setView('public/mahal');
      window.location.hash = `public/mahal?date=${eventDate || new Date().toISOString().split('T')[0]}&type=${eventType}&guests=${encodeURIComponent(eventGuests)}`;
    }
  };

  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '100vh', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      
      {/* 1. NEW REDESIGNED HERO SECTION (DIAGONAL LAYOUT & WARM CREAM) */}
      <section style={{ padding: '0', maxWidth: '100%', margin: '0 auto', position: 'relative', display: 'flex', flexWrap: 'wrap', minHeight: '80vh' }}>
        
        {/* Left Content Column */}
        <div style={{ flex: '1 1 500px', padding: '10% 5%', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, color: '#1E293B', margin: 0, lineHeight: 1.1, fontFamily: 'var(--font-sans)' }}>
            SV Residency for <span style={{ fontFamily: '"Caveat", cursive', color: '#C9A227', fontSize: '110%', fontWeight: 400 }}>memorable</span> moments rich in emotions
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#64748B', marginTop: '24px', marginBottom: '40px', maxWidth: '450px', lineHeight: 1.6 }}>
            We have 459 rooms spread throughout Chengam with room standards equivalent to 5 star hotels.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ backgroundColor: '#1E293B', color: '#FFFFFF', padding: '14px 32px', borderRadius: '30px', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px -5px rgba(30, 41, 59, 0.3)' }}>
              Take a tour <span style={{ backgroundColor: '#FFFFFF', color: '#1E293B', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>▶</span>
            </button>
          </div>
        </div>

        {/* Right Image Column with Diagonal Cut */}
        <div style={{ 
          flex: '1 1 500px', 
          position: 'relative', 
          minHeight: '400px',
          clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
          backgroundImage: 'url("/images/sv-mahal-day.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '-20px 0 50px rgba(0,0,0,0.1)'
        }}>
          {/* Floating Pink Badge */}
          <div style={{ position: 'absolute', top: '20%', right: '10%', backgroundColor: '#DB2777', color: '#FFFFFF', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 15px 30px rgba(219, 39, 119, 0.3)', transform: 'rotate(5deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={20} color="#FCE7F3" />
            <span style={{ fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>Get personalised<br/>offers now!!</span>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {/* Card 1 */}
          <div
            onClick={() => setView('public/rooms')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s',
              border: '1px solid #E2E8F0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <div style={{ height: '220px', backgroundImage: 'url("/images/sv-residency-exterior.webp")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', boxShadow: 'var(--shadow-sm)' }}>
                ₹1,500 <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>/ night</span>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0', fontFamily: 'var(--font-sans)' }}>SV Residency Lodging Stay</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="#CBD5E1" /> Main Road, Chengam Highway
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => setView('public/mahal')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s',
              border: '1px solid #E2E8F0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <div style={{ height: '220px', backgroundImage: 'url("/images/sv-mahal-day.webp")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', boxShadow: 'var(--shadow-sm)' }}>
                ₹1,00,000 <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>/ event</span>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0', fontFamily: 'var(--font-sans)' }}>SV Thirumana Mahal (Daytime Grandeur)</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="#CBD5E1" /> Opposite Residency, Chengam
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => setView('public/mahal')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s',
              border: '1px solid #E2E8F0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <div style={{ height: '220px', backgroundImage: 'url("/images/sv-mahal-night.webp")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', boxShadow: 'var(--shadow-sm)' }}>
                1000+ Guests <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>Capacity</span>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0', fontFamily: 'var(--font-sans)' }}>SV Mahal Festive Night Illumination</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="#CBD5E1" /> Luxury AC Banquet Hall, Chengam
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MakeMyTrip & Goibibo Partner Banner */}
      <OtaPartnersBanner />

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

      {/* 3. DYNAMIC INTERACTIVE TESTIMONIALS SEGMENT (Avatars layout from mockup) */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '80px 0 60px 0', position: 'relative' }}>
        
        {/* Dark Blue Wave Banner from mockup */}
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, #0F2942 0%, #1E3A5F 100%)',
              borderRadius: '24px',
              padding: '40px',
              color: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '30px',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background vector accents */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)' }} />
            
            {/* Quote details */}
            <div style={{ zIndex: 1 }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="#C9A227" color="#C9A227" />)}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#E2E8F0', marginBottom: '16px' }}>
                What our client say's
              </h3>
              
              <blockquote style={{ fontSize: '0.95rem', fontStyle: 'italic', margin: '0 0 20px 0', lineHeight: 1.6, color: '#CBD5E1' }}>
                "{testimonials[activeTestimonial].quote}"
              </blockquote>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].author}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0284C7' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{testimonials[activeTestimonial].author}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{testimonials[activeTestimonial].designation}</div>
                </div>
              </div>
            </div>

            {/* Dynamic floating avatars panel */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', zIndex: 1 }}>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>CLICK GUEST AVATARS TO LOAD STORIES</span>
              
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                {testimonials.map((test, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    style={{
                      background: 'none',
                      border: activeTestimonial === idx ? '3px solid #10B981' : '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '50%',
                      padding: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      transform: activeTestimonial === idx ? 'scale(1.15)' : 'scale(1)'
                    }}
                  >
                    <img
                      src={test.avatar}
                      alt={test.author}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                {testimonials.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: activeTestimonial === idx ? '#10B981' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

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
                        Starts at {interiorsData[key].startingPrice}
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
                <a href="https://maps.google.com/?q=SV+MAHAL+Chengam+Thukkapet" target="_blank" rel="noreferrer" style={{ padding: '10px 16px', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', backgroundColor: '#FFFFFF' }}>
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
                <a href="https://maps.google.com/?q=SV+MAHAL+Chengam+Thukkapet" target="_blank" rel="noreferrer" style={{ padding: '8px 16px', backgroundColor: '#0F2942', color: '#FFFFFF', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 700, textDecoration: 'none' }}>Open Live Google Maps</a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
