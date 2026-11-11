// One function per endpoint. Same signatures in mock and real mode; errors are thrown as ApiError.
import { AUTH_BASE_URL, BASE_URL, getApiMode } from './config.js';
import { t } from './i18n/index.js';
import { route } from './mock/handlers.js';

const MOCK_DELAY_MS = 120;

// Mirrors Spring's ProblemDetail: detail is a French sentence, errors maps field → message (400 only).
export class ApiError extends Error {
  constructor(status, detail, errors = {}) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.errors = errors;
  }
}

async function send(method, path, body) {
  if (getApiMode() === 'mock') {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
    const response = route(method, path, body === undefined ? undefined : structuredClone(body));
    return { status: response.status, data: response.body == null ? null : structuredClone(response.body) };
  }

  const base = path.startsWith('/auth') ? AUTH_BASE_URL : BASE_URL;
  let response;
  try {
    response = await fetch(base + path, {
      method,
      // Once the auth-service exists: add the JWT here (Authorization: Bearer <token>).
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, t('errors.network'));
  }
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { status: response.status, data };
}

function defaultDetail(status) {
  if (status === 401) return t('errors.unauthorized');
  if (status === 403) return t('errors.forbidden');
  if (status === 404) return t('errors.notFound');
  return t('errors.generic', { status });
}

async function request(method, path, body) {
  const { status, data } = await send(method, path, body);
  if (status >= 400) throw new ApiError(status, data?.detail ?? defaultDetail(status), data?.errors ?? {});
  return data;
}

// Planned endpoints only exist in the mock; in real mode they fail clearly instead of hitting a 404.
async function planned(method, path, body) {
  if (getApiMode() !== 'mock') throw new ApiError(501, t('errors.notImplemented'));
  return request(method, path, body);
}

// ---------- app-service (existing) ----------

export const getMe = () => request('GET', '/api/me');

export const getSpaces = () => request('GET', '/api/spaces');
export const getSpace = (id) => request('GET', `/api/spaces/${id}`);
export const createSpace = (space) => request('POST', '/api/spaces', space);
export const updateSpace = (id, space) => request('PUT', `/api/spaces/${id}`, space);
export const deleteSpace = (id) => request('DELETE', `/api/spaces/${id}`);

// ---------- app-service (planned) ----------

// start/end: LocalDateTime strings; type optional.
export const getAvailableSpaces = ({ start, end, type }) => {
  const query = new URLSearchParams({ start, end, ...(type ? { type } : {}) });
  return planned('GET', `/api/spaces/available?${query}`);
};

export const getBookings = () => planned('GET', '/api/bookings');
export const getMyBookings = () => planned('GET', '/api/bookings/me');
export const createBooking = (booking) => planned('POST', '/api/bookings', booking);
export const updateBooking = (id, booking) => planned('PUT', `/api/bookings/${id}`, booking);
export const deleteBooking = (id) => planned('DELETE', `/api/bookings/${id}`);

// ---------- auth-service (planned) ----------

export const getClients = () => planned('GET', '/api/users?role=CLIENT');
export const login = (credentials) => planned('POST', '/auth/login', credentials);
export const register = (account) => planned('POST', '/auth/register', account);
export const logout = () => planned('POST', '/auth/logout');
