import type { Booking, Customer, Payment, Expense, Room, MahalConfig } from '../types';

export const apiService = {
  async fetchAllData(): Promise<{
    bookings?: Booking[];
    customers?: Customer[];
    payments?: Payment[];
    expenses?: Expense[];
    rooms?: Room[];
    mahal?: MahalConfig;
  } | null> {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Could not fetch from MongoDB API, using local state:', err);
      return null;
    }
  },

  async saveBooking(booking: Booking): Promise<boolean> {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save booking to MongoDB:', err);
      return false;
    }
  },

  async deleteBooking(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to delete booking from MongoDB:', err);
      return false;
    }
  },

  async saveCustomer(customer: Customer): Promise<boolean> {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save customer to MongoDB:', err);
      return false;
    }
  },

  async savePayment(payment: Payment): Promise<boolean> {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save payment to MongoDB:', err);
      return false;
    }
  },

  async deletePayment(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to delete payment from MongoDB:', err);
      return false;
    }
  },

  async saveExpense(expense: Expense): Promise<boolean> {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save expense to MongoDB:', err);
      return false;
    }
  },

  async deleteExpense(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to delete expense from MongoDB:', err);
      return false;
    }
  },

  async saveRooms(rooms: Room[]): Promise<boolean> {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rooms),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save rooms to MongoDB:', err);
      return false;
    }
  },

  async saveMahal(mahal: MahalConfig): Promise<boolean> {
    try {
      const res = await fetch('/api/mahal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mahal),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save mahal to MongoDB:', err);
      return false;
    }
  }
};
