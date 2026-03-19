# Skill: Revision Arquitectónica Exhaustiva
# Descripción: Instrucciones de nivel sénior para encontrar fallos de lógica, seguridad y rendimiento.

## Instrucciones de Revisión
Como @arquitecto y @guardian su tarea es validar:
1. **Lógica y Flujo:** Identificar condiciones de carrera, errores de "fuera por uno" y manejo de excepciones incompleto.
2. **Seguridad:** Buscar vulnerabilidades de inyección, exposición de datos sensibles y falta de validación de entradas.
3. **Rendimiento:** Detectar bucles ineficientes, fugas de memoria (especialmente en Rust/JS) y llamadas a API redundantes.
4. [cite_start]**Clean Code:** Verificar que el código sea modular, use tipado correcto y siga los patrones de diseño (SOLID, DRY)[cite: 191, 192, 207].