export const DEV_EMAILS = (import.meta.env.VITE_DEV_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

export const ENTITY_TYPES = {
    'songs': 'song',
    'gear': 'gear',
    'musicians': 'member',
    'instruments': 'instrument',
    'rehearsals': 'rehearsal',
    'gigs': 'gig',
    'finances': 'finance'
};
