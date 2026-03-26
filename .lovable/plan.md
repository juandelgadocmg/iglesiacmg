

## Plan: Limpiar todos los datos de prueba

Se eliminará todo el contenido de las tablas de datos transaccionales y personas, conservando los **49 grupos reales** de la iglesia y las tablas de configuración/estructura.

### Tablas a vaciar (DELETE FROM)

| Tabla | Registros | Motivo |
|-------|-----------|--------|
| `reporte_asistencia` | 9+ | Depende de reportes/personas |
| `reportes_grupos` | 3 | Reportes de prueba |
| `asistencia` | 9 | Depende de servicios/personas |
| `inscripciones` | 0 | Depende de eventos/personas |
| `evento_servidores` | ? | Depende de eventos/personas |
| `evento_encargados` | ? | Depende de eventos/personas |
| `evento_categorias` | ? | Depende de eventos |
| `grupo_miembros` | 3 | Depende de grupos/personas |
| `persona_procesos` | ? | Depende de personas |
| `relaciones_familiares` | ? | Depende de personas |
| `peticiones_oracion` | ? | Depende de personas |
| `donaciones` | 0 | Depende de personas |
| `finanzas` | 0 | Datos de prueba |
| `servicios` | 6 | Servicios de prueba |
| `eventos` | 6 | Eventos de prueba |
| `personas` | 57 | Todas las personas (se reimportarán) |

### Lo que se conserva
- **grupos** (49 registros reales de la iglesia)
- **configuracion_iglesia**, **banners**, **videos_iglesia**
- **categorias_financieras**, **procesos_crecimiento**
- Tablas académicas (cursos, periodos, materias, etc.)
- **profiles**, **user_roles**

### Implementación
Una sola operación SQL (usando la herramienta de inserción/datos) que ejecuta los DELETE en orden correcto para respetar dependencias. No se necesita migración porque no hay cambio de esquema.

