---
description: Revision con agentes
---

Inicia una sesión de 'Red Team' y cacería de errores para este espacio de trabajo (Band Manager). Para esta tarea, debes asumir simultáneamente los roles de mi equipo de agentes leyendo sus directrices: `@.agent/rules/arquitecto.md`, `@.agent/rules/backend.md`, `@.agent/rules/frontend.md` y `@.agent/rules/guardian.md`.

Su misión conjunta no es proponer nuevas *features*, sino **destruir, probar casos límite y encontrar fallos críticos, bugs, condiciones de carrera (race conditions) y vulnerabilidades** en la base de código actual.

Dividan su análisis y el reporte final según el rol de cada agente:

### 1. 🛡️ El Guardián (Seguridad y Prevención de Desastres)
* Analiza `@firestore.rules` y `@storage.rules`. ¿Hay alguna forma de que un usuario malintencionado lea partituras, finanzas o datos de otras bandas?
* Revisa la autenticación en `@src/AuthContext.jsx` y el manejo de tokens/sesiones. ¿Hay posibles fugas de información o rutas protegidas mal implementadas en React Router?

### 2. ⚙️ El Backend (Firebase, Functions y Servicios)
* Revisa `@functions/index.js` y la carpeta `@src/services/`. Busca promesas sin resolver (unhandled rejections), falta de bloques `try/catch`, o llamadas a la base de datos que podrían generar bucles infinitos y disparar la facturación de Firebase.
* Verifica si los índices en `@firestore.indexes.json` realmente cubren las consultas que se hacen en los servicios.

### 3. 🎨 El Frontend (React, Vite, Capacitor y UI/UX)
* Busca componentes en `@src/components/` o `@src/pages/` que puedan causar *memory leaks* (ej. `useEffects` sin funciones de *cleanup* al desmontar) o renderizados infinitos.
* Revisa el manejo de errores en la UI. ¿Qué pasa si la red falla en medio de la subida de un archivo en `@src/components/AttachmentUploader.jsx`? ¿La app crashea o da feedback?

### 4. 🏗️ El Arquitecto (Lead & Performance)
* Como líder, revisa la integración entre Capacitor, React y Firebase. Busca inconsistencias en los modelos de datos de `@src/models/DataModels.js` versus lo que realmente se guarda en la DB según `@schema.json`.
* Identifica cuellos de botella de rendimiento graves.

### Entregables:
1. Un reporte de auditoría estructurado por agente, listando los **Errores Críticos** y **Errores Moderados** encontrados.
2. Por cada error crítico, genera el **Code diff** (diferencia de código) con la solución defensiva implementada, listo para que yo lo revise y apruebe.