export interface PropertyPhoto {
  id: string;
  title: string;
  subtitle: string;
  category: 'rooms' | 'amenities' | 'aerial' | 'campus';
  categoryLabel: string;
  src: string;
  alt: string;
  badge?: string;
  aspectRatio: 'landscape' | 'portrait' | 'panoramic';
  description: string;
  highlights: string[];
  specs?: { label: string; value: string }[];
  bookingLink?: { text: string; view: 'public/rooms' | 'public/mahal' };
}

export const PROPERTY_PHOTOS: PropertyPhoto[] = [
  {
    id: 'aerial-mountain-view',
    title: 'Aerial Panoramic Vista & Mountain Horizon',
    subtitle: 'SV Thirumana Mahal & Residency Campus',
    category: 'aerial',
    categoryLabel: 'Aerial & Surroundings',
    src: '/images/property/aerial-mountain-view.jpg',
    alt: 'Aerial drone panoramic view of SV Thirumana Mahal with Western Ghats mountains and green paddy fields',
    badge: 'Drone View',
    aspectRatio: 'portrait',
    description: 'Breathtaking bird\'s-eye view showcasing the complete SV Thirumana Mahal and SV Residency complex against the tranquil backdrop of lush green agricultural paddy fields and majestic mountain ranges in Chengam. Features the distinctive terracotta-red terrace, ornate portico, and the holy temple shrine.',
    highlights: [
      'Scenic Eastern/Western Ghats Mountain Panorama',
      'Fresh Countryside Air & Quiet Natural Setting',
      'Large Rooftop Terrace & Portico Balconies',
      'Iconic "S.V. திருமண மஹால்" Landmark Signage'
    ],
    specs: [
      { label: 'Location', value: 'Chengam Highway, Tiruvannamalai Dt' },
      { label: 'Elevation', value: 'High-altitude scenic view' },
      { label: 'Environment', value: 'Surrounded by organic fields' }
    ],
    bookingLink: { text: 'Explore Wedding Hall', view: 'public/mahal' }
  },
  {
    id: 'campus-panoramic',
    title: 'Grand Campus & Wedding Hall Exterior',
    subtitle: 'Main Entrance & Multi-Facility Campus',
    category: 'campus',
    categoryLabel: 'Campus & Exterior',
    src: '/images/property/campus-panoramic.jpg',
    alt: 'Panoramic wide angle of SV Thirumana Mahal and SV Residency with entrance portico and temple',
    badge: 'Wide Angle',
    aspectRatio: 'panoramic',
    description: 'Ground-level panoramic perspective of the entire integrated hospitality complex. Displays the multi-story SV Thirumana Mahal banquet facility with tinted glass curtain wall, covered welcoming porch, paved driveway, and the adjacent dedicated SV Residency accommodation wing.',
    highlights: [
      'Integrated Wedding Hall & Guest Lodging Wings',
      'Spacious Interlocking Paver Courtyard',
      'Covered Drop-off Porch & Rain-sheltered Foyer',
      '200+ Vehicle Secured Parking Facility'
    ],
    specs: [
      { label: 'Total Capacity', value: '1,000+ Hall / 30+ Rooms' },
      { label: 'Parking', value: 'Cars, Buses & 2-Wheelers' },
      { label: 'Accessibility', value: 'Ramp & Lift Accessible' }
    ],
    bookingLink: { text: 'Book Event or Stay', view: 'public/rooms' }
  },
  {
    id: 'room-302-suite',
    title: 'Deluxe Suite (Executive Interior)',
    subtitle: '3rd Floor Executive Lodging',
    category: 'rooms',
    categoryLabel: 'Luxury Rooms',
    src: '/images/property/room-302-suite.jpg',
    alt: 'Spacious Deluxe Suite with King bed, TV console, wardrobe, and air conditioning',
    badge: 'Popular Choice',
    aspectRatio: 'landscape',
    description: 'A welcoming view stepping into the Deluxe Suite. Boasts custom dark-wood furnishings, an inviting King-sized bed adorned with crisp white linens, a floating entertainment console with LED flat-screen TV, split air conditioning, dressing vanity with mirror, and mirror-finished porcelain floor tiles.',
    highlights: [
      'Plush King-Sized Bed with Double Pillows',
      'Whisper-Quiet Split Air Conditioning & Ceiling Fan',
      'Wall-Mounted LED Smart TV on Wood Console',
      'Dedicated Wardrobe, Stool & Dressing Mirror Table'
    ],
    specs: [
      { label: 'Bed Type', value: 'King Bed' },
      { label: 'Capacity', value: '2 - 3 Guests' },
      { label: 'Cooling', value: 'Split AC + Fan' },
      { label: 'Key Access', value: 'Deluxe Suite Key Access' }
    ],
    bookingLink: { text: 'Book Deluxe Room', view: 'public/rooms' }
  },
  {
    id: 'room-deluxe-1',
    title: 'Executive King Bedroom Suite',
    subtitle: 'Modern Minimalist Comfort',
    category: 'rooms',
    categoryLabel: 'Luxury Rooms',
    src: '/images/property/room-deluxe-1.jpg',
    alt: 'Deluxe king bedroom suite interior with full bed view, vanity mirror, wardrobe, and AC',
    badge: 'AC Suite',
    aspectRatio: 'landscape',
    description: 'Meticulously maintained guest suite designed for ultimate comfort and relaxation after a long pilgrimage to Tiruvannamalai or festive wedding celebrations. Features bedside electrical ports, nightstand, complimentary packaged drinking water, and immaculate spotless hygiene.',
    highlights: [
      'Deep Sanitization Before Every Guest Check-in',
      'Bedside Charging Ports & Nightstand Lamp Lighting',
      'Generous Storage Wardrobe for Clothing & Luggage',
      'Full-Length Vanity Mirror with Dressing Table'
    ],
    specs: [
      { label: 'Cleanliness', value: '100% Sanitized Guarantee' },
      { label: 'Bathroom', value: 'Attached with 24/7 Geyser' },
      { label: 'Connectivity', value: 'High-speed Wi-Fi' }
    ],
    bookingLink: { text: 'Check Room Rates', view: 'public/rooms' }
  },
  {
    id: 'room-comfort-2',
    title: 'Cozy Double Bedroom Suite',
    subtitle: 'Comfort Stay for Pilgrims & Families',
    category: 'rooms',
    categoryLabel: 'Luxury Rooms',
    src: '/images/property/room-comfort-2.jpg',
    alt: 'Comfort bedroom suite with king bed, pristine linens, and floating entertainment console',
    badge: 'Great Value',
    aspectRatio: 'landscape',
    description: 'Comfort-oriented bedroom configuration offering soothing warm ambient lighting, sound-insulated windows, ergonomic study/work vanity, and private attached washroom. Ideal for families and spiritual travelers visiting Chengam and the holy hill of Arunachala.',
    highlights: [
      'Soothing Ambient Lighting & False Ceiling Recesses',
      'Soundproofed Wooden Solid-Core Entry Door',
      'Pristine Daily Housekeeping & Linen Refresh',
      '24/7 Hot & Cold Running Water'
    ],
    specs: [
      { label: 'Floor Options', value: '1st, 2nd & 3rd Floor' },
      { label: 'Occupancy', value: '2 Adults (+1 Child)' },
      { label: 'Power Backup', value: '100% Heavy Generator' }
    ],
    bookingLink: { text: 'Book This Room', view: 'public/rooms' }
  },
  {
    id: 'elevator-lobby',
    title: 'High-Speed Elevator & Granite Lobby',
    subtitle: 'Ground & Upper Floor Vertical Access',
    category: 'amenities',
    categoryLabel: 'Lobby & Amenities',
    src: '/images/property/elevator-lobby.jpg',
    alt: 'Modern stainless steel elevator with polished black granite cladding, natural timber framing, and warm spotlighting',
    badge: 'Modern Amenity',
    aspectRatio: 'landscape',
    description: 'State-of-the-art automatic passenger elevator framed in luxurious polished black galaxy granite with beige marble trims and warm teakwood ceiling beams. Ensures smooth, effortless vertical access to all guest rooms, dining halls, and banquet spaces for elderly guests, kids, and luggage.',
    highlights: [
      'Smooth Automatic Stainless Steel Passenger Lift',
      'Polished Black Galaxy Granite & Teak Architectural Finishes',
      'Bright Warm LED Downlights & Ambient False Ceiling',
      'Senior-Citizen & Wheelchair Accessible Design'
    ],
    specs: [
      { label: 'Speed', value: 'High-Speed Automatic' },
      { label: 'Accessibility', value: 'Elderly & Wheelchair Friendly' },
      { label: 'Emergency', value: 'ARD Automatic Rescue Device' }
    ],
    bookingLink: { text: 'View All Amenities', view: 'public/rooms' }
  },
  {
    id: 'reception-desk',
    title: '24/7 Front Desk & Welcoming Lobby',
    subtitle: 'Ground Floor Reception & Guest Assistance',
    category: 'amenities',
    categoryLabel: 'Lobby & Amenities',
    src: '/images/property/reception-desk.jpg',
    alt: 'Warm wooden reception counter with illuminated Balaji deity frame, ceiling AC, and staircase',
    badge: '24/7 Open',
    aspectRatio: 'landscape',
    description: 'Round-the-clock guest front desk managed by polite, attentive multilingual staff. Adorned with a sacred illuminated Lord Balaji sanctum frame, auspicious traditional accents, central cassette ceiling air conditioning, and convenient access to both the central elevator and granite staircase.',
    highlights: [
      'Instant Check-in & Digital Billing Terminal',
      'Luggage Assistance & Tour Guidance for Tiruvannamalai',
      'Auspicious Illuminated Sanctum Frame & Floral Garland',
      'CCTV Monitored 24/7 Security for Complete Peace of Mind'
    ],
    specs: [
      { label: 'Staffing', value: '24 Hours / 7 Days' },
      { label: 'Languages', value: 'Tamil, English, Telugu, Kannada' },
      { label: 'Payments', value: 'UPI, Cards, Cash Supported' }
    ],
    bookingLink: { text: 'Contact Desk', view: 'public/rooms' }
  },
  {
    id: 'scenic-corridor',
    title: 'Sunlit Marble Corridor with Mountain View',
    subtitle: 'Guest Floor Gallery & Natural Ventilation',
    category: 'amenities',
    categoryLabel: 'Lobby & Amenities',
    src: '/images/property/scenic-corridor.jpg',
    alt: 'Long corridor lined with marble tiles and large windows overlooking the mountain valley',
    badge: 'Scenic View',
    aspectRatio: 'portrait',
    description: 'Spacious, gleaming corridor lined with luxury Calacatta marble wall tiles and rich parquet wood-look floor tiles. Large exterior glass windows flood the entire passage with natural sunlight and gentle mountain breezes, offering guests panoramic vistas of Chengam’s green valleys right outside their room door.',
    highlights: [
      'Oversized Panoramic Windows with Mountain Valley Views',
      'Floor-to-Ceiling Polished White Calacatta Marble Tiles',
      'Non-slip Matte Wood-grain Floor Tiles for Safety',
      'Wide Passage Width for Effortless Luggage Trolley Movement'
    ],
    specs: [
      { label: 'Natural Light', value: '100% Daylit with fresh airflow' },
      { label: 'Flooring', value: 'Anti-skid Ceramic Parquet' },
      { label: 'Safety', value: 'Smoke detectors & Emergency lighting' }
    ],
    bookingLink: { text: 'View Rooms On This Floor', view: 'public/rooms' }
  },
  {
    id: 'temple-shrine',
    title: 'On-Campus Sri Vinayagar Temple Shrine',
    subtitle: 'Sacred Blessings for Auspicious Beginnings',
    category: 'campus',
    categoryLabel: 'Campus & Exterior',
    src: '/images/property/temple-shrine.jpg',
    alt: 'Traditional Hindu temple shrine with sculpted gopuram in front of SV Thirumana Mahal',
    badge: 'Sacred Heritage',
    aspectRatio: 'portrait',
    description: 'An authentic Dravidian-style sculpted Hindu temple shrine dedicated to Lord Ganesha (Sri Vinayagar) positioned right at the grand entrance. Couples and families begin their wedding rituals, muhurtham, and travels with divine blessings right on the venue premises.',
    highlights: [
      'Intricately Sculpted Multi-Tier Gopuram with Traditional Deities',
      'Daily Morning & Evening Poojas with Brass Temple Bell',
      'Auspicious Start for Weddings, Upanayanam & Baby Showers',
      'Located within the Secured Paved Courtyard'
    ],
    specs: [
      { label: 'Deity', value: 'Sri Ganapathi (Vinayagar)' },
      { label: 'Architecture', value: 'Traditional Dravidian Gopuram' },
      { label: 'Significance', value: 'Remover of Obstacles' }
    ],
    bookingLink: { text: 'Plan Wedding at SV Mahal', view: 'public/mahal' }
  },
  {
    id: 'courtyard-parking',
    title: 'Spacious Courtyard & Guest Accommodation Wing',
    subtitle: 'Dedicated Parking & Room Wing',
    category: 'campus',
    categoryLabel: 'Campus & Exterior',
    src: '/images/property/courtyard-parking.jpg',
    alt: 'Wide view of SV Thirumana Mahal courtyard, paver driveway, and residency block',
    badge: 'Vast Parking',
    aspectRatio: 'panoramic',
    description: 'Vast, fully paved interlocking stone courtyard linking the main wedding auditorium with the two-story SV Residency room wing. Offers expansive open space for wedding procession cars (maapillai azhaippu), baraat music bands, guest coach buses, and comfortable pedestrian movement.',
    highlights: [
      'Heavy-Duty Interlocking Paver Courtyard Flooring',
      'Dedicated Two-Story Room Wing with Continuous Balcony Verandah',
      'Ample Turning Radius for Tourist Buses & Caravans',
      'Well-Lit at Night with High-Mast Security Floodlights'
    ],
    specs: [
      { label: 'Surface', value: 'Paved Interlocking Concrete Pavers' },
      { label: 'Security', value: 'Gated compound with CCTV coverage' },
      { label: 'Capacity', value: '200+ Vehicles easily parked' }
    ],
    bookingLink: { text: 'Inquire Availability', view: 'public/mahal' }
  }
];

export const GALLERY_CATEGORIES = [
  { id: 'all', label: 'All Photos (10)' },
  { id: 'rooms', label: '🛏️ Rooms & Suites (3)' },
  { id: 'amenities', label: '✨ Lobby & Amenities (3)' },
  { id: 'aerial', label: '🌄 Drone & Scenic (2)' },
  { id: 'campus', label: '🛕 Campus & Temple (2)' }
] as const;
