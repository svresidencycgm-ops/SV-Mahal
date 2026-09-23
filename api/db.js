import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://svresidencycgm_db_user:TuwGa9vNiiAtEllc@cluster0.q8vsvhp.mongodb.net/?retryWrites=true&w=majority';
const DB_NAME = 'sv_residency';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export async function getCollection(name) {
  const { db } = await connectToDatabase();
  return db.collection(name);
}

// Data Helpers
export async function getAllAppData() {
  const { db } = await connectToDatabase();
  
  const [bookings, customers, payments, expenses, rooms, mahal, logs, notifications] = await Promise.all([
    db.collection('bookings').find({}).toArray(),
    db.collection('customers').find({}).toArray(),
    db.collection('payments').find({}).toArray(),
    db.collection('expenses').find({}).toArray(),
    db.collection('rooms').find({}).toArray(),
    db.collection('mahal_config').findOne({ id: 'mahal-main' }),
    db.collection('audit_logs').find({}).sort({ timestamp: -1 }).limit(100).toArray(),
    db.collection('notifications').find({}).sort({ createdAt: -1 }).limit(50).toArray(),
  ]);

  return {
    bookings: bookings.map(({ _id, ...rest }) => rest),
    customers: customers.map(({ _id, ...rest }) => rest),
    payments: payments.map(({ _id, ...rest }) => rest),
    expenses: expenses.map(({ _id, ...rest }) => rest),
    rooms: rooms.map(({ _id, ...rest }) => rest),
    mahal: mahal ? (({ _id, ...rest }) => rest)(mahal) : null,
    logs: logs.map(({ _id, ...rest }) => rest),
    notifications: notifications.map(({ _id, ...rest }) => rest),
  };
}

export async function saveBooking(booking) {
  const collection = await getCollection('bookings');
  await collection.updateOne(
    { id: booking.id },
    { $set: booking },
    { upsert: true }
  );
  return booking;
}

export async function deleteBooking(bookingId) {
  const collection = await getCollection('bookings');
  await collection.deleteOne({ id: bookingId });
  return { success: true, id: bookingId };
}

export async function saveCustomer(customer) {
  const collection = await getCollection('customers');
  await collection.updateOne(
    { id: customer.id },
    { $set: customer },
    { upsert: true }
  );
  return customer;
}

export async function savePayment(payment) {
  const collection = await getCollection('payments');
  await collection.updateOne(
    { id: payment.id },
    { $set: payment },
    { upsert: true }
  );
  return payment;
}

export async function deletePayment(paymentId) {
  const collection = await getCollection('payments');
  await collection.deleteOne({ id: paymentId });
  return { success: true, id: paymentId };
}

export async function saveExpense(expense) {
  const collection = await getCollection('expenses');
  await collection.updateOne(
    { id: expense.id },
    { $set: expense },
    { upsert: true }
  );
  return expense;
}

export async function deleteExpense(expenseId) {
  const collection = await getCollection('expenses');
  await collection.deleteOne({ id: expenseId });
  return { success: true, id: expenseId };
}

export async function saveRooms(rooms) {
  const collection = await getCollection('rooms');
  for (const room of rooms) {
    await collection.updateOne(
      { id: room.id },
      { $set: room },
      { upsert: true }
    );
  }
  return rooms;
}

export async function saveMahal(mahal) {
  const collection = await getCollection('mahal_config');
  await collection.updateOne(
    { id: mahal.id || 'mahal-main' },
    { $set: { ...mahal, id: mahal.id || 'mahal-main' } },
    { upsert: true }
  );
  return mahal;
}
