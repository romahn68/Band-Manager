# Mapa de Proyecto: Band Manager

**Rol**: @analista.md

## 1. Resumen General del Sistema

Band Manager es una aplicación de gestión para bandas musicales con arquitectura Serverless. Permite a los músicos administrar sus finanzas, inventario, ensayos, repertorio (Songs), conciertos (Gigs), perfiles de banda y miembros. Está diseñada para funcionar en web y dispositivos móviles (usando Capacitor).

## 2. Pila Tecnológica (Tech Stack)

* **Frontend:** React (usando Vite), React Router DOM para navegación, Framer Motion para animaciones, Lucide React para iconos.
* **Backend / Base de Datos:** Firebase (Firestore, Auth, Functions) y arquitectura Serverless.
* **Almacenamiento Local / Offline:** Dexie.js (IndexedDB).
* **Móvil:** Capacitor (`@capacitor/core`, `@capacitor/android`, `@capacitor/camera`, `@capacitor-community/image-to-text`).
* **Utilidades:** `xlsx` para manejo de tablas/Excel.
* **Estilos:** Archivos CSS tradicionales y CSS Modules (`.module.css`).

## 3. Estructura de Carpetas Principal

* `src/pages/`: Vistas principales de la aplicación (Login, Dashboard, Gigs, Rehearsals, Songs, Finances, Inventory, Musicians, etc.).
* `src/components/`: Componentes UI reutilizables (Sidebar, Navbar, CommentsSection, ImportExcel, SmartTuner).
* `src/services/`: Lógica de negocio y backend encapsulada (firestoreService, adminService, commentService, emailService, excelService, ocrService).
* `src/hooks/` y `src/utils/`: Lógica compartida y utilidades.
* `firebase/`: Configuración y reglas (`firestore.rules`, `firebase.json`).

## 4. Flujos Principales Identificados

1. **Autenticación y Onboarding:** Flujo de entrada (`Login.jsx`, `Onboarding.jsx`, `JoinBand.jsx`).
2. **Gestión de Banda Central:** Un usuario puede pertenecer/cambiar entre bandas (`BandSwitcher.jsx`, `BandProfile.jsx`).
3. **Módulos Operativos:**
   * **Conciertos (Gigs)** y **Ensayos (Rehearsals)**.
   * **Repertorio (Songs)** y **Inventario (Inventory)**.
   * **Finanzas (Finances)**.
4. **Interacción y Colaboración:** Comentarios (`CommentsSection.jsx`), Chat (`ChatSession.jsx`).
5. **Gestión de Permisos y Roles:** Sistema de promoción de miembros a Admin/Manager desde `Musicians.jsx` con sincronización en el nodo raíz de la banda.
6. **Características Especiales:** Afinado inteligente (`SmartTuner.jsx`), OCR para imágenes, importación de Excel.
