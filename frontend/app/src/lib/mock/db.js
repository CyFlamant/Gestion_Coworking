// In-browser mock database, kept in localStorage so changes survive page changes.
import { addDays, toLocalIso, today } from '../dates.js';
import { bookingRange, fitToOpeningHours } from '../pricing.js';
import { readLocal, writeLocal } from '../storage.js';

const DB_KEY = 'proto.db.v3'; // bump when the seed data changes
const SESSION_KEY = 'proto.session';

// Same UUID as app.placeholder-user-id in the app-service.
export const DEMO_ADMIN_ID = '00000000-0000-0000-0000-000000000001';
export const DEMO_CLIENT_ID = '00000000-0000-0000-0000-000000000002';
export const DEMO_PASSWORD = 'demo1234';

let db = null;

function seed() {
  const users = [
    { id: DEMO_ADMIN_ID, firstName: 'Gérant', lastName: 'Accueil', email: 'admin@exemple.be', role: 'ADMIN' },
    { id: DEMO_CLIENT_ID, firstName: 'Marie', lastName: 'Dubois', email: 'marie.dubois@exemple.be', role: 'CLIENT' },
    { id: '00000000-0000-0000-0000-000000000003', firstName: 'Thomas', lastName: 'Lambert', email: 'thomas.lambert@exemple.be', role: 'CLIENT' },
    { id: '00000000-0000-0000-0000-000000000004', firstName: 'Sofia', lastName: 'Benali', email: 'sofia.benali@exemple.be', role: 'CLIENT' },
  ].map((user) => ({ ...user, password: DEMO_PASSWORD }));

  const spaces = [
    { id: 1, name: 'Openspace 1', type: 'OPENSPACE', hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 },
    { id: 2, name: 'Openspace 2', type: 'OPENSPACE', hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 },
    { id: 3, name: 'Openspace 3', type: 'OPENSPACE', hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 },
    { id: 4, name: 'Bureau 1', type: 'OFFICE', hourRate: 9, halfDayRate: 30, dayRate: 50, monthRate: 700 },
    { id: 5, name: 'Bureau 2', type: 'OFFICE', hourRate: 9, halfDayRate: 30, dayRate: 50, monthRate: 700 },
    { id: 6, name: 'Salle Atelier', type: 'ROOM', hourRate: 25, halfDayRate: 80, dayRate: 140, monthRate: 2000 },
    { id: 7, name: 'Salle Studio', type: 'ROOM', hourRate: 35, halfDayRate: 110, dayRate: 190, monthRate: 2800 },
  ];

  // Bookings are relative to today so the demo always has past and upcoming entries.
  const day = today();
  const booking = (id, spaceId, userId, values) => {
    // A date that falls on a closed day or slot is moved into the opening hours.
    const { start, end } = bookingRange(fitToOpeningHours({ startHour: 9, hours: 1, halfDay: 'MORNING', ...values }));
    return { id, spaceId, userId, startDateTime: toLocalIso(start), endDateTime: toLocalIso(end) };
  };
  const [marie, thomas, sofia] = [users[1].id, users[2].id, users[3].id];
  const bookings = [
    booking(1, 1, marie, { formula: 'HOUR', date: addDays(day, 1), startHour: 9, hours: 3 }),
    booking(2, 4, marie, { formula: 'DAY', date: addDays(day, 2) }),
    booking(3, 6, thomas, { formula: 'HALF_DAY', date: addDays(day, 1), halfDay: 'AFTERNOON' }),
    booking(4, 2, sofia, { formula: 'MONTH', date: addDays(day, -3) }),
    booking(5, 1, marie, { formula: 'HALF_DAY', date: addDays(day, -5), halfDay: 'MORNING' }),
    booking(6, 7, thomas, { formula: 'HOUR', date: day, startHour: 14, hours: 2 }),
    booking(7, 5, sofia, { formula: 'DAY', date: addDays(day, -2) }),
    booking(8, 4, thomas, { formula: 'HOUR', date: day, startHour: 10, hours: 4 }),
    booking(9, 3, marie, { formula: 'HOUR', date: addDays(day, -1), startHour: 18, hours: 3 }),
  ];
  // Openspace 3 only has a past booking; a space with no booking at all can be added to try deletion.

  return { users, spaces, bookings, nextSpaceId: 8, nextBookingId: 10, nextUserId: 5 };
}

export function getDb() {
  if (!db) {
    db = readLocal(DB_KEY);
    if (!db) {
      db = seed();
      saveDb();
    }
  }
  return db;
}

export function saveDb() {
  writeLocal(DB_KEY, db);
}

export function resetDb() {
  db = seed();
  saveDb();
  writeLocal(SESSION_KEY, null);
}

export function getSessionUserId() {
  return readLocal(SESSION_KEY);
}

export function setSessionUserId(userId) {
  writeLocal(SESSION_KEY, userId);
}
