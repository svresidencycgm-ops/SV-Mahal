import {
  getAllAppData,
  saveBooking,
  deleteBooking,
  saveCustomer,
  savePayment,
  deletePayment,
  saveExpense,
  deleteExpense,
  saveRooms,
  saveMahal
} from './db.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse path from URL
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/^\/api/, '');

  try {
    // GET /api/health
    if (pathname === '/health') {
      return res.status(200).json({ status: 'ok', mongodb: 'connected', cluster: 'cluster0.q8vsvhp.mongodb.net' });
    }

    // GET /api/data - Fetch all database collections
    if (pathname === '/data' || pathname === '' || pathname === '/') {
      if (req.method === 'GET') {
        const data = await getAllAppData();
        return res.status(200).json(data);
      }
    }

    // /api/bookings
    if (pathname.startsWith('/bookings')) {
      if (req.method === 'POST' || req.method === 'PUT') {
        const booking = req.body;
        const saved = await saveBooking(booking);
        return res.status(200).json({ success: true, booking: saved });
      }
      if (req.method === 'DELETE') {
        const id = pathname.split('/')[2] || (req.query && req.query.id);
        if (!id) return res.status(400).json({ error: 'Missing booking ID' });
        await deleteBooking(id);
        return res.status(200).json({ success: true, id });
      }
    }

    // /api/customers
    if (pathname.startsWith('/customers')) {
      if (req.method === 'POST' || req.method === 'PUT') {
        const customer = req.body;
        const saved = await saveCustomer(customer);
        return res.status(200).json({ success: true, customer: saved });
      }
    }

    // /api/payments
    if (pathname.startsWith('/payments')) {
      if (req.method === 'POST') {
        const payment = req.body;
        const saved = await savePayment(payment);
        return res.status(200).json({ success: true, payment: saved });
      }
      if (req.method === 'DELETE') {
        const id = pathname.split('/')[2] || (req.query && req.query.id);
        if (!id) return res.status(400).json({ error: 'Missing payment ID' });
        await deletePayment(id);
        return res.status(200).json({ success: true, id });
      }
    }

    // /api/expenses
    if (pathname.startsWith('/expenses')) {
      if (req.method === 'POST') {
        const expense = req.body;
        const saved = await saveExpense(expense);
        return res.status(200).json({ success: true, expense: saved });
      }
      if (req.method === 'DELETE') {
        const id = pathname.split('/')[2] || (req.query && req.query.id);
        if (!id) return res.status(400).json({ error: 'Missing expense ID' });
        await deleteExpense(id);
        return res.status(200).json({ success: true, id });
      }
    }

    // /api/rooms
    if (pathname.startsWith('/rooms')) {
      if (req.method === 'POST' || req.method === 'PUT') {
        const rooms = req.body;
        const saved = await saveRooms(Array.isArray(rooms) ? rooms : [rooms]);
        return res.status(200).json({ success: true, rooms: saved });
      }
    }

    // /api/mahal
    if (pathname.startsWith('/mahal')) {
      if (req.method === 'POST' || req.method === 'PUT') {
        const mahal = req.body;
        const saved = await saveMahal(mahal);
        return res.status(200).json({ success: true, mahal: saved });
      }
    }

    return res.status(404).json({ error: 'API route not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
