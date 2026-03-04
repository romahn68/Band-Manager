# Reporte de Mejoras UX/UI

**Rol**: @frontend.md (@sinte.md)

Tras revisar la implementación visual (específicamente `index.css` y `Dashboard.jsx`), destaco los siguientes puntos para pulir la experiencia de usuario y la mantenibilidad del frontend:

## 1. Falta de Reutilización de Componentes (Modularidad UI)

En `Dashboard.jsx`, el componente `StatCard` está definido dentro del mismo archivo de la página.

* **Mejora**: `StatCard` debe ser extraído a `src/components/StatCard.jsx`. Esto permitirá reutilizar este elemento visual en otras vistas (como Finanzas o Perfil de Banda) manteniendo la consistencia del diseño Glassmorphism.

## 2. Consistencia de Colores y Magic Strings

En el `Dashboard`, se pasan valores hexadecimales en duro (ej. `#f472b6`, `#8b5cf6`) a los componentes.

* **Mejora**: Modificar esto para utilizar las variables CSS ya definidas en `:root` dentro de `index.css` (`var(--accent-primary)`, etc.), o extender el `:root` con una paleta de estados (success, warning, info) para asegurar que un cambio de tema global se propague a todas las vistas automáticamente.

## 3. Renderizado Condicional del Header Móvil

Actualmente, el header específico para móviles (`.mobile-only-header`) utiliza `display: none` en desktop y se muestra mediante media queries.

* **Mejora**: En React, es más eficiente a nivel de DOM renderizar los componentes condicionalmente basándose en un hook como `useWindowSize`, evitando que elementos invisibles existan y consuman recursos en el DOM en resoluciones altas.

## 4. Animaciones y Transiciones de Estado

Si bien se usa `framer-motion` excelentemente para la carga inicial (`containerVariants`, `itemVariants`), se nota que al cargar datos (estado `loading` en el Dashboard), no hay un Skeleton loader. El usuario ve la pantalla vacía hasta que Firebase responde.

* **Mejora**: Implementar Skeleton Screens o placeholders con brillo (shimmer effect) utilizando el estilo `glass` mientras `loading === true`, para mejorar la percepción de velocidad.
