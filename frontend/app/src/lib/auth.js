import { ApiError, getMe } from './api.js';
import { readDraft } from './draft.js';

// Returns { id, role } or null for a guest. A 401 from /api/me means "not signed in".
export async function getCurrentUser() {
  try {
    return await getMe();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function roleOf(user) {
  return user?.role ?? 'GUEST';
}

// Where each role lands: after sign-in, and when a page is not for them.
export const HOME_BY_ROLE = { GUEST: '/', CLIENT: '/', ADMIN: '/admin/reservations' };

// Where to go after signing in or up: the booking page when a client chose a space before, else the role's home.
export function pageAfterSignIn(role) {
  return role === 'CLIENT' && readDraft() ? '/reserver' : HOME_BY_ROLE[role];
}
