

## Fix: WhatsApp link no redirige

**Problema**: El link actual usa `wa.me` con una limpieza parcial del número (solo quita espacios, guiones y paréntesis pero deja el `+` y otros caracteres). Esto causa que no se resuelva correctamente en navegadores de escritorio.

**Solución**: Cambiar la URL a `https://api.whatsapp.com/send?phone=` y limpiar el número eliminando **todos** los caracteres no numéricos con `.replace(/\D/g, "")`.

**Archivo**: `src/pages/PersonasPage.tsx` (línea 196)

Cambio:
```tsx
// Antes
href={`https://wa.me/${p.telefono.replace(/[\s\-\(\)]/g, '')}`}

// Después
href={`https://api.whatsapp.com/send?phone=${(p.telefono || "").replace(/\D/g, "")}`}
```

Un solo cambio de una línea.

