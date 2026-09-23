import type { Room, MahalConfig, Booking, Customer, Payment, Expense, AuditLog, Notification } from '../types';

export const SEED_ROOMS: Room[] = [
  // 1st Floor - 10 rooms (101-110)
  // Standard Rooms: 101-105
  {
    id: 'room-101',
    number: '101',
    type: 'Standard',
    floor: '1st Floor',
    capacity: 2,
    bedType: 'Queen Bed',
    price: 1500,
    amenities: ['Free Wi-Fi', 'TV', 'Intercom', 'Attached Bathroom'],
    status: 'Available',
    description: 'A comfortable standard room ideal for budget travelers, featuring essential amenities and a cozy queen bed.',
    images: []
  },
  {
    id: 'room-102',
    number: '102',
    type: 'Standard',
    floor: '1st Floor',
    capacity: 2,
    bedType: 'Queen Bed',
    price: 1500,
    amenities: ['Free Wi-Fi', 'TV', 'Intercom', 'Attached Bathroom'],
    status: 'Available',
    description: 'A comfortable standard room ideal for budget travelers, featuring essential amenities and a cozy queen bed.',
    images: []
  },
  {
    id: 'room-103',
    number: '103',
    type: 'Standard',
    floor: '1st Floor',
    capacity: 2,
    bedType: 'Queen Bed',
    price: 1500,
    amenities: ['Free Wi-Fi', 'TV', 'Intercom', 'Attached Bathroom'],
    status: 'Available',
    description: 'A comfortable standard room ideal for budget travelers, featuring essential amenities and a cozy queen bed.',
    images: []
  },
  {
    id: 'room-104',
    number: '104',
    type: 'Standard',
    floor: '1st Floor',
    capacity: 2,
    bedType: 'Queen Bed',
    price: 1500,
    amenities: ['Free Wi-Fi', 'TV', 'Intercom', 'Attached Bathroom'],
    status: 'Available',
    description: 'A comfortable standard room ideal for budget travelers, featuring essential amenities and a cozy queen bed.',
    images: []
  },
  {
    id: 'room-105',
    number: '105',
    type: 'Standard',
    floor: '1st Floor',
    capacity: 2,
    bedType: 'Queen Bed',
    price: 1500,
    amenities: ['Free Wi-Fi', 'TV', 'Intercom', 'Attached Bathroom'],
    status: 'Available',
    description: 'A comfortable standard room ideal for budget travelers, featuring essential amenities and a cozy queen bed.',
    images: []
  },
  // Deluxe Rooms: 106-110
  {
    id: 'room-106',
    number: '106',
    type: 'Deluxe',
    floor: '1st Floor',
    capacity: 2,
    bedType: 'King Bed',
    price: 2400,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Intercom', 'Hot Water'],
    status: 'Available',
    description: 'An elegant air-conditioned deluxe room featuring a spacious king bed, modern interiors, and mini-fridge.',
    images: []
  },
  {
    id: 'room-107',
    number: '107',
    type: 'Deluxe',
    floor: '1st Floor',
    capacity: 2,
    bedType: 'King Bed',
    price: 2400,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Intercom', 'Hot Water'],
    status: 'Available',
    description: 'An elegant air-conditioned deluxe room featuring a spacious king bed, modern interiors, and mini-fridge.',
    images: []
  },
  {
    id: 'room-108',
    number: '108',
    type: 'Deluxe',
    floor: '1st Floor',
    capacity: 2,
    bedType: 'King Bed',
    price: 2400,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Intercom', 'Hot Water'],
    status: 'Available',
    description: 'An elegant air-conditioned deluxe room featuring a spacious king bed, modern interiors, and mini-fridge.',
    images: []
  },
  {
    id: 'room-109',
    number: '109',
    type: 'Deluxe',
    floor: '1st Floor',
    capacity: 2,
    bedType: 'King Bed',
    price: 2400,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Intercom', 'Hot Water'],
    status: 'Available',
    description: 'An elegant air-conditioned deluxe room featuring a spacious king bed, modern interiors, and mini-fridge.',
    images: []
  },
  {
    id: 'room-110',
    number: '110',
    type: 'Deluxe',
    floor: '1st Floor',
    capacity: 2,
    bedType: 'King Bed',
    price: 2400,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Intercom', 'Hot Water'],
    status: 'Available',
    description: 'An elegant air-conditioned deluxe room featuring a spacious king bed, modern interiors, and mini-fridge.',
    images: []
  },

  // 2nd Floor - 10 rooms (201-210)
  // Premium Rooms: 201-205
  {
    id: 'room-201',
    number: '201',
    type: 'Premium',
    floor: '2nd Floor',
    capacity: 3,
    bedType: 'King + Single Bed',
    price: 3500,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Deposit Box', 'Balcony', 'Luxury Toiletries'],
    status: 'Available',
    description: 'A luxurious premium room offering partial town views from the balcony, a coffee maker, and premium bed set.',
    images: []
  },
  {
    id: 'room-202',
    number: '202',
    type: 'Premium',
    floor: '2nd Floor',
    capacity: 3,
    bedType: 'King + Single Bed',
    price: 3500,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Deposit Box', 'Balcony', 'Luxury Toiletries'],
    status: 'Available',
    description: 'A luxurious premium room offering partial town views from the balcony, a coffee maker, and premium bed set.',
    images: []
  },
  {
    id: 'room-203',
    number: '203',
    type: 'Premium',
    floor: '2nd Floor',
    capacity: 3,
    bedType: 'King + Single Bed',
    price: 3500,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Deposit Box', 'Balcony', 'Luxury Toiletries'],
    status: 'Available',
    description: 'A luxurious premium room offering partial town views from the balcony, a coffee maker, and premium bed set.',
    images: []
  },
  {
    id: 'room-204',
    number: '204',
    type: 'Premium',
    floor: '2nd Floor',
    capacity: 3,
    bedType: 'King + Single Bed',
    price: 3500,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Deposit Box', 'Balcony', 'Luxury Toiletries'],
    status: 'Available',
    description: 'A luxurious premium room offering partial town views from the balcony, a coffee maker, and premium bed set.',
    images: []
  },
  {
    id: 'room-205',
    number: '205',
    type: 'Premium',
    floor: '2nd Floor',
    capacity: 3,
    bedType: 'King + Single Bed',
    price: 3500,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Deposit Box', 'Balcony', 'Luxury Toiletries'],
    status: 'Available',
    description: 'A luxurious premium room offering partial town views from the balcony, a coffee maker, and premium bed set.',
    images: []
  },
  // Family Rooms: 206-210
  {
    id: 'room-206',
    number: '206',
    type: 'Family Room',
    floor: '2nd Floor',
    capacity: 4,
    bedType: '2 Double Beds',
    price: 4500,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Deposit Box', 'Separate Seating Area', 'Luxury Toiletries'],
    status: 'Available',
    description: 'Spacious family suite equipped with two double beds, dedicated lounge seating, and standard amenities for group comfort.',
    images: []
  },
  {
    id: 'room-207',
    number: '207',
    type: 'Family Room',
    floor: '2nd Floor',
    capacity: 4,
    bedType: '2 Double Beds',
    price: 4500,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Deposit Box', 'Separate Seating Area', 'Luxury Toiletries'],
    status: 'Available',
    description: 'Spacious family suite equipped with two double beds, dedicated lounge seating, and standard amenities for group comfort.',
    images: []
  },
  {
    id: 'room-208',
    number: '208',
    type: 'Family Room',
    floor: '2nd Floor',
    capacity: 4,
    bedType: '2 Double Beds',
    price: 4500,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Deposit Box', 'Separate Seating Area', 'Luxury Toiletries'],
    status: 'Available',
    description: 'Spacious family suite equipped with two double beds, dedicated lounge seating, and standard amenities for group comfort.',
    images: []
  },
  {
    id: 'room-209',
    number: '209',
    type: 'Family Room',
    floor: '2nd Floor',
    capacity: 4,
    bedType: '2 Double Beds',
    price: 4500,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Deposit Box', 'Separate Seating Area', 'Luxury Toiletries'],
    status: 'Available',
    description: 'Spacious family suite equipped with two double beds, dedicated lounge seating, and standard amenities for group comfort.',
    images: []
  },
  {
    id: 'room-210',
    number: '210',
    type: 'Family Room',
    floor: '2nd Floor',
    capacity: 4,
    bedType: '2 Double Beds',
    price: 4500,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Coffee Maker', 'Safe Deposit Box', 'Separate Seating Area', 'Luxury Toiletries'],
    status: 'Available',
    description: 'Spacious family suite equipped with two double beds, dedicated lounge seating, and standard amenities for group comfort.',
    images: []
  },

  // Mahal Guest Rooms (6 rooms: M101-M106)
  {
    id: 'room-m101',
    number: 'M101',
    type: 'Mahal Room',
    floor: 'Mahal',
    capacity: 2,
    bedType: 'Double Bed',
    price: 2000,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Attached Bathroom', 'Intercom'],
    status: 'Available',
    description: 'Cozy guest room located in the SV Mahal banquet wing, perfect for wedding guests and close relatives.',
    images: []
  },
  {
    id: 'room-m102',
    number: 'M102',
    type: 'Mahal Room',
    floor: 'Mahal',
    capacity: 2,
    bedType: 'Double Bed',
    price: 2000,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Attached Bathroom', 'Intercom'],
    status: 'Available',
    description: 'Cozy guest room located in the SV Mahal banquet wing, perfect for wedding guests and close relatives.',
    images: []
  },
  {
    id: 'room-m103',
    number: 'M103',
    type: 'Mahal Room',
    floor: 'Mahal',
    capacity: 2,
    bedType: 'Double Bed',
    price: 2000,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Attached Bathroom', 'Intercom'],
    status: 'Available',
    description: 'Cozy guest room located in the SV Mahal banquet wing, perfect for wedding guests and close relatives.',
    images: []
  },
  {
    id: 'room-m104',
    number: 'M104',
    type: 'Mahal Room',
    floor: 'Mahal',
    capacity: 2,
    bedType: 'Double Bed',
    price: 2000,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Attached Bathroom', 'Intercom'],
    status: 'Available',
    description: 'Cozy guest room located in the SV Mahal banquet wing, perfect for wedding guests and close relatives.',
    images: []
  },
  {
    id: 'room-m105',
    number: 'M105',
    type: 'Mahal Room',
    floor: 'Mahal',
    capacity: 2,
    bedType: 'Double Bed',
    price: 2000,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Attached Bathroom', 'Intercom'],
    status: 'Available',
    description: 'Cozy guest room located in the SV Mahal banquet wing, perfect for wedding guests and close relatives.',
    images: []
  },
  {
    id: 'room-m106',
    number: 'M106',
    type: 'Mahal Room',
    floor: 'Mahal',
    capacity: 2,
    bedType: 'Double Bed',
    price: 2000,
    amenities: ['Free Wi-Fi', 'AC', 'TV', 'Attached Bathroom', 'Intercom'],
    status: 'Available',
    description: 'Cozy guest room located in the SV Mahal banquet wing, perfect for wedding guests and close relatives.',
    images: []
  }
];

export const SEED_MAHAL: MahalConfig = {
  id: 'mahal-sv',
  name: 'SV Mahal Banquet Hall',
  capacity: 1000,
  diningCapacity: 350,
  price: 120000,
  packages: [
    {
      name: 'Basic',
      price: 100000,
      description: 'Banquet Hall rental only. Cleaning and basic setup included. Ideal for conferences and self-managed ceremonies.',
      amenities: ['AC Hall Access', 'Standard Chairs (1000)', 'Basic Stage Lighting', 'Two Green Rooms', 'Generator Backup']
    },
    {
      name: 'Standard',
      price: 150000,
      description: 'Hall rental with basic stage floral decoration, premium chair covers, red carpet welcome, and background audio setup.',
      amenities: ['AC Hall Access', 'Premium Seat Covers', 'Standard Floral Stage Decoration', 'Two Green Rooms', 'Sound System', 'Red Carpet Entry', 'Generator Backup']
    },
    {
      name: 'Premium',
      price: 220000,
      description: 'All-inclusive premium experience featuring luxury theme floral decoration, background LED screen, welcoming setup, and buffet equipment.',
      amenities: ['AC Hall Access', 'Luxury Sofa Seating on Stage', 'Premium Theme Stage Floral Decor', 'Two Green Rooms', 'Stage Backdrop LED Screen (16x9)', 'Professional Audio Setup', 'Buffet Food Warming Tables', 'Welcome Desk Service', 'Generator Backup']
    }
  ],
  eventTypes: ['Wedding', 'Reception', 'Engagement', 'Birthday', 'Corporate Event', 'Conference', 'Other Functions'],
  amenities: [
    'Fully Air-Conditioned Hall',
    '1000+ Seating Capacity',
    '350-Seat Dining Hall',
    'Spacious Parking (100+ vehicles)',
    'Grand Stage with LED Support',
    'Two Air-Conditioned Green Rooms',
    'High-Capacity Generator Backup',
    'In-house Decor and AV Support'
  ]
};

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Barath Kumar',
    phone: '9876543210',
    email: 'barath@gmail.com',
    address: '12, Anna Nagar Main Road, Chennai, TN - 600040',
    notes: 'Premium customer. Prefers room 201 when staying. Regularly reserves for family events.',
    createdAt: '2026-06-15T12:00:00Z'
  },
  {
    id: 'CUST-002',
    name: 'Priya Sharma',
    phone: '9812345678',
    email: 'priya.sharma@yahoo.com',
    address: '76, Residency Road, Bangalore, KA - 560025',
    notes: 'Requested extra pillows in previous stays. Very detail-oriented.',
    createdAt: '2026-07-01T14:30:00Z'
  },
  {
    id: 'CUST-003',
    name: 'Rajesh Sekar',
    phone: '9944332211',
    email: 'rajesh.sekar@gmail.com',
    address: '45, Main Road, Thukkapet, Chengam, TN - 606701',
    notes: 'Local merchant in Chengam. High trust customer.',
    createdAt: '2026-07-10T10:15:00Z'
  },
  {
    id: 'CUST-004',
    name: 'Anjali Das',
    phone: '9003322114',
    email: 'anjali.das@outlook.com',
    address: '102, Car Street, Tiruvannamalai, TN - 606601',
    notes: 'Requires invoice to be emailed immediately.',
    createdAt: '2026-07-20T16:45:00Z'
  },
  {
    id: 'CUST-005',
    name: 'Vikram Malhotra',
    phone: '9112233445',
    email: 'vikram.m@gmail.com',
    address: 'Flat 403, Prestige Heights, Bangalore, KA - 560102',
    notes: 'Vegetarian catering inquiries.',
    createdAt: '2026-08-01T09:00:00Z'
  }
];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'ROOM-2026-0001',
    customerName: 'Barath Kumar',
    customerPhone: '9876543210',
    customerEmail: 'barath@gmail.com',
    customerAddress: '12, Anna Nagar Main Road, Chennai, TN - 600040',
    serviceType: 'room',
    serviceId: 'room-101',
    roomIds: ['room-101', 'room-102'],
    checkInDate: '2026-08-01',
    checkOutDate: '2026-08-05',
    guestCount: 4,
    roomCount: 2,
    idType: 'Aadhaar Card',
    idNumber: '1234 5678 9012',
    specialRequirements: 'Rooms near elevator, early check-in at 10 AM.',
    financials: {
      subtotal: 12000, // 4 nights * 1500 * 2 rooms
      discount: 1000,
      tax: 1320, // 12% on (12000 - 1000)
      total: 12320,
      advancePaid: 12320,
      balanceDue: 0
    },
    status: 'Completed',
    paymentStatus: 'Paid',
    createdBy: 'admin@svmahal.com',
    createdAt: '2026-07-15T11:00:00Z',
    bookingSource: 'Offline',
    billingType: 'GST'
  },
  {
    id: 'ROOM-2026-0002',
    customerName: 'Vikram Malhotra',
    customerPhone: '9112233445',
    customerEmail: 'vikram.m@gmail.com',
    customerAddress: 'Flat 403, Prestige Heights, Bangalore, KA - 560102',
    serviceType: 'room',
    serviceId: 'room-103',
    roomIds: ['room-103'],
    checkInDate: '2026-08-14',
    checkOutDate: '2026-08-18',
    guestCount: 2,
    roomCount: 1,
    idType: 'Driver License',
    idNumber: 'KA-03-20150998',
    specialRequirements: 'Quiet room requested. Balcony preferred.',
    financials: {
      subtotal: 10000, // 4 nights * 2500
      discount: 0,
      tax: 1200, // 12% GST
      total: 11200,
      advancePaid: 6200,
      balanceDue: 5000
    },
    status: 'Checked-in',
    paymentStatus: 'Partially Paid',
    createdBy: 'manager@svmahal.com',
    createdAt: '2026-08-10T15:20:00Z',
    bookingSource: 'Offline',
    billingType: 'GST'
  },
  {
    id: 'ROOM-2026-0003',
    customerName: 'Priya Sharma',
    customerPhone: '9812345678',
    customerEmail: 'priya.sharma@yahoo.com',
    customerAddress: '76, Residency Road, Bangalore, KA - 560025',
    serviceType: 'room',
    serviceId: 'room-201',
    roomIds: ['room-201'],
    checkInDate: '2026-08-15',
    checkOutDate: '2026-08-17',
    guestCount: 3,
    roomCount: 1,
    idType: 'Passport',
    idNumber: 'Z-9876543',
    specialRequirements: 'Late check-out request.',
    financials: {
      subtotal: 7000, // 2 nights * 3500
      discount: 500,
      tax: 780, // 12% on 6500
      total: 7280,
      advancePaid: 7280,
      balanceDue: 0
    },
    status: 'Checked-in',
    paymentStatus: 'Paid',
    createdBy: 'admin@svmahal.com',
    createdAt: '2026-08-12T09:40:00Z',
    bookingSource: 'Offline',
    billingType: 'GST'
  },
  {
    id: 'ROOM-2026-0004',
    customerName: 'Anjali Das',
    customerPhone: '9003322114',
    customerEmail: 'anjali.das@outlook.com',
    customerAddress: '102, Car Street, Tiruvannamalai, TN - 606601',
    serviceType: 'room',
    serviceId: 'room-104',
    roomIds: ['room-104'],
    checkInDate: '2026-09-01',
    checkOutDate: '2026-09-03',
    guestCount: 2,
    roomCount: 1,
    idType: 'Aadhaar Card',
    idNumber: 'VERIFIED-OTP', // matches the public OTP login source request filter
    specialRequirements: 'Booked via public website check-out portal.',
    financials: {
      subtotal: 5000, // 2 nights * 2500
      discount: 0,
      tax: 600,
      total: 5600,
      advancePaid: 0,
      balanceDue: 5600
    },
    status: 'Confirmed',
    paymentStatus: 'Unpaid',
    createdBy: 'manager@svmahal.com',
    createdAt: '2026-08-15T16:00:00Z',
    bookingSource: 'Online',
    billingType: 'GST'
  },
  {
    id: 'ROOM-2026-0005',
    customerName: 'Rajesh Sekar',
    customerPhone: '9944332211',
    customerEmail: 'rajesh.sekar@gmail.com',
    customerAddress: '45, Main Road, Thukkapet, Chengam, TN - 606701',
    serviceType: 'room',
    serviceId: 'room-202',
    roomIds: ['room-202'],
    checkInDate: '2026-09-10',
    checkOutDate: '2026-09-14',
    guestCount: 2,
    roomCount: 1,
    idType: 'PAN Card',
    idNumber: 'ABCDE1234F',
    specialRequirements: 'Extra towels.',
    financials: {
      subtotal: 14000, // 4 nights * 3500
      discount: 1000,
      tax: 1560,
      total: 14560,
      advancePaid: 3000,
      balanceDue: 11560
    },
    status: 'Confirmed',
    paymentStatus: 'Partially Paid',
    createdBy: 'admin@svmahal.com',
    createdAt: '2026-08-14T11:20:00Z',
    bookingSource: 'Offline',
    billingType: 'GST'
  },
  {
    id: 'MAHAL-2026-0001',
    customerName: 'Rajesh Sekar',
    customerPhone: '9944332211',
    customerEmail: 'rajesh.sekar@gmail.com',
    customerAddress: '45, Main Road, Thukkapet, Chengam, TN - 606701',
    serviceType: 'mahal',
    serviceId: 'mahal-sv',
    checkInDate: '2026-08-15',
    checkOutDate: '2026-08-15',
    guestCount: 800,
    idType: 'Aadhaar Card',
    idNumber: '2233 4455 6677',
    specialRequirements: 'Need stage setup ready by 14th Aug evening. Buffet setup in dining hall.',
    packageName: 'Premium',
    eventDetails: {
      eventType: 'Wedding',
      decorator: true,
      catering: true
    },
    financials: {
      subtotal: 220000, // Premium Package Base
      discount: 10000,
      tax: 37800, // 18% GST on 210000
      total: 247800,
      advancePaid: 247800,
      balanceDue: 0
    },
    status: 'Completed',
    paymentStatus: 'Paid',
    createdBy: 'admin@svmahal.com',
    createdAt: '2026-07-01T10:00:00Z',
    bookingSource: 'Offline',
    billingType: 'GST',
    mahalCharges: {
      electricity: 0,
      rooms: 0,
      generator: 0,
      damages: 0,
      other: 0
    }
  },
  {
    id: 'MAHAL-2026-0002',
    customerName: 'Priya Sharma',
    customerPhone: '9812345678',
    customerEmail: 'priya.sharma@yahoo.com',
    customerAddress: '76, Residency Road, Bangalore, KA - 560025',
    serviceType: 'mahal',
    serviceId: 'mahal-sv',
    checkInDate: '2026-09-05',
    checkOutDate: '2026-09-05',
    guestCount: 400,
    idType: 'Aadhaar Card',
    idNumber: '8877 6655 4433',
    specialRequirements: 'Catering is external, decoration in-house.',
    packageName: 'Standard',
    eventDetails: {
      eventType: 'Engagement',
      decorator: true,
      catering: false
    },
    financials: {
      subtotal: 150000, // Standard Package
      discount: 0,
      tax: 27000, // 18% GST
      total: 177000,
      advancePaid: 50000,
      balanceDue: 127000
    },
    status: 'Confirmed',
    paymentStatus: 'Partially Paid',
    createdBy: 'manager@svmahal.com',
    createdAt: '2026-08-05T14:00:00Z',
    bookingSource: 'Offline',
    billingType: 'GST',
    mahalCharges: {
      electricity: 0,
      rooms: 0,
      generator: 0,
      damages: 0,
      other: 0
    }
  },
  {
    id: 'MAHAL-2026-0003',
    customerName: 'Barath Kumar',
    customerPhone: '9876543210',
    customerEmail: 'barath@gmail.com',
    customerAddress: '12, Anna Nagar Main Road, Chennai, TN - 600040',
    serviceType: 'mahal',
    serviceId: 'mahal-sv',
    checkInDate: '2026-10-10',
    checkOutDate: '2026-10-10',
    guestCount: 950,
    idType: 'Aadhaar Card',
    idNumber: '5566 7788 9900',
    specialRequirements: 'Requires full LED panel setup, floral decorations with red theme.',
    packageName: 'Premium',
    eventDetails: {
      eventType: 'Reception',
      decorator: true,
      catering: true
    },
    financials: {
      subtotal: 220000,
      discount: 15000,
      tax: 36900, // 18% on 205000
      total: 241900,
      advancePaid: 100000,
      balanceDue: 141900
    },
    status: 'Confirmed',
    paymentStatus: 'Partially Paid',
    createdBy: 'admin@svmahal.com',
    createdAt: '2026-08-01T15:30:00Z',
    bookingSource: 'Offline',
    billingType: 'GST',
    mahalCharges: {
      electricity: 0,
      rooms: 0,
      generator: 0,
      damages: 0,
      other: 0
    }
  },
  {
    id: 'MAHAL-2026-0004',
    customerName: 'Anjali Das',
    customerPhone: '9003322114',
    customerEmail: 'anjali.das@outlook.com',
    customerAddress: '102, Car Street, Tiruvannamalai, TN - 606601',
    serviceType: 'mahal',
    serviceId: 'mahal-sv',
    checkInDate: '2026-08-22',
    checkOutDate: '2026-08-22',
    guestCount: 200,
    idType: 'Aadhaar Card',
    idNumber: 'VERIFIED-OTP', // matches the pending request otp login check
    specialRequirements: 'Decoration support needed.',
    packageName: 'Basic',
    eventDetails: {
      eventType: 'Birthday',
      decorator: false,
      catering: false
    },
    financials: {
      subtotal: 100000,
      discount: 5000,
      tax: 17100, // 18% on 95000
      total: 112100,
      advancePaid: 0,
      balanceDue: 112100
    },
    status: 'Pending',
    paymentStatus: 'Unpaid',
    createdBy: 'manager@svmahal.com',
    createdAt: '2026-08-15T09:00:00Z',
    bookingSource: 'Online',
    billingType: 'GST',
    mahalCharges: {
      electricity: 0,
      rooms: 0,
      generator: 0,
      damages: 0,
      other: 0
    }
  },
  {
    id: 'MAHAL-2026-0005',
    customerName: 'System Block',
    customerPhone: 'N/A',
    customerEmail: 'N/A',
    customerAddress: 'N/A',
    serviceType: 'mahal',
    serviceId: 'mahal-sv',
    checkInDate: '2026-11-15',
    checkOutDate: '2026-11-15',
    guestCount: 0,
    idType: 'N/A',
    idNumber: 'N/A',
    specialRequirements: 'Scheduled hall maintenance and ceiling electrical works.',
    packageName: 'Basic',
    eventDetails: {
      eventType: 'Other Functions',
      decorator: false,
      catering: false
    },
    financials: {
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      advancePaid: 0,
      balanceDue: 0
    },
    status: 'Blocked',
    paymentStatus: 'Unpaid',
    createdBy: 'admin@svmahal.com',
    createdAt: '2026-08-16T10:00:00Z',
    bookingSource: 'Offline',
    billingType: 'GST',
    mahalCharges: {
      electricity: 0,
      rooms: 0,
      generator: 0,
      damages: 0,
      other: 0
    }
  }
];

export const SEED_PAYMENTS: Payment[] = [
  {
    id: 'PAY-2026-0001',
    bookingId: 'ROOM-2026-0001',
    customerName: 'Barath Kumar',
    amount: 12320,
    method: 'UPI',
    date: '2026-08-01',
    referenceNumber: 'UPI887644332211',
    recordedBy: 'admin@svmahal.com',
    notes: 'Full payment received at check-in.'
  },
  {
    id: 'PAY-2026-0002',
    bookingId: 'ROOM-2026-0002',
    customerName: 'Vikram Malhotra',
    amount: 6200,
    method: 'Cash',
    date: '2026-08-14',
    referenceNumber: 'N/A',
    recordedBy: 'manager@svmahal.com',
    notes: 'Partial advance paid in cash.'
  },
  {
    id: 'PAY-2026-0003',
    bookingId: 'ROOM-2026-0003',
    customerName: 'Priya Sharma',
    amount: 7280,
    method: 'Card',
    date: '2026-08-15',
    referenceNumber: 'TXN5544998822',
    recordedBy: 'admin@svmahal.com',
    notes: 'Paid via Visa Credit Card.'
  },
  {
    id: 'PAY-2026-0004',
    bookingId: 'ROOM-2026-0005',
    customerName: 'Rajesh Sekar',
    amount: 3000,
    method: 'UPI',
    date: '2026-08-14',
    referenceNumber: 'UPI998822110034',
    recordedBy: 'admin@svmahal.com',
    notes: 'Booking reservation token advance.'
  },
  {
    id: 'PAY-2026-0005',
    bookingId: 'MAHAL-2026-0001',
    customerName: 'Rajesh Sekar',
    amount: 100000,
    method: 'Bank Transfer',
    date: '2026-07-01',
    referenceNumber: 'IMPS44321109988',
    recordedBy: 'admin@svmahal.com',
    notes: 'Initial booking token advance.'
  },
  {
    id: 'PAY-2026-0006',
    bookingId: 'MAHAL-2026-0001',
    customerName: 'Rajesh Sekar',
    amount: 147800,
    method: 'Bank Transfer',
    date: '2026-08-14',
    referenceNumber: 'NEFTR88772211',
    recordedBy: 'admin@svmahal.com',
    notes: 'Final balance settlement before event.'
  },
  {
    id: 'PAY-2026-0007',
    bookingId: 'MAHAL-2026-0002',
    customerName: 'Priya Sharma',
    amount: 50000,
    method: 'UPI',
    date: '2026-08-05',
    referenceNumber: 'UPI112233445566',
    recordedBy: 'manager@svmahal.com',
    notes: 'Mahal booking advance.'
  },
  {
    id: 'PAY-2026-0008',
    bookingId: 'MAHAL-2026-0003',
    customerName: 'Barath Kumar',
    amount: 100000,
    method: 'Card',
    date: '2026-08-01',
    referenceNumber: 'TXN8899776655',
    recordedBy: 'admin@svmahal.com',
    notes: 'Mahal premium reservation advance.'
  }
];

export const SEED_EXPENSES: Expense[] = [
  {
    id: 'EXP-2026-0001',
    category: 'Electricity',
    amount: 18500,
    date: '2026-08-05',
    description: 'Monthly electricity bill for residency and Mahal main meter.',
    paymentMethod: 'Bank Transfer',
    recordedBy: 'admin@svmahal.com'
  },
  {
    id: 'EXP-2026-0002',
    category: 'Salary',
    amount: 45000,
    date: '2026-08-01',
    description: 'Monthly salaries for housekeeping staff (3 persons).',
    paymentMethod: 'Cash',
    recordedBy: 'admin@svmahal.com'
  },
  {
    id: 'EXP-2026-0003',
    category: 'Salary',
    amount: 25000,
    date: '2026-08-01',
    description: 'Monthly salary for Manager.',
    paymentMethod: 'Bank Transfer',
    recordedBy: 'admin@svmahal.com'
  },
  {
    id: 'EXP-2026-0004',
    category: 'Maintenance',
    amount: 8000,
    date: '2026-08-08',
    description: 'Generator service charge and fuel top-up (50 Liters diesel).',
    paymentMethod: 'Cash',
    recordedBy: 'manager@svmahal.com'
  },
  {
    id: 'EXP-2026-0005',
    category: 'Cleaning',
    amount: 3200,
    date: '2026-08-03',
    description: 'Purchase of housekeeping supplies (detergents, air freshners, floor cleaners).',
    paymentMethod: 'UPI',
    recordedBy: 'manager@svmahal.com'
  },
  {
    id: 'EXP-2026-0006',
    category: 'Decoration',
    amount: 15000,
    date: '2026-08-14',
    description: 'Floral sourcing and backdrop design fee for Rajesh Sekar wedding event.',
    paymentMethod: 'UPI',
    recordedBy: 'manager@svmahal.com'
  },
  {
    id: 'EXP-2026-0007',
    category: 'Catering',
    amount: 28000,
    date: '2026-08-15',
    description: 'Staff support and utensils arrangement for wedding menu catering.',
    paymentMethod: 'Bank Transfer',
    recordedBy: 'admin@svmahal.com'
  }
];

export const SEED_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-08-16T10:00:00Z',
    user: 'admin@svmahal.com',
    action: 'System Initialized',
    entity: 'System',
    entityId: 'SYSTEM'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-08-16T10:01:00Z',
    user: 'admin@svmahal.com',
    action: 'Seed Data Loaded',
    entity: 'System',
    entityId: 'SEED'
  }
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOTIF-001',
    title: 'New Booking Request',
    message: 'Mahal booking MAHAL-2026-0004 is pending review for 2026-08-22.',
    type: 'warning',
    read: false,
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'NOTIF-002',
    title: 'Payment Received',
    message: 'UPI payment of ₹7,280 received for booking ROOM-2026-0003.',
    type: 'success',
    read: true,
    createdAt: '2026-08-15T09:40:00Z'
  },
  {
    id: 'NOTIF-003',
    title: 'Upcoming Mahal Event',
    message: 'Mahal booking MAHAL-2026-0002 is scheduled in 20 days (2026-09-05).',
    type: 'info',
    read: false,
    createdAt: '2026-08-16T09:30:00Z'
  }
];
