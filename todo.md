# Plan de Acción y Revisión del Proyecto (Director de Orquesta)

## Estado Actual (Análisis Preliminar)

Hemos detectado varios puntos de deuda técnica importantes en `deuda_tecnica.md` relacionados con la consistencia de datos, falta de paginación y redundancia de identificadores.

## Delegación de Tareas

**1. @arquitecto.md**: Revisa `deuda_tecnica.md` y estructura un nuevo modelo de datos unificado. Necesitamos definir cómo se manejarán los perfiles globales vs perfiles de banda (`users` vs `musicians`) y estandarizar los identificadores. Crea un `schema.json` preliminar con esta propuesta.
**2. @backend.md**: Analiza `src/services/firestoreService.js`. Prepárate para implementar las lecturas paginadas y escribir transacciones (o batches) para operaciones críticas como `createBand`.
**3. @frontend.md**: Revisa los componentes actuales (ej. `Dashboard`, `Rehearsals`). Prepárate para refactorizar estilos en línea, verificar que las listas paginadas incluyan feedback visual, y asegura que todas las entradas tengan animaciones usando `framer-motion`.
**4. @guardian.md**: Inicia la auditoría de seguridad. Busca logs innecesarios, valida que no haya _API keys_ en el frontend y cerciórate de que hay un manejo de errores robusto (`try/catch`) en todas las peticiones asíncronas para evitar pantallas blancas.
