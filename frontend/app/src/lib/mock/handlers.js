// Mock HTTP endpoints. They copy the app-service's status codes and ProblemDetail bodies
// (see GlobalExceptionHandler, SecurityConfig and the DTOs) so the UI handles errors the same way in both modes.
// Endpoints marked "planned" do not exist in the backend yet; their shape is a proposal.
import { RATE_FIELDS, SPACE_TYPES } from '../config.js';
import { overlaps, parseLocal } from '../dates.js';
import { computePrice, isWithinOpeningHours } from '../pricing.js';
import { getDb, getSessionUserId, saveDb, setSessionUserId } from './db.js';

const respond = (status, body = null) => ({ status, body });
const problem = (status, detail, errors) => respond(status, errors ? { status, detail, errors } : { status, detail });
const invalid = (errors) => problem(400, 'Données invalides', errors);

const routes = [];
const on = (method, pattern, handler) => routes.push({ method, pattern, handler });

export function route(method, url, body) {
  const { pathname, searchParams } = new URL(url, 'http://mock');
  for (const r of routes) {
    const match = r.method === method && pathname.match(r.pattern);
    if (match) return r.handler({ params: match.slice(1), query: searchParams, body });
  }
  return problem(404, 'Ressource introuvable');
}

// ---------- Security (mirrors SecurityConfig + @PreAuthorize) ----------

function currentUser() {
  const id = getSessionUserId();
  return getDb().users.find((user) => user.id === id) ?? null;
}

// Returns an error response, or null when access is granted.
function guard(roles) {
  const user = currentUser();
  if (!user) return respond(401); // HttpStatusEntryPoint: empty body
  if (roles && !roles.includes(user.role)) return problem(403, 'Accès refusé');
  return null;
}

// ---------- Spaces (existing API) ----------

const spaceResponse = (space) => ({ ...space });

function findSpace(id) {
  return getDb().spaces.find((space) => space.id === Number(id));
}

function validateSpace(body) {
  const errors = {};
  if (typeof body?.name !== 'string' || !body.name.trim()) errors.name = 'Champ obligatoire';
  if (body?.type == null || body.type === '') errors.type = 'Champ obligatoire';
  else if (!SPACE_TYPES.includes(body.type)) errors.type = 'Valeur invalide';
  for (const key of RATE_FIELDS) {
    const value = body?.[key];
    if (value == null || value === '') errors[key] = 'Champ obligatoire';
    else if (typeof value !== 'number' || Number.isNaN(value)) errors[key] = 'Valeur invalide';
    else if (value < 0) errors[key] = 'Le tarif ne peut pas être négatif';
  }
  return errors;
}

function spaceFromBody(body) {
  const space = { name: body.name, type: body.type };
  for (const key of RATE_FIELDS) space[key] = body[key];
  return space;
}

on('GET', /^\/api\/spaces$/, () => respond(200, getDb().spaces.map(spaceResponse)));

// planned: search for available spaces (spec: "Recherche d'espaces disponibles par date/heure et type")
on('GET', /^\/api\/spaces\/available$/, ({ query }) => {
  const start = query.get('start');
  const end = query.get('end');
  if (!start || !end) return invalid({ [start ? 'end' : 'start']: 'Champ obligatoire' });
  const [from, to] = [parseLocal(start), parseLocal(end)];
  const type = query.get('type');
  const { spaces, bookings } = getDb();
  const busy = new Set(
    bookings
      .filter((b) => overlaps(from, to, parseLocal(b.startDateTime), parseLocal(b.endDateTime)))
      .map((b) => b.spaceId),
  );
  return respond(200, spaces.filter((s) => !busy.has(s.id) && (!type || s.type === type)).map(spaceResponse));
});

on('GET', /^\/api\/spaces\/(\d+)$/, ({ params: [id] }) => {
  const space = findSpace(id);
  return space ? respond(200, spaceResponse(space)) : problem(404, `Espace introuvable : ${id}`);
});

on('POST', /^\/api\/spaces$/, ({ body }) => {
  const denied = guard(['ADMIN']);
  if (denied) return denied;
  const errors = validateSpace(body);
  if (Object.keys(errors).length) return invalid(errors);
  const db = getDb();
  const space = { id: db.nextSpaceId++, ...spaceFromBody(body) };
  db.spaces.push(space);
  saveDb();
  return respond(201, spaceResponse(space));
});

on('PUT', /^\/api\/spaces\/(\d+)$/, ({ params: [id], body }) => {
  const denied = guard(['ADMIN']);
  if (denied) return denied;
  const errors = validateSpace(body);
  if (Object.keys(errors).length) return invalid(errors);
  const space = findSpace(id);
  if (!space) return problem(404, `Espace introuvable : ${id}`);
  Object.assign(space, spaceFromBody(body));
  saveDb();
  return respond(200, spaceResponse(space));
});

on('DELETE', /^\/api\/spaces\/(\d+)$/, ({ params: [id] }) => {
  const denied = guard(['ADMIN']);
  if (denied) return denied;
  const db = getDb();
  const space = findSpace(id);
  if (!space) return problem(404, `Espace introuvable : ${id}`);
  if (db.bookings.some((b) => b.spaceId === space.id)) {
    // The backend currently answers 500 for this case (SpaceHasBookingsException).
    return problem(500, `Impossible de supprimer l'espace ${id} : il a des réservations`);
  }
  db.spaces = db.spaces.filter((s) => s !== space);
  saveDb();
  return respond(204);
});

// ---------- Current user (existing API; firstName is planned) ----------

on('GET', /^\/api\/me$/, () => {
  const user = currentUser();
  return user ? respond(200, { id: user.id, role: user.role, firstName: user.firstName }) : respond(401);
});

// ---------- Bookings (planned) ----------

function bookingResponse(booking) {
  const { spaces, users } = getDb();
  const space = spaces.find((s) => s.id === booking.spaceId);
  const user = users.find((u) => u.id === booking.userId);
  const price = space ? computePrice(space, parseLocal(booking.startDateTime), parseLocal(booking.endDateTime)) : null;
  return {
    ...booking,
    spaceName: space?.name ?? '?',
    spaceType: space?.type ?? null,
    userName: user ? `${user.firstName} ${user.lastName}` : '?',
    formula: price?.formula ?? null,
    price: price?.total ?? null,
  };
}

const byStart = (a, b) => a.startDateTime.localeCompare(b.startDateTime);

// Shared by create and update. Returns an error response or null.
function checkBooking(body, { ignoreId = null, requireFuture = true } = {}) {
  const errors = {};
  if (body?.spaceId == null || body.spaceId === '') errors.spaceId = 'Champ obligatoire';
  if (!body?.userId) errors.userId = 'Champ obligatoire';
  if (!body?.startDateTime) errors.startDateTime = 'Champ obligatoire';
  if (!body?.endDateTime) errors.endDateTime = 'Champ obligatoire';
  if (Object.keys(errors).length) return invalid(errors);

  const start = parseLocal(body.startDateTime);
  const end = parseLocal(body.endDateTime);
  if (end <= start) return invalid({ endDateTime: 'La fin doit être après le début' });
  if (!isWithinOpeningHours(start, end)) return invalid({ startDateTime: 'En dehors des heures d’ouverture' });
  if (requireFuture && start < new Date()) return invalid({ startDateTime: 'La date doit être dans le futur' });

  const db = getDb();
  const space = findSpace(body.spaceId);
  if (!space) return problem(404, `Espace introuvable : ${body.spaceId}`);
  if (!db.users.some((u) => u.id === body.userId)) return invalid({ userId: 'Client introuvable' });
  const conflict = db.bookings.some(
    (b) => b.id !== ignoreId && b.spaceId === space.id
      && overlaps(start, end, parseLocal(b.startDateTime), parseLocal(b.endDateTime)),
  );
  if (conflict) return problem(409, 'Cet espace est déjà réservé sur ce créneau');
  return null;
}

on('GET', /^\/api\/bookings$/, () => {
  const denied = guard(['ADMIN']);
  if (denied) return denied;
  return respond(200, getDb().bookings.slice().sort(byStart).map(bookingResponse));
});

on('GET', /^\/api\/bookings\/me$/, () => {
  const denied = guard();
  if (denied) return denied;
  const userId = currentUser().id;
  return respond(200, getDb().bookings.filter((b) => b.userId === userId).sort(byStart).map(bookingResponse));
});

on('POST', /^\/api\/bookings$/, ({ body }) => {
  const denied = guard();
  if (denied) return denied;
  const user = currentUser();
  // A client always books for themself; an admin chooses the client.
  const request = { ...body, userId: user.role === 'ADMIN' ? body?.userId : user.id, spaceId: Number(body?.spaceId) || body?.spaceId };
  const error = checkBooking(request);
  if (error) return error;
  const db = getDb();
  const booking = {
    id: db.nextBookingId++,
    spaceId: Number(request.spaceId),
    userId: request.userId,
    startDateTime: request.startDateTime,
    endDateTime: request.endDateTime,
  };
  db.bookings.push(booking);
  saveDb();
  return respond(201, bookingResponse(booking));
});

on('PUT', /^\/api\/bookings\/(\d+)$/, ({ params: [id], body }) => {
  const denied = guard(['ADMIN']);
  if (denied) return denied;
  const db = getDb();
  const booking = db.bookings.find((b) => b.id === Number(id));
  if (!booking) return problem(404, `Réservation introuvable : ${id}`);
  const request = { ...body, spaceId: Number(body?.spaceId) || body?.spaceId };
  const error = checkBooking(request, { ignoreId: booking.id, requireFuture: false });
  if (error) return error;
  Object.assign(booking, {
    spaceId: Number(request.spaceId),
    userId: request.userId,
    startDateTime: request.startDateTime,
    endDateTime: request.endDateTime,
  });
  saveDb();
  return respond(200, bookingResponse(booking));
});

on('DELETE', /^\/api\/bookings\/(\d+)$/, ({ params: [id] }) => {
  const denied = guard();
  if (denied) return denied;
  const user = currentUser();
  const db = getDb();
  const booking = db.bookings.find((b) => b.id === Number(id));
  if (!booking) return problem(404, `Réservation introuvable : ${id}`);
  if (user.role !== 'ADMIN') {
    if (booking.userId !== user.id) return problem(403, 'Accès refusé');
    if (parseLocal(booking.startDateTime) < new Date()) {
      return problem(400, 'Impossible d’annuler une réservation déjà commencée');
    }
  }
  db.bookings = db.bookings.filter((b) => b !== booking);
  saveDb();
  return respond(204);
});

// ---------- Users (planned, auth-service) ----------

on('GET', /^\/api\/users$/, ({ query }) => {
  const denied = guard(['ADMIN']);
  if (denied) return denied;
  const role = query.get('role');
  return respond(200, getDb().users
    .filter((u) => !role || u.role === role)
    .map(({ id, firstName, lastName, email, role: userRole }) => ({ id, firstName, lastName, email, role: userRole })));
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

on('POST', /^\/auth\/login$/, ({ body }) => {
  const user = getDb().users.find((u) => u.email === body?.email?.trim().toLowerCase() && u.password === body?.password);
  if (!user) return problem(401, 'Adresse e-mail ou mot de passe incorrect');
  setSessionUserId(user.id);
  return respond(200, { id: user.id, role: user.role });
});

on('POST', /^\/auth\/register$/, ({ body }) => {
  const errors = {};
  for (const key of ['firstName', 'lastName', 'email', 'password', 'passwordConfirm']) {
    if (!body?.[key]?.trim()) errors[key] = 'Champ obligatoire';
  }
  if (!errors.email && !EMAIL_PATTERN.test(body.email.trim())) errors.email = 'Adresse e-mail invalide';
  if (!errors.password && body.password.length < 8) errors.password = 'Au moins 8 caractères';
  if (!errors.passwordConfirm && body.password !== body.passwordConfirm) {
    errors.passwordConfirm = 'Les mots de passe ne correspondent pas';
  }
  if (Object.keys(errors).length) return invalid(errors);

  const db = getDb();
  const email = body.email.trim().toLowerCase();
  if (db.users.some((u) => u.email === email)) {
    return problem(409, 'Données invalides', { email: 'Un compte existe déjà avec cette adresse' });
  }
  const id = `00000000-0000-0000-0000-${String(db.nextUserId++).padStart(12, '0')}`;
  db.users.push({
    id, firstName: body.firstName.trim(), lastName: body.lastName.trim(), email, password: body.password, role: 'CLIENT',
  });
  saveDb();
  setSessionUserId(id);
  return respond(201, { id, role: 'CLIENT' });
});

on('POST', /^\/auth\/logout$/, () => {
  setSessionUserId(null);
  return respond(204);
});
