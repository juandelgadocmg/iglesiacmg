

## Plan: Hacer la app responsive para móvil

El problema principal es que el sidebar es fijo y ocupa espacio en pantallas pequeñas, empujando el contenido fuera de la vista. Además, varias páginas tienen grids y tablas que no se adaptan bien.

### Cambios a implementar

#### 1. Sidebar mobile: ocultar y usar drawer
**Archivo**: `src/components/layout/AppSidebar.tsx`
- En móvil (`< 768px`), el sidebar se oculta completamente
- Se muestra como un **Sheet/Drawer** que se abre desde un botón hamburguesa en el header
- Al hacer clic en un enlace del menú, el drawer se cierra automáticamente

#### 2. Header mobile: agregar botón hamburguesa
**Archivo**: `src/components/layout/AppHeader.tsx`
- Agregar botón `Menu` (hamburguesa) visible solo en móvil (`md:hidden`)
- Reducir padding en móvil (`px-4` en vez de `px-6`)
- Ocultar breadcrumbs largos en pantallas pequeñas

#### 3. Layout: ajustar padding en móvil
**Archivo**: `src/components/layout/AppLayout.tsx`
- Cambiar `p-6` del main a `p-3 md:p-6` para dar más espacio al contenido en móvil

#### 4. Dashboard: grids responsivos
**Archivo**: `src/pages/Dashboard.tsx`
- Los grids de KPIs y secciones ya usan `grid-cols-2 lg:grid-cols-4`, lo cual está bien
- Ajustar textos del header para que no se corten

#### 5. Personas: paginación y filtros responsivos
**Archivo**: `src/pages/PersonasPage.tsx`
- La paginación usa botones con texto que se corta en móvil — simplificar a solo íconos en pantallas pequeñas
- Los tabs de filtro de tipo ya usan `flex-wrap`, lo cual está bien

#### 6. DataTable: scroll horizontal
**Archivo**: `src/components/shared/DataTable.tsx`
- Ya tiene `overflow-x-auto`, está correcto
- Ajustar paginación para ser más compacta en móvil

### Archivos a modificar
1. `src/components/layout/AppSidebar.tsx` — convertir a drawer en móvil
2. `src/components/layout/AppHeader.tsx` — botón hamburguesa
3. `src/components/layout/AppLayout.tsx` — padding responsive
4. `src/pages/PersonasPage.tsx` — paginación compacta en móvil

### Resultado esperado
- En **desktop**: sin cambios, sidebar fijo lateral como está ahora
- En **móvil**: sidebar oculto, se abre como panel lateral deslizable desde el header, todo el contenido usa el ancho completo de la pantalla

