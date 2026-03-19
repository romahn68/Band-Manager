/**
 * @fileoverview Definición de esquemas y modelos de datos para Band Manager.
 * Utiliza estas funciones de fábrica para crear objetos consistentes antes de enviarlos a Firestore.
 */

import { serverTimestamp } from 'firebase/firestore';

// Función auxiliar para sanitizar cadenas
const sanitizeString = (str, maxLength = 255) => {
    if (typeof str !== 'string') return '';
    return str.trim().substring(0, maxLength);
};

// ==========================================
// 1. ECOSISTEMA GLOBAL
// ==========================================

export const createGlobalUser = (data = {}) => ({
  uid: sanitizeString(data.uid),
  email: sanitizeString(data.email),
  nombre: sanitizeString(data.nombre, 100),
  createdAt: data.createdAt || serverTimestamp(),
});

export const createBandModel = (data = {}) => ({
  customId: sanitizeString(data.customId) || `BN-${Math.floor(1000 + Math.random() * 9000)}`,
  nombre: sanitizeString(data.nombre, 100),
  ownerId: sanitizeString(data.ownerId),
  members: Array.isArray(data.members) ? data.members : [],
  admins: Array.isArray(data.admins) ? data.admins : [],
  inviteCode: sanitizeString(data.inviteCode, 10).toUpperCase(),
  createdAt: data.createdAt || serverTimestamp(),
});

// ==========================================
// 2. OBJETOS OPERATIVOS (Subcolecciones)
// ==========================================

export const createMusicianModel = (data = {}) => ({
  uid: sanitizeString(data.uid),
  role: ['Administrador', 'Editor', 'Visor'].includes(data.role) ? data.role : 'Visor', 
  profile: sanitizeString(data.profile, 50) || 'Musico',
  instrument: { // Mantenemos la estructura actual del objeto `instrument` para compatibilidad
      id: sanitizeString(data.instrument?.id || data.instrumentId),
      nombre: sanitizeString(data.instrument?.nombre || data.instrumentName, 50) || 'Por definir'
  },
  joinedAt: data.joinedAt || serverTimestamp(),
  updatedAt: serverTimestamp(),
  bandId: sanitizeString(data.bandId)
});

export const createSongModel = (data = {}) => ({
  customId: sanitizeString(data.customId) || `SG-${Math.floor(1000 + Math.random() * 9000)}`,
  titulo: sanitizeString(data.titulo, 150),
  letra: sanitizeString(data.letra, 5000), // Límite generoso pero seguro
  acordes: sanitizeString(data.acordes, 5000), // Mantenido para retrocompatibilidad
  chordProContent: sanitizeString(data.chordProContent, 10000), // Nuevo formato avanzado
  hasChords: Boolean(data.hasChords || data.chordProContent), 
  tono: sanitizeString(data.tono || data.tonalidad, 10), // Fix para capturar form data
  duracion: Number(data.duracion) || 0,
  createdAt: data.createdAt || serverTimestamp(),
  updatedAt: serverTimestamp(),
  bandId: sanitizeString(data.bandId)
});

export const createGigModel = (data = {}) => ({
  customId: sanitizeString(data.customId) || `GG-${Math.floor(1000 + Math.random() * 9000)}`,
  lugar: sanitizeString(data.lugar, 200),
  fecha: data.fecha || null, // Se espera un string YYYY-MM-DD o timestamp
  pago: Number(data.pago) || 0,
  setlist: Array.isArray(data.setlist) ? data.setlist : [],
  createdAt: data.createdAt || serverTimestamp(),
  updatedAt: serverTimestamp(),
  bandId: sanitizeString(data.bandId)
});

export const createRehearsalModel = (data = {}) => ({
  customId: sanitizeString(data.customId) || `RH-${Math.floor(1000 + Math.random() * 9000)}`,
  fecha: data.fecha || null,
  notas: sanitizeString(data.notas, 2000),
  asistentes: Array.isArray(data.asistentes) ? data.asistentes : [],
  createdAt: data.createdAt || serverTimestamp(),
  updatedAt: serverTimestamp(),
  bandId: sanitizeString(data.bandId)
});

export const createFinanceTransactionModel = (data = {}) => ({
  customId: sanitizeString(data.customId) || `FN-${Math.floor(1000 + Math.random() * 9000)}`,
  tipo: ['ingreso', 'egreso'].includes(data.tipo) ? data.tipo : 'egreso',
  monto: Number(data.monto) || 0,
  descripcion: sanitizeString(data.descripcion, 500),
  fecha: data.fecha || null, // A menudo llega como string desde el input de fecha
  registradoPor: sanitizeString(data.registradoPor),
  createdAt: data.createdAt || serverTimestamp(),
  updatedAt: serverTimestamp(),
  bandId: sanitizeString(data.bandId)
});

export const createGearModel = (data = {}) => ({
  customId: sanitizeString(data.customId) || `GR-${Math.floor(1000 + Math.random() * 9000)}`,
  name: sanitizeString(data.name, 100),
  tipo: sanitizeString(data.tipo, 50),
  estado: ['Bueno', 'Regular', 'Reparación'].includes(data.estado) ? data.estado : 'Bueno',
  propietario: sanitizeString(data.propietario) || 'band',
  createdAt: data.createdAt || serverTimestamp(),
  updatedAt: serverTimestamp(),
  bandId: sanitizeString(data.bandId)
});

export const createInvitationModel = (data = {}) => ({
  email: sanitizeString(data.email || data.correo).toLowerCase(),
  nombre: sanitizeString(data.nombre, 50),
  apellido: sanitizeString(data.apellido, 50),
  perfil: sanitizeString(data.perfil, 50) || 'Musico',
  permisos: ['Administrador', 'Editor', 'Visor'].includes(data.permisos) ? data.permisos : 'Visor',
  status: sanitizeString(data.status, 20) || 'pending',
  bandId: sanitizeString(data.bandId),
  createdAt: data.createdAt || serverTimestamp(),
  updatedAt: serverTimestamp()
});
