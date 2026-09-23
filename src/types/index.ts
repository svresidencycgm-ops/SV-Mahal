export type UserRole = 'admin' | 'manager' | 'public';

export interface Room {
  id: string;
  number: string;
  type: 'Standard' | 'Deluxe' | 'Premium' | 'Family' | 'Family Room' | 'Mahal Room';
  floor: string;
  capacity: number;
  bedType: string;
  price: number;
  amenities: string[];
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'Blocked';
  description: string;
  images: string[];
}

export interface MahalPackage {
  name: string;
  price: number;
  description: string;
  amenities: string[];
}

export interface MahalConfig {
  id: string;
  name: string;
  capacity: number;
  diningCapacity: number;
  price: number;
  packages: MahalPackage[];
  eventTypes: string[];
  amenities: string[];
}

export interface BookingFinancials {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  advancePaid: number;
  balanceDue: number;
  cgst?: number;
  sgst?: number;
  roundOff?: number;
  baseAmount?: number;
  razorpayPaymentId?: string;
  paymentTimestamp?: string;
}

export interface BookingEventDetails {
  eventType: string;
  decorator: boolean;
  catering: boolean;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  serviceType: 'room' | 'mahal';
  serviceId: string; // Room ID or Mahal ID
  roomIds?: string[]; // Actual assigned room IDs (multi-room support)
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD (rooms only)
  guestCount: number;
  roomCount?: number; // Rooms only
  idType: string;
  idNumber: string;
  specialRequirements: string;
  packageName?: string; // Mahal only
  eventDetails?: BookingEventDetails; // Mahal only
  financials: BookingFinancials;
  status: 'Inquiry' | 'Pending' | 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Completed' | 'Cancelled' | 'No-show' | 'Blocked' | 'Maintenance';
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid' | 'Refunded';
  createdBy: string;
  createdAt: string;
  bookingSource?: 'Online' | 'Offline' | 'MakeMyTrip' | 'Goibibo' | 'Direct';
  otaReference?: string; // e.g. MMT-8829104, GIB-4491023
  otaCommission?: number; // percentage, e.g. 15
  otaPayoutStatus?: 'Pending' | 'Settled';
  billingType?: 'GST' | 'Normal';
  actualCheckInTime?: string; // Auto-captured check-in time (e.g. YYYY-MM-DD HH:MM)
  actualCheckOutTime?: string; // Auto-captured check-out time (e.g. YYYY-MM-DD HH:MM)
  mahalCharges?: {
    electricity: number;
    rooms: number;
    generator: number;
    damages: number;
    other: number;
  };
  identityPic?: string;
  identityPics?: string[]; // Multiple Aadhar pics support
  companyName?: string;
  companyGst?: string;
  companyContact?: string; // Company contact details
  membersPic?: string; // Group photo of guests
  ebMeterCheckInPic?: string;
  ebMeterCheckInTime?: string;
  ebMeterCheckOutPic?: string;
  ebMeterCheckOutTime?: string;
  ebInitialUnits?: number;
  ebFinalUnits?: number;
  ebRate?: number;
  ebTotalAmount?: number;
  damageAmount?: number;
  damagePic?: string;
  damagePicTime?: string;
  damageReportText?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  date: string; // YYYY-MM-DD
  referenceNumber: string;
  recordedBy: string;
  notes: string;
}

export interface Expense {
  id: string;
  category: 'Maintenance' | 'Electricity' | 'Salary' | 'Cleaning' | 'Decoration' | 'Catering' | 'Supplies' | 'Other';
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  read: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface SearchResult {
  type: 'Customer' | 'Booking' | 'Invoice' | 'Payment';
  id: string;
  title: string;
  subtitle: string;
  hash: string;
}
