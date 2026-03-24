---
description: Auditoria general del proyecto
---

---
name: auditoria-fullstack
description: Realiza una auditoría Full Stack exhaustiva del proyecto Band Manager (React, Vite, Firebase, Cloud Functions).
---

Actúa como un Arquitecto de Software y Desarrollador Full Stack Senior experto en React, Vite, Firebase (Firestore/Storage) y Node.js. Por favor, realiza una revisión de código exhaustiva y profunda de este espacio de trabajo (Band Manager).

Analiza la base de código bajo los siguientes 4 pilares, teniendo en cuenta mis reglas de entorno, y genera las correcciones necesarias:

**1. Frontend y UI/UX (React, Vite, CSS Modules):**
* Analiza la carpeta `@src/`. Verifica la correcta gestión del estado global y autenticación (uso de `@src/hooks/Contexts.js`, `@src/AuthContext.jsx` y `@src/AppContext.jsx`).
* Revisa los componentes en `@src/components/` y las vistas en `@src/pages/` para evitar renderizados innecesarios (revisar useEffects, useMemos, callbacks) y asegurar que el diseño sea responsivo.
* Verifica la configuración en `@vite.config.js` y `@package.json` para optimización de dependencias y bundles.

**2. Backend, Servicios y Seguridad (Firebase & Node.js):**
* Analiza las Cloud Functions en la carpeta `@functions/`. Verifica el manejo de errores, la eficiencia de las promesas y la seguridad de los endpoints.
* Revisa exhaustivamente las reglas de seguridad de Firebase: `@firestore.rules` y `@storage.rules` para prevenir vulnerabilidades de acceso no autorizado.
* Audita los servicios de la capa de acceso a datos en `@src/services/` (ej. `firestoreService.js`, `adminService.js`) para asegurar consultas eficientes (uso de índices correctos según `@firestore.indexes.json`).

**3. Calidad General del Código y Deuda Técnica:**
* Revisa los archivos `@deuda_tecnica.md` y `@todo.md` para alinear las prioridades de esta revisión con los problemas técnicos ya documentados.
* Evalúa la modularidad, escalabilidad y adherencia a los principios Clean Code.
* Detecta y advierte sobre código muerto, 'code smells' o funciones redundantes.

**4. Rendimiento y Optimización:**
* Identifica cuellos de botella de rendimiento en el cliente (especialmente en componentes pesados o en la carga de archivos multimedia en Storage).

**Entregables:**
1. Crea un **Implementation Plan** (Plan de Implementación) detallando los problemas críticos encontrados, organizados por las 4 categorías anteriores.
2. Genera las diferencias de código (**Code diffs**) con las refactorizaciones necesarias listas para mi revisión y aprobación.
3. Explica brevemente el 'por qué' de las refactorizaciones críticas propuestas.