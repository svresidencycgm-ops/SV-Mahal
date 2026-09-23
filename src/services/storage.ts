import { SEED_ROOMS, SEED_MAHAL, SEED_CUSTOMERS, SEED_BOOKINGS, SEED_PAYMENTS, SEED_EXPENSES, SEED_LOGS, SEED_NOTIFICATIONS } from '../data/seedData';
import type { Room, MahalConfig, Booking, Customer, Payment, Expense, AuditLog, Notification } from '../types';

const KEYS = {
  ROOMS: 'sv_rooms',
  MAHAL: 'sv_mahal',
  BOOKINGS: 'sv_bookings',
  CUSTOMERS: 'sv_customers',
  PAYMENTS: 'sv_payments',
  EXPENSES: 'sv_expenses',
  LOGS: 'sv_audit_logs',
  NOTIFICATIONS: 'sv_notifications'
};

export const storageService = {
  initialize() {
    // Force reset of local storage to clear existing large dataset
    localStorage.removeItem(KEYS.CUSTOMERS);
    localStorage.removeItem(KEYS.BOOKINGS);
    localStorage.removeItem(KEYS.PAYMENTS);
    localStorage.removeItem(KEYS.EXPENSES);
    localStorage.removeItem(KEYS.LOGS);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    
    if (!localStorage.getItem(KEYS.ROOMS)) {
      localStorage.setItem(KEYS.ROOMS, JSON.stringify(SEED_ROOMS));
    }
    if (!localStorage.getItem(KEYS.MAHAL)) {
      localStorage.setItem(KEYS.MAHAL, JSON.stringify(SEED_MAHAL));
    }
    if (!localStorage.getItem(KEYS.CUSTOMERS)) {
      localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(SEED_CUSTOMERS.slice(0, 2)));
    }
    if (!localStorage.getItem(KEYS.BOOKINGS)) {
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS.slice(0, 2)));
    }
    if (!localStorage.getItem(KEYS.PAYMENTS)) {
      localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS.slice(0, 2)));
    }
    if (!localStorage.getItem(KEYS.EXPENSES)) {
      localStorage.setItem(KEYS.EXPENSES, JSON.stringify(SEED_EXPENSES.slice(0, 2)));
    }
    if (!localStorage.getItem(KEYS.LOGS)) {
      localStorage.setItem(KEYS.LOGS, JSON.stringify(SEED_LOGS.slice(0, 2)));
    }
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS.slice(0, 2)));
    }
  },

  getData<T>(key: string): T {
    storageService.initialize();
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : ([] as unknown as T);
  },

  setData<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getRooms(): Room[] {
    return storageService.getData<Room[]>(KEYS.ROOMS);
  },
  saveRooms(rooms: Room[]): void {
    storageService.setData(KEYS.ROOMS, rooms);
  },

  getMahal(): MahalConfig {
    return storageService.getData<MahalConfig>(KEYS.MAHAL);
  },
  saveMahal(mahal: MahalConfig): void {
    storageService.setData(KEYS.MAHAL, mahal);
  },

  getBookings(): Booking[] {
    return storageService.getData<Booking[]>(KEYS.BOOKINGS);
  },
  saveBookings(bookings: Booking[]): void {
    storageService.setData(KEYS.BOOKINGS, bookings);
  },

  getCustomers(): Customer[] {
    return storageService.getData<Customer[]>(KEYS.CUSTOMERS);
  },
  saveCustomers(customers: Customer[]): void {
    storageService.setData(KEYS.CUSTOMERS, customers);
  },

  getPayments(): Payment[] {
    return storageService.getData<Payment[]>(KEYS.PAYMENTS);
  },
  savePayments(payments: Payment[]): void {
    storageService.setData(KEYS.PAYMENTS, payments);
  },

  getExpenses(): Expense[] {
    return storageService.getData<Expense[]>(KEYS.EXPENSES);
  },
  saveExpenses(expenses: Expense[]): void {
    storageService.setData(KEYS.EXPENSES, expenses);
  },

  getLogs(): AuditLog[] {
    return storageService.getData<AuditLog[]>(KEYS.LOGS);
  },
  saveLogs(logs: AuditLog[]): void {
    storageService.setData(KEYS.LOGS, logs);
  },

  getNotifications(): Notification[] {
    return storageService.getData<Notification[]>(KEYS.NOTIFICATIONS);
  },
  saveNotifications(notifs: Notification[]): void {
    storageService.setData(KEYS.NOTIFICATIONS, notifs);
  },

  exportData(): string {
    const data = {
      rooms: storageService.getRooms(),
      mahal: storageService.getMahal(),
      bookings: storageService.getBookings(),
      customers: storageService.getCustomers(),
      payments: storageService.getPayments(),
      expenses: storageService.getExpenses(),
      logs: storageService.getLogs(),
      notifications: storageService.getNotifications()
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (
        data &&
        Array.isArray(data.rooms) &&
        data.mahal &&
        Array.isArray(data.bookings) &&
        Array.isArray(data.customers) &&
        Array.isArray(data.payments) &&
        Array.isArray(data.expenses)
      ) {
        storageService.saveRooms(data.rooms);
        storageService.saveMahal(data.mahal);
        storageService.saveBookings(data.bookings);
        storageService.saveCustomers(data.customers);
        storageService.savePayments(data.payments);
        storageService.saveExpenses(data.expenses);
        storageService.saveLogs(data.logs || []);
        storageService.saveNotifications(data.notifications || []);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import parsing error:', e);
      return false;
    }
  },

  resetData(): void {
    localStorage.removeItem(KEYS.ROOMS);
    localStorage.removeItem(KEYS.MAHAL);
    localStorage.removeItem(KEYS.BOOKINGS);
    localStorage.removeItem(KEYS.CUSTOMERS);
    localStorage.removeItem(KEYS.PAYMENTS);
    localStorage.removeItem(KEYS.EXPENSES);
    localStorage.removeItem(KEYS.LOGS);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    storageService.initialize();
  }
};
