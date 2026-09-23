import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { storageService } from '../services/storage';
import { bookingService } from '../services/bookingService';
import { invoiceService } from '../services/invoiceService';
import type {
  Booking,
  Room,
  MahalConfig,
  Customer,
  Payment,
  Expense,
  AuditLog,
  Notification,
  UserRole,
  SearchResult
} from '../types';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

interface AppContextType {
  rooms: Room[];
  mahalConfig: MahalConfig;
  bookings: Booking[];
  customers: Customer[];
  payments: Payment[];
  expenses: Expense[];
  logs: AuditLog[];
  notifications: Notification[];
  currentView: string;
  currentUserRole: UserRole;
  selectedBooking: Booking | null;
  toasts: ToastItem[];
  customerUser: { name: string; phone: string; email: string } | null;
  
  // Basic State Setters / Navigators
  setView: (view: string) => void;
  setUserRole: (role: UserRole) => void;
  setSelectedBooking: (booking: Booking | null) => void;
  loginCustomer: (name: string, phone: string, email: string) => void;
  logoutCustomer: () => void;
  
  // Toast operations
  addToast: (title: string, message: string, type: ToastItem['type']) => void;
  removeToast: (id: string) => void;

  // Bookings CRUD
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'createdBy' | 'paymentStatus'>) => { success: boolean; id?: string; error?: string };
  updateBooking: (booking: Booking) => { success: boolean; error?: string };
  cancelBooking: (bookingId: string) => void;
  deleteBooking: (bookingId: string) => void;

  // Payments CRUD
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  deletePayment: (paymentId: string) => void;

  // Expenses CRUD
  addExpense: (expense: Omit<Expense, 'id' | 'recordedBy'>) => void;
  deleteExpense: (expenseId: string) => void;

  // Customers CRUD
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (customer: Customer) => void;

  // Rooms Management
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;

  // Mahal Management
  updateMahal: (config: MahalConfig) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Global Actions
  globalSearch: (query: string) => SearchResult[];
  exportAppData: () => string;
  importAppData: (json: string) => boolean;
  resetAppData: () => void;

  // Localization
  currentLanguage: 'en' | 'ta';
  setLanguage: (lang: 'en' | 'ta') => void;
  translate: (key: string) => string;

  // Derived Selectors
  getCustomerMetrics: (phone: string) => {
    totalBookings: number;
    totalSpent: number;
    outstandingAmount: number;
    lastBookingDate: string;
    bookings: Booking[];
    payments: Payment[];
  };
}

const translations = {
  en: {
    // Sidebar sections
    'section.dashboard': 'Dashboard & Reports',
    'section.hotel_rooms': 'Hotel Rooms Booking',
    'section.mahal_booking': 'Mahal Booking',
    'section.global_data': 'Global Data',
    
    // Sidebar pages
    'page.overview': 'Overview',
    'page.finance': 'Finance & Expenses',
    'page.reports': 'Reports & Analytics',
    'page.audit': 'Audit Logs',
    'page.offline_bookings': 'Offline Bookings',
    'page.online_bookings': 'Online Bookings',
    'page.onsite_booking': 'Onsite Desk Booking',
    'page.mahal_settings': 'Mahal Settings',
    'page.customers': 'Customers Database',
    'page.rooms': 'Rooms Inventory',
    'page.settings': 'Backup & Settings',
    'page.online_requests': 'Online Requests',

    // Dashboard Overview Header & Info
    'dash.title': 'SV Residency & Mahal Dashboard',
    'dash.subtitle': 'Unified Front-Desk Operations & Analytical Management System.',
    'dash.financial_health': 'Daily Operational Health',
    'dash.room_occupancy': 'Room Occupancy Rate',
    'dash.mahal_capacity': 'Mahal Capacity Rate',
    'dash.wedding_capacity': 'Wedding Capacity',
    'dash.checkins_today': 'Check-ins Wave',
    'dash.revenue_trend': 'Revenue & Expense Flow',
    'dash.rooms_matrix': 'Rooms Inventory Matrix',
    'dash.quick_actions': 'Operations Quick Desk',
    'dash.quick_checkin': 'New Room Check-in',
    'dash.quick_mahal': 'New Mahal Event',
    'dash.quick_cust': 'Manage Customers',
    'dash.room_status_clean': 'Clean',
    'dash.room_status_occupied': 'Occupied',
    'dash.room_status_dirty': 'Dirty',

    // Generic metrics
    'metric.room_stays': 'Room Stays',
    'metric.weddings': 'Weddings',
    'metric.balance': 'Outstanding Bal',
    'metric.customers': 'Customers DB',
    'metric.occupancy_rate': 'Occupancy Rate',
    'metric.capacity_rate': 'Capacity Rate',
  },
  ta: {
    // Sidebar sections
    'section.dashboard': 'டாஷ்போர்டு & அறிக்கைகள்',
    'section.hotel_rooms': 'ஹோட்டல் அறைகள் முன்பதிவு',
    'section.mahal_booking': 'மகால் முன்பதிவு',
    'section.global_data': 'பொதுவான தரவு',
    
    // Sidebar pages
    'page.overview': 'கண்ணோட்டம்',
    'page.finance': 'நிதி & செலவுகள்',
    'page.reports': 'அறிக்கைகள் & பகுப்பாய்வு',
    'page.audit': 'தணிக்கை பதிவுகள்',
    'page.offline_bookings': 'ஆஃப்லைன் முன்பதிவுகள்',
    'page.online_bookings': 'ஆன்நிலை முன்பதிவுகள்',
    'page.onsite_booking': 'அறை முன்பதிவு மேசை',
    'page.mahal_settings': 'மகால் அமைப்புகள்',
    'page.customers': 'வாடிக்கையாளர் தரவுத்தளம்',
    'page.rooms': 'அறைகள் இருப்பு',
    'page.settings': 'காப்புப்பிரதி & அமைப்புகள்',
    'page.online_requests': 'ஆன்லைன் கோரிக்கைகள்',

    // Dashboard Overview Header & Info
    'dash.title': 'எஸ்.வி ரெசிடென்சி & மகால் டாஷ்போர்டு',
    'dash.subtitle': 'ஒருங்கிணைந்த வரவேற்பு மேசை செயல்பாடுகள் மற்றும் பகுப்பாய்வு மேலாண்மை அமைப்பு.',
    'dash.financial_health': 'தினசரி செயல்பாட்டு ஆரோக்கியம்',
    'dash.room_occupancy': 'அறை தங்கும் வீதம்',
    'dash.mahal_capacity': 'மகால் கொள்ளளவு வீதம்',
    'dash.wedding_capacity': 'திருமண கொள்ளளவு',
    'dash.checkins_today': 'இன்றைய வருகைகள்',
    'dash.revenue_trend': 'வருவாய் & செலவு போக்கு',
    'dash.rooms_matrix': 'அறைகளின் இருப்பு நிலை',
    'dash.quick_actions': 'செயல்பாட்டு விரைவு மேசை',
    'dash.quick_checkin': 'புதிய அறை வருகை',
    'dash.quick_mahal': 'புதிய மகால் நிகழ்ச்சி',
    'dash.quick_cust': 'வாடிக்கையாளர் மேலாண்மை',
    'dash.room_status_clean': 'சுத்தமானது',
    'dash.room_status_occupied': 'தங்கியுள்ளது',
    'dash.room_status_dirty': 'அசுத்தமானது',

    // Generic metrics
    'metric.room_stays': 'அறை தங்குதல்கள்',
    'metric.weddings': 'திருமணங்கள்',
    'metric.balance': 'நிலுவைத் தொகை',
    'metric.customers': 'வாடிக்கையாளர்கள்',
    'metric.occupancy_rate': 'தங்கும் வீதம்',
    'metric.capacity_rate': 'கொள்ளளவு வீதம்',
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // App States loaded from LocalStorage
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mahalConfig, setMahalConfig] = useState<MahalConfig>({} as MahalConfig);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Navigation and Auth states
  const [currentView, setCurrentView] = useState<string>('public/home');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('public');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [customerUser, setCustomerUser] = useState<{ name: string; phone: string; email: string } | null>(null);

  // Localization states
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ta'>('en');

  const translate = (key: string): string => {
    const langDict = (translations as any)[currentLanguage];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const enDict = (translations as any)['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return key;
  };

  // Initialize and load data on startup
  useEffect(() => {
    storageService.initialize();
    loadAllData();

    // Setup hash router listener
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        // Handle routing based on role permissions
        if (hash.startsWith('crm/') && currentUserRole === 'public') {
          // Public role cannot access CRM, redirect
          setView('public/home');
        } else {
          setCurrentView(hash);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    if (window.location.hash) {
      handleHashChange();
    } else {
      window.location.hash = 'public/home';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUserRole]);

  const loadAllData = () => {
    setRooms(storageService.getRooms());
    setMahalConfig(storageService.getMahal());
    setBookings(storageService.getBookings());
    setCustomers(storageService.getCustomers());
    setPayments(storageService.getPayments());
    setExpenses(storageService.getExpenses());
    setLogs(storageService.getLogs());
    setNotifications(storageService.getNotifications());

    const userStr = localStorage.getItem('customer_user');
    if (userStr) {
      try {
        setCustomerUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse customer_user:', e);
      }
    }
  };

  // Navigations
  const setView = (view: string) => {
    setCurrentView(view);
    window.location.hash = view;
  };

  const setUserRole = (role: UserRole) => {
    setCurrentUserRole(role);
    if (role === 'public') {
      setView('public/home');
    } else {
      setView('crm/overview');
    }
    addLog(`Switched role to ${role}`, 'Auth', role);
  };

  // Toast Management
  const addToast = (title: string, message: string, type: ToastItem['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Audit Log helper
  const addLog = (action: string, entity: string, entityId: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      user: currentUserRole === 'public' ? 'Public Customer' : (currentUserRole === 'admin' ? 'admin@svmahal.com' : 'manager@svmahal.com'),
      action,
      entity,
      entityId
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    storageService.saveLogs(updatedLogs);
  };

  // Notification helper
  const triggerNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    storageService.saveNotifications(updatedNotifs);
    addToast(title, message, type);
  };

  // Customer Autocreation check
  const checkAndCreateCustomer = (name: string, phone: string, email: string, address: string) => {
    const trimmedPhone = phone.trim();
    const existing = customers.find(c => c.phone.trim() === trimmedPhone);
    if (existing) {
      return existing;
    }
    
    // Create new customer
    const newCust: Customer = {
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      name: name.trim(),
      phone: trimmedPhone,
      email: email.trim(),
      address: address.trim(),
      notes: 'Auto-created via booking system.',
      createdAt: new Date().toISOString()
    };
    const updatedCustomers = [...customers, newCust];
    setCustomers(updatedCustomers);
    storageService.saveCustomers(updatedCustomers);
    addLog(`Created customer ${newCust.name}`, 'Customer', newCust.id);
    return newCust;
  };

  // Bookings CRUD
  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'createdBy' | 'paymentStatus'>) => {
    // 1. Conflict Prevention Checks
    if (bookingData.serviceType === 'mahal') {
      const check = bookingService.checkMahalAvailability(bookingData.checkInDate, bookings);
      if (!check.available) {
        return { success: false, error: check.error || 'Mahal is already booked for this date.' };
      }
    } else {
      // Room availability check
      const roomType = rooms.find(r => r.id === bookingData.serviceId)?.type || 'Standard';
      const check = bookingService.checkRoomAvailability(
        bookingData.checkInDate,
        bookingData.checkOutDate,
        roomType,
        bookingData.roomCount || 1,
        rooms,
        bookings
      );
      if (!check.available) {
        return { success: false, error: check.error || 'Rooms are not available for the selected dates.' };
      }
      bookingData.roomIds = check.availableRoomIds; // Assign the specific room IDs
    }

    // 2. Generate Booking ID
    const newId = bookingService.generateBookingId(bookingData.serviceType, bookingData.checkInDate, bookings);
    
    // 3. Create or Match Customer
    checkAndCreateCustomer(
      bookingData.customerName,
      bookingData.customerPhone,
      bookingData.customerEmail,
      bookingData.customerAddress
    );

    // 4. Build Booking
    const emailStr = currentUserRole === 'public' ? 'Public Guest' : (currentUserRole === 'admin' ? 'admin@svmahal.com' : 'manager@svmahal.com');
    const paymentStatus = bookingData.financials.advancePaid >= bookingData.financials.total 
      ? 'Paid' 
      : (bookingData.financials.advancePaid > 0 ? 'Partially Paid' : 'Unpaid');

    const bookingSource = bookingData.bookingSource || (currentUserRole === 'public' ? 'Online' : 'Offline');
    const billingType = bookingData.billingType || 'GST';
    const mahalCharges = bookingData.mahalCharges || { electricity: 0, rooms: 0, generator: 0, damages: 0, other: 0 };

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      paymentStatus,
      createdBy: emailStr,
      createdAt: new Date().toISOString(),
      bookingSource,
      billingType,
      mahalCharges
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    storageService.saveBookings(updatedBookings);

    // Update Room global statuses for active bookings checks
    if (newBooking.serviceType === 'room' && newBooking.status === 'Checked-in') {
      const updatedRooms = rooms.map(r => {
        if (newBooking.roomIds?.includes(r.id)) {
          return { ...r, status: 'Occupied' as const };
        }
        return r;
      });
      setRooms(updatedRooms);
      storageService.saveRooms(updatedRooms);
    }

    // Create Payment Record if advance payment is provided
    if (newBooking.financials.advancePaid > 0) {
      const newPayment: Payment = {
        id: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
        bookingId: newId,
        customerName: newBooking.customerName,
        amount: newBooking.financials.advancePaid,
        method: 'UPI', // Default for simulated website bookings
        date: newBooking.checkInDate,
        referenceNumber: `AUTO-${Date.now()}`,
        recordedBy: emailStr,
        notes: 'Advance booking payment'
      };
      const updatedPayments = [...payments, newPayment];
      setPayments(updatedPayments);
      storageService.savePayments(updatedPayments);
    }

    addLog(`Created booking ${newId}`, 'Booking', newId);
    triggerNotification(
      'New Booking Created',
      `Booking ${newId} (${newBooking.customerName}) has been created successfully.`,
      'success'
    );

    return { success: true, id: newId };
  };

  const updateBooking = (updatedBooking: Booking) => {
    // Conflict validation if dates or rooms have changed
    const original = bookings.find(b => b.id === updatedBooking.id);
    if (!original) return { success: false, error: 'Booking not found.' };

    const dateChanged = original.checkInDate !== updatedBooking.checkInDate || original.checkOutDate !== updatedBooking.checkOutDate;
    const countChanged = original.roomCount !== updatedBooking.roomCount || original.serviceId !== updatedBooking.serviceId;

    if (dateChanged || countChanged) {
      if (updatedBooking.serviceType === 'mahal') {
        const check = bookingService.checkMahalAvailability(updatedBooking.checkInDate, bookings, updatedBooking.id);
        if (!check.available) {
          return { success: false, error: check.error || 'Mahal is already booked for this date.' };
        }
      } else {
        const roomType = rooms.find(r => r.id === updatedBooking.serviceId)?.type || 'Standard';
        const check = bookingService.checkRoomAvailability(
          updatedBooking.checkInDate,
          updatedBooking.checkOutDate,
          roomType,
          updatedBooking.roomCount || 1,
          rooms,
          bookings,
          updatedBooking.id
        );
        if (!check.available) {
          return { success: false, error: check.error || 'Rooms are not available for the selected dates.' };
        }
        updatedBooking.roomIds = check.availableRoomIds;
      }
    }

    // Sync room statuses in system based on reservation status changes
    let updatedRooms = [...rooms];
    if (updatedBooking.serviceType === 'room') {
      if (updatedBooking.status === 'Checked-in') {
        updatedRooms = rooms.map(r => {
          if (updatedBooking.roomIds?.includes(r.id)) {
            return { ...r, status: 'Occupied' as const };
          }
          return r;
        });
      } else if (['Completed', 'Checked-out', 'Cancelled'].includes(updatedBooking.status)) {
        updatedRooms = rooms.map(r => {
          if (updatedBooking.roomIds?.includes(r.id) && r.status === 'Occupied') {
            return { ...r, status: 'Available' as const };
          }
          return r;
        });
      }
      setRooms(updatedRooms);
      storageService.saveRooms(updatedRooms);
    }

    const updatedBookings = bookings.map(b => (b.id === updatedBooking.id ? updatedBooking : b));
    setBookings(updatedBookings);
    storageService.saveBookings(updatedBookings);

    addLog(`Updated booking ${updatedBooking.id}`, 'Booking', updatedBooking.id);
    addToast('Booking Updated', `Details for booking ${updatedBooking.id} were updated.`, 'success');
    return { success: true };
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const cancelledBooking: Booking = {
      ...booking,
      status: 'Cancelled',
      paymentStatus: booking.financials.advancePaid > 0 ? 'Refunded' : 'Unpaid'
    };

    // If rooms, release room status
    if (booking.serviceType === 'room') {
      const updatedRooms = rooms.map(r => {
        if (booking.roomIds?.includes(r.id) && r.status === 'Occupied') {
          return { ...r, status: 'Available' as const };
        }
        return r;
      });
      setRooms(updatedRooms);
      storageService.saveRooms(updatedRooms);
    }

    const updatedBookings = bookings.map(b => (b.id === bookingId ? cancelledBooking : b));
    setBookings(updatedBookings);
    storageService.saveBookings(updatedBookings);

    addLog(`Cancelled booking ${bookingId}`, 'Booking', bookingId);
    triggerNotification(
      'Booking Cancelled',
      `Booking ${bookingId} has been cancelled and availability released.`,
      'warning'
    );
  };

  const deleteBooking = (bookingId: string) => {
    // Admin only rule
    if (currentUserRole !== 'admin') {
      addToast('Unauthorized', 'Only administrators can permanently delete records.', 'danger');
      return;
    }

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Release rooms first
    if (booking.serviceType === 'room') {
      const updatedRooms = rooms.map(r => {
        if (booking.roomIds?.includes(r.id)) {
          return { ...r, status: 'Available' as const };
        }
        return r;
      });
      setRooms(updatedRooms);
      storageService.saveRooms(updatedRooms);
    }

    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    setBookings(updatedBookings);
    storageService.saveBookings(updatedBookings);

    // Also remove matching payments
    const updatedPayments = payments.filter(p => p.bookingId !== bookingId);
    setPayments(updatedPayments);
    storageService.savePayments(updatedPayments);

    addLog(`Permanently deleted booking ${bookingId}`, 'Booking', bookingId);
    addToast('Booking Deleted', `Booking ${bookingId} was permanently deleted.`, 'danger');
  };

  // Payments CRUD
  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const parentBooking = bookings.find(b => b.id === paymentData.bookingId);
    if (!parentBooking) return;

    // Check payment amount vs balance due
    if (paymentData.amount <= 0) {
      addToast('Error', 'Payment amount must be greater than zero.', 'danger');
      return;
    }

    const newPayment: Payment = {
      ...paymentData,
      id: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`
    };

    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    storageService.savePayments(updatedPayments);

    // Filter payments specifically for this booking to calculate new balance
    const bookingPayments = updatedPayments.filter(p => p.bookingId === paymentData.bookingId);
    const updatedBooking = invoiceService.recalculateBalance(parentBooking, bookingPayments);

    const updatedBookings = bookings.map(b => (b.id === parentBooking.id ? updatedBooking : b));
    setBookings(updatedBookings);
    storageService.saveBookings(updatedBookings);

    addLog(`Recorded payment of ₹${paymentData.amount} for ${paymentData.bookingId}`, 'Payment', newPayment.id);
    triggerNotification(
      'Payment Received',
      `Recorded ₹${paymentData.amount} (${paymentData.method}) for booking ${paymentData.bookingId}. Status: ${updatedBooking.paymentStatus}.`,
      'success'
    );
  };

  const deletePayment = (paymentId: string) => {
    if (currentUserRole !== 'admin') {
      addToast('Unauthorized', 'Managers cannot delete payments / financial audit trails.', 'danger');
      return;
    }

    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const updatedPayments = payments.filter(p => p.id !== paymentId);
    setPayments(updatedPayments);
    storageService.savePayments(updatedPayments);

    // Recalculate parent booking balance
    const parentBooking = bookings.find(b => b.id === payment.bookingId);
    if (parentBooking) {
      const remainingPayments = updatedPayments.filter(p => p.bookingId === payment.bookingId);
      const updatedBooking = invoiceService.recalculateBalance(parentBooking, remainingPayments);
      const updatedBookings = bookings.map(b => (b.id === parentBooking.id ? updatedBooking : b));
      setBookings(updatedBookings);
      storageService.saveBookings(updatedBookings);
    }

    addLog(`Deleted payment ${paymentId}`, 'Payment', paymentId);
    addToast('Payment Deleted', 'Payment record deleted and booking balance updated.', 'warning');
  };

  // Expenses CRUD
  const addExpense = (expenseData: Omit<Expense, 'id' | 'recordedBy'>) => {
    if (expenseData.amount <= 0) {
      addToast('Error', 'Expense amount must be greater than zero.', 'danger');
      return;
    }

    const emailStr = currentUserRole === 'admin' ? 'admin@svmahal.com' : 'manager@svmahal.com';
    const newExpense: Expense = {
      ...expenseData,
      id: `EXP-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      recordedBy: emailStr
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    storageService.saveExpenses(updatedExpenses);

    addLog(`Recorded expense ₹${expenseData.amount} for ${expenseData.category}`, 'Expense', newExpense.id);
    addToast('Expense Added', `Recorded ₹${expenseData.amount} under ${expenseData.category}.`, 'success');
  };

  const deleteExpense = (expenseId: string) => {
    if (currentUserRole !== 'admin') {
      addToast('Unauthorized', 'Managers cannot delete expense audits.', 'danger');
      return;
    }

    const updatedExpenses = expenses.filter(e => e.id !== expenseId);
    setExpenses(updatedExpenses);
    storageService.saveExpenses(updatedExpenses);

    addLog(`Deleted expense ${expenseId}`, 'Expense', expenseId);
    addToast('Expense Deleted', 'Expense record was removed.', 'warning');
  };

  // Customers CRUD
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCust: Customer = {
      ...customerData,
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };
    const updatedCustomers = [...customers, newCust];
    setCustomers(updatedCustomers);
    storageService.saveCustomers(updatedCustomers);
    addLog(`Created customer ${newCust.name}`, 'Customer', newCust.id);
    addToast('Customer Created', `Customer profile ${newCust.name} added.`, 'success');
    return newCust;
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    const updatedCustomers = customers.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c));
    setCustomers(updatedCustomers);
    storageService.saveCustomers(updatedCustomers);

    addLog(`Updated customer ${updatedCustomer.name}`, 'Customer', updatedCustomer.id);
    addToast('Customer Updated', `Profile details for ${updatedCustomer.name} updated.`, 'success');
  };

  // Rooms CRUD/Config
  const addRoom = (roomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...roomData,
      id: `R${Date.now()}`
    };
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    storageService.saveRooms(updatedRooms);
    addLog(`Created new room ${newRoom.number}`, 'Room', newRoom.id);
    addToast('Room Added', `Room ${newRoom.number} created.`, 'success');
  };

  const updateRoom = (updatedRoom: Room) => {

    const updatedRooms = rooms.map(r => (r.id === updatedRoom.id ? updatedRoom : r));
    setRooms(updatedRooms);
    storageService.saveRooms(updatedRooms);

    addLog(`Updated room config for Room ${updatedRoom.number}`, 'Room', updatedRoom.id);
    addToast('Room Configured', `Room ${updatedRoom.number} settings saved.`, 'success');
  };

  const deleteRoom = (id: string) => {
    const roomToDelete = rooms.find(r => r.id === id);
    if (!roomToDelete) return;

    // Check if room has active bookings
    const isActive = bookings.some(b => b.status === 'Active' && b.roomIds?.includes(id));
    if (isActive) {
      addToast('Cannot Delete', `Room ${roomToDelete.number} is currently active in a booking.`, 'danger');
      return;
    }

    const updatedRooms = rooms.filter(r => r.id !== id);
    setRooms(updatedRooms);
    storageService.saveRooms(updatedRooms);
    addLog(`Deleted room ${roomToDelete.number}`, 'Room', id);
    addToast('Room Deleted', `Room ${roomToDelete.number} removed.`, 'success');
  };

  // Mahal Configuration
  const updateMahal = (updatedConfig: MahalConfig) => {
    if (currentUserRole !== 'admin') {
      addToast('Unauthorized', 'Managers cannot change Mahal configurations.', 'danger');
      return;
    }

    setMahalConfig(updatedConfig);
    storageService.saveMahal(updatedConfig);

    addLog('Updated Mahal Configuration', 'MahalConfig', updatedConfig.id);
    addToast('Mahal Configured', 'Mahal settings and pricing packages saved.', 'success');
  };

  // Notification center
  const markNotificationRead = (id: string) => {
    const updatedNotifs = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updatedNotifs);
    storageService.saveNotifications(updatedNotifs);
  };

  const clearNotifications = () => {
    const updatedNotifs = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifs);
    storageService.saveNotifications(updatedNotifs);
  };

  // Global Multi-table Search
  const globalSearch = (query: string): SearchResult[] => {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return [];

    const results: SearchResult[] = [];

    // Search Customers
    customers.forEach(c => {
      if (
        c.name.toLowerCase().includes(cleanQuery) ||
        c.phone.toLowerCase().includes(cleanQuery) ||
        c.email.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          type: 'Customer',
          id: c.id,
          title: c.name,
          subtitle: `Phone: ${c.phone} | Email: ${c.email}`,
          hash: `crm/customers` // will open customer profile drawer on this page
        });
      }
    });

    // Search Bookings
    bookings.forEach(b => {
      if (
        b.id.toLowerCase().includes(cleanQuery) ||
        b.customerName.toLowerCase().includes(cleanQuery) ||
        b.customerPhone.toLowerCase().includes(cleanQuery) ||
        b.serviceType.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          type: 'Booking',
          id: b.id,
          title: `${b.id} - ${b.customerName}`,
          subtitle: `${b.serviceType === 'room' ? 'Room' : 'Mahal'} | Date: ${b.checkInDate} | Status: ${b.status}`,
          hash: `crm/bookings` // will open booking info modal
        });
      }
    });

    // Search Invoices (referenced by Booking IDs)
    bookings.forEach(b => {
      const invoiceNumber = `INV-${b.id.substring(b.id.indexOf('-') + 1)}`;
      if (
        invoiceNumber.toLowerCase().includes(cleanQuery) ||
        b.customerName.toLowerCase().includes(cleanQuery) ||
        b.id.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          type: 'Invoice',
          id: b.id, // linked to booking details view
          title: `${invoiceNumber} (Booking: ${b.id})`,
          subtitle: `Customer: ${b.customerName} | Due: ₹${b.financials.balanceDue}`,
          hash: `crm/bookings`
        });
      }
    });

    // Search Payments
    payments.forEach(p => {
      if (
        p.id.toLowerCase().includes(cleanQuery) ||
        p.bookingId.toLowerCase().includes(cleanQuery) ||
        p.customerName.toLowerCase().includes(cleanQuery) ||
        p.referenceNumber.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          type: 'Payment',
          id: p.id,
          title: `${p.id} - ₹${p.amount}`,
          subtitle: `Booking: ${p.bookingId} | Method: ${p.method} | Ref: ${p.referenceNumber}`,
          hash: `crm/finance` // goes to payments list
        });
      }
    });

    return results.slice(0, 10); // cap at 10 results for design clarity
  };

  // Backups and restoration
  const exportAppData = (): string => {
    addLog('Exported all database data', 'Backup', 'EXPORT');
    return storageService.exportData();
  };

  const importAppData = (json: string): boolean => {
    const success = storageService.importData(json);
    if (success) {
      loadAllData();
      addLog('Imported data from backup', 'Backup', 'IMPORT');
      addToast('Import Successful', 'All local storage databases have been updated.', 'success');
      return true;
    }
    addToast('Import Failed', 'Invalid JSON backup schema. Refusing to import.', 'danger');
    return false;
  };

  const resetAppData = () => {
    storageService.resetData();
    localStorage.removeItem('customer_user');
    setCustomerUser(null);
    loadAllData();
    setSelectedBooking(null);
    addLog('Reset all database data to default seed', 'Backup', 'RESET');
    addToast('Database Reset', 'All data reset to original demo seed.', 'info');
  };

  const loginCustomer = (name: string, phone: string, email: string) => {
    const user = { name, phone, email };
    setCustomerUser(user);
    localStorage.setItem('customer_user', JSON.stringify(user));
    addToast('Verified & Logged In', `Welcome back, ${name}!`, 'success');
    addLog(`Customer logged in: ${phone}`, 'Auth', phone);
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    localStorage.removeItem('customer_user');
    addToast('Logged Out', 'You have been successfully logged out.', 'info');
  };

  // Customer profile derived data compiler
  const getCustomerMetrics = (phone: string) => {
    const cleanPhone = phone.trim();
    // Match customer by phone
    const custBookings = bookings.filter(b => b.customerPhone.trim() === cleanPhone && b.status !== 'Cancelled');
    const custPayments = payments.filter(p => custBookings.some(cb => cb.id === p.bookingId));
    
    const totalBookings = custBookings.length;
    const totalSpent = custBookings.reduce((sum, b) => sum + b.financials.total, 0);
    const outstandingAmount = custBookings.reduce((sum, b) => sum + b.financials.balanceDue, 0);

    let lastBookingDate = 'N/A';
    if (custBookings.length > 0) {
      const sorted = [...custBookings].sort((a, b) => b.checkInDate.localeCompare(a.checkInDate));
      lastBookingDate = sorted[0].checkInDate;
    }

    return {
      totalBookings,
      totalSpent,
      outstandingAmount,
      lastBookingDate,
      bookings: custBookings,
      payments: custPayments
    };
  };

  return (
    <AppContext.Provider
      value={{
        rooms,
        mahalConfig,
        bookings,
        customers,
        payments,
        expenses,
        logs,
        notifications,
        currentView,
        currentUserRole,
        selectedBooking,
        toasts,
        customerUser,
        setView,
        setUserRole,
        setSelectedBooking,
        loginCustomer,
        logoutCustomer,
        addToast,
        removeToast,
        addBooking,
        updateBooking,
        cancelBooking,
        deleteBooking,
        addPayment,
        deletePayment,
        addExpense,
        deleteExpense,
        addCustomer,
        updateCustomer,
        // Rooms Config
        addRoom,
        updateRoom,
        deleteRoom,
        updateMahal,
        markNotificationRead,
        clearNotifications,
        globalSearch,
        exportAppData,
        importAppData,
        resetAppData,
        getCustomerMetrics,
        currentLanguage,
        setLanguage: setCurrentLanguage,
        translate
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
