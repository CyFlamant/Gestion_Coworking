import { ApiError, getMe } from './api.js';

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
