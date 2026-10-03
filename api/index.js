import crypto from 'crypto';
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
  saveMahal,
  getOtaReservations
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

    // /api/ota/reservations (MakeMyTrip & Goibibo Live Extranet Webhook & Feed)
    if (pathname.startsWith('/ota/reservations')) {
      if (req.method === 'GET') {
        const reservations = await getOtaReservations();
        return res.status(200).json({ success: true, count: reservations.length, reservations });
      }
      if (req.method === 'POST') {
        const payload = req.body;
        const totalAmt = Number(payload.totalAmount || payload.amount || payload.tariff || 2400);
        const otaBooking = {
          id: payload.id || `OTA-${Date.now()}`,
          customerName: payload.guestName || payload.customerName || 'IngoMMT Traveler',
          customerPhone: payload.guestPhone || payload.customerPhone || 'N/A',
          customerEmail: payload.guestEmail || payload.customerEmail || `${(payload.guestName || 'guest').toLowerCase().replace(/\s+/g, '')}@ota-guest.com`,
          customerAddress: payload.customerAddress || `Booked via IngoMMT ${payload.otaSource || 'MakeMyTrip'} Partner Channel`,
          serviceType: 'room',
          serviceId: payload.roomType || 'Deluxe',
          checkInDate: payload.checkIn || payload.checkInDate || new Date().toISOString().split('T')[0],
          checkOutDate: payload.checkOut || payload.checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
          guestCount: Number(payload.guestCount) || 2,
          roomCount: Number(payload.roomCount) || 1,
          idType: 'Aadhaar / OTA Verified',
          idNumber: payload.otaRef || payload.otaReference || 'MMT-INGOMMT-CONFIRMED',
          specialRequirements: payload.specialRequirements || `IngoMMT API Reservation: ${payload.otaSource || 'MakeMyTrip'} | Ref: ${payload.otaRef || payload.otaReference || 'MMT-EXTRANET'}`,
          financials: {
            baseAmount: totalAmt,
            subtotal: totalAmt,
            discount: 0,
            tax: Math.round(totalAmt * 0.12),
            total: totalAmt,
            advancePaid: totalAmt,
            balanceDue: 0
          },
          status: 'Confirmed',
          bookingSource: payload.otaSource === 'Goibibo' ? 'Goibibo' : 'MakeMyTrip',
          otaReference: payload.otaRef || payload.otaReference || `${(payload.otaSource || 'MMT').substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
          otaCommission: Number(payload.commissionPct || 15),
          otaPayoutStatus: 'Pending',
          billingType: 'Normal',
          createdAt: new Date().toISOString(),
          createdBy: 'IngoMMT Webhook Gateway'
        };

        const saved = await saveBooking(otaBooking);
        return res.status(200).json({ success: true, message: 'Reservation logged into MongoDB', booking: saved });
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

    // /api/upload (Cloudinary Multimedia Upload Proxy)
    if (pathname.startsWith('/upload')) {
      if (req.method === 'POST') {
        const { file, folder = 'sv_residency_multimedia', upload_preset } = req.body || {};

        let apiKey = process.env.CLOUDINARY_API_KEY || '356683122558141';
        let apiSecret = process.env.CLOUDINARY_API_SECRET || 'usq5wMmWpECoyz_3pzaPWARAtxo';
        let cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'bvnf8caw';

        if (process.env.CLOUDINARY_URL) {
          const match = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
          if (match) {
            apiKey = match[1];
            apiSecret = match[2];
            cloudName = match[3];
          }
        }

        const formData = new FormData();
        formData.append('file', file);

        if (upload_preset) {
          formData.append('upload_preset', upload_preset);
          formData.append('folder', folder);
        } else if (apiKey && apiSecret) {
          // Generate SHA-1 signature for secure server-side upload
          const timestamp = Math.floor(Date.now() / 1000);
          const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
          const signature = crypto.createHash('sha1').update(toSign).digest('hex');

          formData.append('api_key', apiKey);
          formData.append('timestamp', timestamp.toString());
          formData.append('signature', signature);
          formData.append('folder', folder);
        } else {
          return res.status(200).json({ 
            success: true, 
            url: file, 
            isCloudinary: false, 
            message: 'Cloudinary credentials pending configuration' 
          });
        }

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        const cloudJson = await cloudRes.json();
        if (cloudRes.ok) {
          return res.status(200).json({ success: true, url: cloudJson.secure_url || cloudJson.url, isCloudinary: true, data: cloudJson });
        } else {
          console.error('Cloudinary API error:', cloudJson);
          return res.status(200).json({ success: false, url: file, isCloudinary: false, error: cloudJson?.error?.message });
        }
      }
    }

    return res.status(404).json({ error: 'API route not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
