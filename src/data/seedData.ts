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

export const SEED_CUSTOMERS: Customer[] = [];

export const SEED_BOOKINGS: Booking[] = [];

export const SEED_PAYMENTS: Payment[] = [];

export const SEED_EXPENSES: Expense[] = [];

export const SEED_LOGS: AuditLog[] = [];

export const SEED_NOTIFICATIONS: Notification[] = [];
