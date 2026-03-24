---
description: Modulos vision
---

Inicia una auditoría de código profunda y exhaustiva centrada exclusivamente en los módulos core de este espacio de trabajo (Band Manager). Asume el rol de un Tech Lead especializado en React, Firebase y Arquitectura de Software.

Tu objetivo es evaluar la **estabilidad, funcionamiento y dependencias** de los siguientes 4 módulos. Busca errores silenciosos, problemas de dependencias en hooks (useEffect/useMemo), cálculos incorrectos, falta de validaciones defensivas y fallos en la integración con los servicios de Firebase.

Analiza los módulos bajo los siguientes criterios:

### 1. 🎸 Módulo: Músicos
* **Archivos a revisar:** `@src/pages/Musicians.jsx` y su integración con los modelos en `@src/models/DataModels.js`.
* **Estabilidad:** Verifica cómo se manejan los estados de carga y error al obtener la lista de músicos. ¿Qué sucede si un músico tiene datos incompletos o referencias rotas en Firestore?
* **Funcionamiento:** Revisa la lógica para añadir, editar o eliminar miembros. ¿Se están validando correctamente los permisos antes de ejecutar estas acciones?

### 2. 🎵 Módulo: Canciones (Repertorio y Partituras)
* **Archivos a revisar:** `@src/pages/Songs.jsx`, `@src/components/ChordProViewer.jsx` y `@src/components/AttachmentUploader.jsx`.
* **Estabilidad:** El renderizado de partituras (ChordPro) y la subida de archivos suelen ser propensos a fugas de memoria o cuelgues. Verifica que los componentes se desmonten correctamente y que los archivos pesados no bloqueen la UI.
* **Dependencias:** Analiza si las actualizaciones en el estado de una canción provocan re-renderizados masivos e innecesarios en toda la lista de canciones.

### 3. 💰 Módulo: Finanzas
* **Archivos a revisar:** `@src/pages/Finances.jsx`.
* **Funcionamiento:** Este módulo es crítico. Revisa exhaustivamente la lógica matemática (sumas de ingresos/egresos, distribución de pagos). Busca problemas clásicos de coma flotante en JavaScript y asegúrate de que los cálculos sean deterministas.
* **Estabilidad:** Verifica que las consultas a Firestore en este módulo estén optimizadas (ej. filtrado por fechas) para no descargar todo el historial financiero de golpe.

### 4. ⚙️ El Cuarto de Máquinas (Admin, Settings y Core)
* **Archivos a revisar:** `@src/pages/Settings.jsx`, `@src/pages/AdminDashboard.jsx`, `@src/services/adminService.js` y `@functions/index.js`.
* **Estabilidad y Seguridad:** Revisa cómo se manejan las migraciones de datos