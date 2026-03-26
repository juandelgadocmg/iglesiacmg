

## Plan: Reorganizar Sidebar, Dashboard Tema PDF, Personas Paginadas, Formulario de Planificación de Grupos

---

### Resumen

1. Mover Banners, Videos y Señal en Vivo dentro de Configuración (como pestañas), eliminando sus entradas del sidebar y sus rutas independientes.
2. Rediseñar el "Tema de la semana" en el Dashboard con botones Ver (modal/PDF descargable), Abrir link, Editar — estilo de la imagen de referencia.
3. Reducir las métricas de Personas a solo 6 (Total, Miembros, Visitantes, Discípulos, Líderes CDP, Líderes de Red) y agregar paginación a las tarjetas de personas.
4. Crear un formulario de "Hoja de Planificación" en el módulo de Grupos, replicando el formulario de Google Forms de CMG.

---

### 1. Consolidar Banners/Videos/Señal en Vivo dentro de Configuración

**Cambios:**
- **`ConfiguracionPage.tsx`**: Agregar pestañas (Tabs) — "General", "Banners", "Videos", "Señal en Vivo". Importar el contenido de los 3 módulos existentes directamente como componentes dentro de las pestañas.
- **`AppSidebar.tsx`**: Eliminar las 3 entradas del menú (Banners, Videos, Señal en Vivo).
- **`App.tsx`**: Eliminar las 3 rutas `/banners`, `/videos`, `/senal-en-vivo`.
- **`permissions.ts`**: Limpiar las rutas eliminadas.

### 2. Dashboard — Tema de la Semana con descarga PDF

**Cambios:**
- **`DashboardTemaSemana.tsx`**: Rediseñar con estilo teal (como la imagen de referencia) con icono de documento grande, título "Tema de la semana", el texto del tema, y 3 botones:
  - **Ver**: Abre un modal/dialog mostrando el detalle del tema.
  - **Abrir link**: Abre el URL externo (si existe).
  - **Editar**: Navega a `/configuracion`.
  - **Descargar PDF**: Genera un PDF sencillo con jsPDF conteniendo el título y descripción del tema.

### 3. Personas — Reducir métricas y paginar tarjetas

**Cambios:**
- **`PersonasPage.tsx`**:
  - Reducir el grid de métricas a 6 tarjetas: Total, Miembros, Visitantes, Discípulos, Líderes CDP, Líderes de Red.
  - Agregar estado de paginación (`page`, `pageSize = 9`) sobre el array `filtered`.
  - Mostrar solo `pageSize` tarjetas por página.
  - Agregar controles de paginación debajo del grid (usando componente `Pagination` existente) con indicador "1 - 9 de X registros".

### 4. Grupos — Formulario de Planificación (Hoja de Planeación)

**Database:**
- Nueva tabla `planificaciones_grupo` con columnas: `id`, `grupo_id` (FK), `red`, `lider_nombre`, `evaluacion_equipo` (jsonb — grid SI/NO para 12 actividades), `responsable_invitacion`, `medios_invitacion` (text[]), `personas_invitadas` (int), `responsable_recordar`, `medios_recordar` (text[]), `fecha_ayuno` (date), `fecha_evangelizacion` (date), `responsable_oracion`, `responsable_adoracion`, `responsable_dinamicas`, `responsable_predicacion`, `responsable_testimonios`, `responsable_ayudas`, `responsable_datos`, `responsable_consolidacion`, `responsable_seguimiento`, `created_at`, `created_by`.

**Archivos nuevos:**
- **`src/components/forms/PlanificacionGrupoFormDialog.tsx`**: Formulario multi-sección replicando las 4 secciones del Google Form:
  1. Datos del grupo (Red, Líder, Casa de Paz)
  2. Evaluación del equipo de trabajo (grid SI/NO con las 12 actividades)
  3. Antes de la Casa de Paz (responsables, medios, fechas de ayuno/evangelización)
  4. Durante/Después (7 responsables de actividades + consolidación y seguimiento)
- **`src/hooks/usePlanificaciones.ts`**: Hook para CRUD de planificaciones.

**Cambios:**
- **`GruposPage.tsx`**: Agregar una pestaña "Planificación" que liste las planificaciones existentes y permita crear nuevas con el formulario.

---

### Detalle técnico

| Área | Archivos afectados |
|------|-------------------|
| Sidebar/Rutas | `AppSidebar.tsx`, `App.tsx`, `permissions.ts` |
| Configuración | `ConfiguracionPage.tsx` (tabs con contenido de Banners/Videos/Señal) |
| Dashboard | `DashboardTemaSemana.tsx` (rediseño + PDF con jsPDF) |
| Personas | `PersonasPage.tsx` (6 métricas + paginación) |
| Grupos | `GruposPage.tsx`, nuevo `PlanificacionGrupoFormDialog.tsx`, nuevo `usePlanificaciones.ts` |
| Database | 1 migración: tabla `planificaciones_grupo` con RLS |

