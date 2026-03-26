

## Plan: Dashboard Tema Semana, WhatsApp en Personas, Ajustes Eventos y Finanzas

---

### 1. Dashboard — Tema de la Semana siempre visible

**Problema**: `DashboardTemaSemana` retorna `null` si no hay título ni descripción configurados.

**Solución**: Eliminar la condición que oculta el componente. Mostrar siempre la tarjeta con un mensaje por defecto ("Sin tema configurado") y el botón "Editar" para ir a Configuración.

**Archivo**: `src/components/dashboard/DashboardTemaSemana.tsx`

---

### 2. Personas — Link de WhatsApp en el teléfono

**Cambio**: En `PersonasPage.tsx`, convertir la línea del teléfono en un enlace clickeable que abra WhatsApp (`https://wa.me/<número>`). Se limpiará el número (quitar espacios, guiones) y se agregará un ícono de WhatsApp junto al ícono de teléfono.

**Archivo**: `src/pages/PersonasPage.tsx` (línea ~191)

---

### 3. Eventos — Selección de tipo de evento y cancelación

Según el documento:
- **Tipo de evento**: El formulario actual tiene tipos como "Conferencia", "Retiro", etc. pero el documento pide tipos como "Evento Gratuito", "Evento Cerrado", "Evento Abierto". Se agregarán estos tipos al `Select` del `EventoFormDialog`.
- **Cancelar/Eliminar evento**: Agregar estado "Cancelado" al formulario de edición y un botón "Cancelar Evento" en `EventoDetailView` con un diálogo de confirmación que pida motivo de cancelación.
- **Link de inscripción**: Generar un enlace compartible basado en el ID del evento para que las personas puedan inscribirse externamente.

**Archivos**:
- `src/components/forms/EventoFormDialog.tsx` — agregar tipos de evento (Gratuito/Cerrado/Abierto) y estado "Cancelado"
- `src/components/events/EventoDetailView.tsx` — botón cancelar evento con motivo, y mostrar link de inscripción copiable

---

### 4. Finanzas — Persona asociada (proveedor/cliente) y PUC

Según el documento, se necesita:
- **Asociar persona**: Campo para vincular una persona existente al registro financiero (como "proveedor" para gastos o "diezmador" para ingresos). Esto permite generar certificados de donaciones por persona.
- **Código PUC**: Campo de texto para el código contable en el formulario financiero.
- **Informe por persona**: En la pestaña de Donaciones o Reportes, poder filtrar por persona y descargar un certificado/informe detallado de sus diezmos y ofrendas.

**Database**: Migración para agregar columnas `persona_id` (FK a personas) y `codigo_puc` (text) a la tabla `finanzas`.

**Archivos**:
- `src/components/forms/FinanzaFormDialog.tsx` — agregar selector de persona y campo PUC
- `src/pages/FinanzasPage.tsx` — mostrar persona asociada en la tabla, agregar filtro por persona en reportes con opción de descargar certificado PDF de donaciones

---

### Detalle técnico

| Área | Archivos | Cambio |
|------|----------|--------|
| Dashboard | `DashboardTemaSemana.tsx` | Siempre visible, estado vacío amigable |
| Personas | `PersonasPage.tsx` | Link WhatsApp en teléfono |
| Eventos | `EventoFormDialog.tsx`, `EventoDetailView.tsx` | Tipos Gratuito/Cerrado/Abierto, cancelar evento, link inscripción |
| Finanzas | Migración SQL, `FinanzaFormDialog.tsx`, `FinanzasPage.tsx` | persona_id, codigo_puc, certificado donaciones |

