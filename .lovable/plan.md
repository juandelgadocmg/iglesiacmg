

## Plan: Cancelar Actividad con Motivo + Asistencia Manual/QR en Eventos

---

### Problema 1: Cancelación de eventos
El botón "Cancelar" en la pestaña General (línea 150) solo ejecuta `onBack()` (vuelve atrás), no cancela el evento. Se necesita un botón dedicado "Cancelar Actividad" que abra un diálogo con campo de motivo, como en la imagen de referencia.

### Problema 2: Asistencia del evento
La pestaña "Asistencias" solo muestra inscripciones en una tabla de solo lectura. No permite registrar asistencia manual ni por QR. Se necesita un flujo similar al de servicios.

---

### Cambios

**1. Database: agregar columna `motivo_cancelacion` a `eventos`**
- Migración SQL: `ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS motivo_cancelacion text DEFAULT NULL;`

**2. `EventoDetailView.tsx` — Cancelar Actividad**
- Agregar un botón rojo "Cancelar Actividad" en la pestaña General (separado del botón "Cancelar" que es solo "volver").
- Al hacer clic, abre un `Dialog` con:
  - Encabezado rojo con ícono de prohibido: "Cancelar Actividad"
  - Texto: "Por medio de este formulario podrás cancelar la actividad [nombre]"
  - Textarea: "Ingresa los motivos por los cuales se cancelará la actividad"
  - Botones: "Cancelar Actividad" (acción) y "Salir" (cerrar)
- Al confirmar: actualiza el evento con `estado: "Cancelado"` y `motivo_cancelacion: motivo`.

**3. `EventoDetailView.tsx` — Asistencia manual + QR**
- Reemplazar el contenido actual de la pestaña "Asistencias" con:
  - Estadísticas (Total Inscritos, Presentes, Pendientes)
  - Botón "Lector QR" que reutiliza `QrAttendanceScanner` adaptado para eventos (busca persona por QR y marca `confirmado = true` en su inscripción)
  - Barra de búsqueda "Buscar asistente por código, nombre o cédula..."
  - Resultados de búsqueda con botón para marcar asistencia (toggle `confirmado`)
  - Lista de inscripciones con checkbox/badge para marcar presente/ausente con un clic
- Se usará `useUpdateInscripcion` existente para alternar el campo `confirmado` como indicador de asistencia.

**4. Adaptar `QrAttendanceScanner` para eventos**
- Crear una variante o prop adicional (`mode: "servicio" | "evento"`) o un componente nuevo `QrEventoScanner` que al escanear el QR de una persona, busque su inscripción en el evento y la marque como `confirmado = true`.

---

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| Migración SQL | `motivo_cancelacion` en `eventos` |
| `EventoDetailView.tsx` | Diálogo de cancelación + pestaña asistencia con búsqueda manual y QR |
| `QrAttendanceScanner.tsx` o nuevo componente | Soporte para marcar asistencia en eventos por QR |

