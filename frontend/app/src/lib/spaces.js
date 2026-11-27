import { SPACE_TYPES } from './config.js';

// For sort(): by type (open space, office, room), then by name ("Bureau 2" before "Bureau 10").
export function byTypeThenName(a, b) {
    return SPACE_TYPES.indexOf(a.type) - SPACE_TYPES.indexOf(b.type) || a.name.localeCompare(b.name, 'fr', { numeric: true });
}
