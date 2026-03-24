---
description: auditoria total
---

## 1. Contexto y arquitectura

* **Objetivo funcional**: Resume en 1–2 párrafos el objetivo funcional de la app (qué resuelve para una banda/músicos).
* **Arquitectura actual**: Describe la arquitectura actual detallando el frontend, backend (Firebase Functions), base de datos (Firestore), storage, reglas de seguridad, cliente Android y scripts auxiliares.
* **Estilo arquitectónico**: Identifica el estilo (por ejemplo: SPA React, BaaS con Firebase, arquitectura por features, etc.) y evalúa si es coherente con los objetivos del proyecto.

## 2. Estructura del proyecto

* **Organización de la lógica**: Recorre la estructura de carpetas (`src`, `functions`, `android`, `scripts`, etc.) y explica cómo está organizada la lógica: vistas/páginas, componentes, hooks, servicios, contexto global, módulos de dominio (bandas, músicos, canciones, finanzas, ensayos, etc.).
* **Aciertos**: Señala los aciertos en la organización (separación de responsabilidades, atomización, reutilización).
* **Reestructuración ideal**: Propón una reestructuración ideal (si hace falta), indicando qué moverías, renombrarías o agruparías (por ejemplo: por dominio, por capa, por tipo de recurso).

## 3. Calidad del código frontend (React + Vite)

* **Análisis de componentes clave**: Revisa los patrones usados (presentational/containers, hooks personalizados, context API, etc.), manejo de estado, formularios, validaciones, navegación y diseño responsivo.
* **Evaluación específica**:
    * Legibilidad y claridad (nombres, tamaño de componentes, complejidad de funciones).
    * Reutilización de componentes y estilos (design system, atomización, Glassmorphism, etc.).
    * Gestión de efectos secundarios (`useEffect`, llamadas a Firebase, subscripciones).
* **Detección de anti‑patterns**: Identifica problemas como prop‑drilling excesivo, lógica duplicada, componentes gigantes o estados mal ubicados, y explica cómo refactorizarlos.

## 4. Backend/Firebase y reglas de seguridad

* **Cloud Functions**: Revisa la estructura, modularización, patrones, manejo de errores, logs y rendimiento.
* **Reglas de seguridad (`firestore.rules` y `storage.rules`)**:
    * Evalúa el nivel de seguridad (lectura/escritura, validaciones por rol/propietario, reglas por colección).
    * Señala reglas peligrosas o demasiado permisivas y propone reglas más seguras.
* **Modelo de datos (`schema.json`)**:
    * Revisa cómo se mapean las entidades (bandas, músicos, canciones, ensayos, finanzas, etc.) en Firestore.
    * Propón mejoras: colecciones, subcolecciones, índices necesarios, campos calculados, normalización vs. duplicación para consultas eficientes.

## 5. Performance y escalabilidad

* **Identificación de cuellos de botella**:
    * Consultas sin índices, lecturas masivas de colecciones, listeners en tiempo real innecesarios.
    * Renderizados excesivos en React, falta de memoización, cálculos pesados en el render.
* **Optimizaciones concretas**:
    * Sugiere el uso de índices, paginación, cacheo en cliente, `React.memo`/`useMemo`/`useCallback` cuando aplique.
    * Propón estrategias para entornos con mala conexión o móviles de gama media.

## 6. Calidad técnica general

* **Buenas prácticas JS/React**: Evalúa el uso de ESLint y configuración de estilo (`eslint.config.js`, `.eslintignore`) y si se cumplen las buenas prácticas.
* **Deuda técnica**: Señala la deuda técnica real que veas en el código y compárala con lo documentado en `deuda_tecnica.md` (si aplica).
* **Revisión de `package.json`**:
    * Identifica dependencias innecesarias, obsoletas o duplicadas.
    * Revisa scripts útiles o faltantes (build, lint, test, deploy, etc.).
* **Plan de acción**: Propón una lista priorizada de refactors de alto impacto (del 1 al 5, por prioridad).

## 7. UX/UI y experiencia de músico/manager

* **Análisis de la experiencia de usuario**: Con base en los componentes y vistas, describe la experiencia para:
    * **Manager**: Administración de bandas, músicos, canciones, ensayos y finanzas.
    * **Músico**: Consulta de repertorio, ensayos, pagos, etc.
* **Contraste con la documentación**: Compara estas observaciones con `mejoras_ux.md` y `todo.md` y sugiere mejoras adicionales (flujo más claro, reducción de fricción, mejora de formularios, feedback de errores, estados vacíos, etc.).
* **Micro-interacciones**: Sugiere 3–5 micro‑interacciones o detalles UI que se alineen con el estilo Glassmorphism ya implementado.

## 8. Seguridad y buenas prácticas generales

* **Posibles riesgos**:
    * Exposición de claves, configuración de Firebase, endpoints sensibles.
    * Falta de validación en cliente/servidor, inyección de datos, uso inseguro de datos del usuario.
* **Medidas concretas**:
    * Propón el uso de variables de entorno, separación de credenciales, uso adecuado de roles y sanitización.
    * Recomienda estrategias de logging y monitorización mínima.

## 9. Testing, mantenibilidad y roadmap

* **Nivel actual de testing**: Evalúa si hay tests y recomienda:
    * Tipos de tests prioritarios (unitarios, integración, end‑to‑end).
    * Herramientas apropiadas (Jest, React Testing Library, Cypress, etc.).
* **Estrategia de mantenimiento**:
    * Sugiere cómo organizar issues/roadmap a partir de `todo.md`, `mapa_proyecto.md` y `deuda_tecnica.md`.
    * Establece convenciones de commits, ramas y revisiones de PR.

## 10. Entregable final

Genera un informe estructurado con secciones numeradas (1 a 9), donde cada sección incluya obligatoriamente:
* **Diagnóstico actual**: Hechos concretos basados en el código revisado.
* **Riesgos o problemas**: Consecuencias de las implementaciones actuales.
* **Recomendaciones accionables**: Pasos claros a seguir, con ejemplos de refactorización cuando aporte claridad.