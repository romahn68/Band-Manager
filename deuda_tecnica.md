# Reporte de Deuda Técnica y Arquitectura

**Rol**: @arquitecto.md

Tras revisar la estructura del proyecto y el diseño de la base de datos (específicamente `firestoreService.js` y el diseño de Firestore), he detectado los siguientes elementos de deuda técnica que podrían causar problemas de escalabilidad y mantenibilidad en el futuro:

## 1. Falta de Transacciones/Batch en Operaciones Críticas

Actualmente, la creación de una banda (función `createBand`) realiza escrituras secuenciales (`setDoc` de la banda y luego `setDoc` del músico). Si la conexión falla entre ambas operaciones, la base de datos quedará en un estado inconsistente (una banda sin admin o un músico huérfano).

* **Mejora**: Utilizar `writeBatch` o transacciones de Firestore para garantizar atomicidad y solidez.

## 2. Paginación Ausente en Colecciones Principales

Funciones como `getSongs`, `getMusicians`, `getRehearsals`, `getFinances` y `getGear` obtienen los documentos utilizando un `getDocs` **sin límites ni paginación**.
Para bandas de larga trayectoria con cientos de canciones, registros financieros o ensayos, esto va a consumir un volumen excesivo de lecturas (Reads) en Firestore, lo cual incrementará drásticamente los costos y degradará el rendimiento.

* **Mejora**: Implementar paginación (basada en cursores o límites) para todas las listas grandes, de forma similar a `getGigsPaginated`.

## 3. Duplicación de Datos del Usuario

La información del perfil de un usuario (`nombre`, `email`) se está copiando como documento dentro de la subcolección `musicians` de cada banda a la que pertenece este usuario.
Si el usuario desea cambiar su nombre o email desde su perfil global, habrá un desfase porque esta información no se actualizará automáticamente en las subcolecciones `musicians` de las `X` bandas a las que pertenezca.

* **Mejora**: El documento de `musicians` debe guardar solo el `uid`, `rol`, `instrumento` y otros datos específicos de su rendimiento en la banda, mientras que los datos personales (`nombre`, foto, etc.) deben ser traídos del documento central `/users/{uid}` o manejados con Cloud Functions de sincronización (Fan-out).

## 4. Redundancia de Identificadores

El sistema está guardando las propiedades `id`, `[entidad]_id` (ej. `song_id`, `band_id`) y adicionalmente un `customId`.

* **Mejora**: Esto ensucia el esquema. Se debería estandarizar en un solo ID de documento, y si se requiere un ID "legible" (como el `customId`), mantener solo ese extra. Guardar la misma llave 3 veces en el documento aumenta el tamaño de la base de datos inútilmente.

## 5. Falta de Modularidad / String Mágicos

La función `addItem` contiene un `typeMap` con hardcodes de strings como `'songs': 'song'`, `'gear': 'gear'`, etc.

* **Mejora**: Deberían abstraerse en un archivo de constantes o enums (ej. `src/utils/constants.js`) para prevenir errores de tipeo y centralizar la configuración.
