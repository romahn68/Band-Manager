import Dexie from 'dexie';

export const db = new Dexie('BandManagerDB');

db.version(1).stores({
  bands: '++id, nombre',
  members: '++id, bandId, nombre, instrumento',
  songs: '++id, bandId, titulo, tonalidad',
  rehearsals: '++id, bandId, fecha',
  gigs: '++id, bandId, fecha'
});

// Helper for initial setup if needed
export const initDefaultBand = async () => {
  const bands = await db.bands.toArray();
  if (bands.length === 0) {
    const id = await db.bands.add({ nombre: 'Mi Banda' });
    return id;
  }
  return bands[0].id;
};
