# Design

## Context

Greenfield, `openspec/specs/` vacío. Ver `proposal.md - Why`.
Restricciones: PWA estática sin backend, todo en cliente, español único, efímera. Mobile-first real (uso en bar con una mano). OCR local con Tesseract.js `spa`.

Router diseño (design-router):
```
Router Progress:
- [x] Step 1: Fetch live stars/design list (4 repos: impeccable, awesome-design-md, ui-ux-pro-max, diagram-design)
- [x] Step 2: Clasificado como A) New app UI -> herramienta elegida: `pbakaus/impeccable`
- [ ] Step 3: Instalar en apply (`npx impeccable install --providers=opencode`) + copiar DESIGN.md referencia
- [ ] Step 4: Cerrar con `audit`/`polish` + checks Playwright 375/768/1024/1440
```

## Goals / Non-Goals

**Goals:**
- PWA instalable, <3s interactiva en 4G gama media, usable a 360px sin scroll horizontal.
- Flujo en 3 toques: Foto -> Revisar -> Girar.
- OCR local fiable-best-effort con revisión humana que compensa la calidad Tesseract.
- Dirección visual propia, no plantilla SaaS genérica.

**Non-Goals:**
- Sin login, sin sync, sin historial, sin backend, sin pagos.
- Sin manuscrita, sin multi-idioma, sin Vision LLM en v1.
- Sin diagrama editorial (no aplica `diagram-design` aquí).

## Decisions

### 1. Stack PWA estática
**Qué:** Vite + TS + PWA (Workbox) + hosting estático. Sin framework pesado necesario; ruleta en Canvas/SVG propio.
**Por qué sobre Next/SSR:** no hay servidor, efímero, despliegue trivial, funciona offline tras primera carga.
**Alternativa descartada:** app nativa (sobrecoste store, innecesario para v1).

### 2. OCR: Tesseract.js + `spa` solo
**Qué:** `tesseract.js@6`, lang `spa`, worker dedicado, assets en caché PWA. Downscale a 2000px, canvas gris + contraste + umbral adaptativo antes de reconocer.
**Por qué sobre Vision LLM:** coste 0, privacidad total, coherente con efímero. Acepta peor calidad a cambio de editor excelente.
**Alternativa:** híbrido LLM futuro tras bandera, sin cambiar specs.

### 3. Estado solo sesión
Memoria + `sessionStorage` opcional en la sesión. Nada en `localStorage`/IndexedDB persistente. Al cerrar se pierde. Sin analytics.

### 4. Ruleta: Canvas con reduced-motion
Canvas 60fps, deceleración easeOut cúbico, RNG `crypto.getRandomValues`. Si `prefers-reduced-motion`: sin giro animado, resultado instantáneo con highlight. Resultado siempre texto + anuncio aria-live.

### 5. Dirección visual (impeccable + DESIGN.md referencia)
**Herramienta:** `impeccable` flujo `init -> shape/craft -> polish/audit`. Si falta skill/CLI en apply, instalar con `npx impeccable install --providers=opencode` y leer su README.
**Referencia:** copiar un `DESIGN.md` lúdico de `https://getdesign.md/` (awesome-design-md, ej. estilo food/playful, no corporativo) a raíz como punto de partida, luego personalizar. No fijar marca aún; la define `shape`.
**Tokens propuestos (a validar en `shape`):**
- Color: base crema cálida papel-carta `#FFF8EC`, tinta `#1A1C1E`, acento tomate-picante `#E4572E` + verde albahaca `#2A9D48` para éxito. Nada de gradiente morado-azul.
- Tipo: display condensada con carácter (ej. `Archivo Expanded` / `Bricolage` o similar de Google Fonts, 2 familias max, `display=swap`) + grotesca legible para UI (>=16px cuerpo). Nada de Inter-only / system-only.
- Forma: radios grandes 20-28px, borde tinta 2px estilo "pegatina de bar", sombras duras offset (neo-brutalismo suave), sin cards-in-cards, sin glow oscuro, iconos SVG Lucide, cero emoji-como-icono.
- Ritmo: targets >=44px, gaps >=8px, bottom-bar pulgar en móvil (Foto / Manual / Girar).
**Anti-patrones prohibidos:** Inter-only, gradiente morado-azul, cards-in-cards, gris sobre color, bounce/elastic, dark-glow spam, emoji como icono.
**Mobile-first obligatorio:** base 360-375px columna única, luego 768/1024/1440. Sin scroll horizontal a 360px. Tablas -> cards.

## Risks / Trade-offs

- [Tesseract flojea con poca luz/perspectiva] -> Mitigación: guía de encuadre en UI + pre-proceso + pantalla revisión; mensaje honesto, no promesa perfecta.
- [Peso WASM ~4MB + 5-15s en gama baja] -> Mitigación: lazy-load worker solo al pulsar Foto, caché PWA, progreso %, downscale. Verificar con Lighthouse mobile.
- [HEIC iOS no decodifica en canvas] -> Mitigación: detectar y pedir "elige JPG o toma foto directa"; documentar límite.
- [iOS Safari memoria WASM 12MP] -> Mitigación: downscale agresivo + `OffscreenCanvas` donde exista.
- [Dirección visual genérica] -> Mitigación: gate `impeccable audit` + `polish`/`bolder`; si parece plantilla SaaS, cambiar DESIGN.md referencia y rehacer.

## Migration Plan

No hay migración (greenfield). Despliegue: build estático + HTTPS. Rollback: redeploy versión anterior. PWA versionada por hash Workbox.

## Open Questions

- Ninguna que bloquee specs o tareas. Marca exacta de DESIGN.md (qué referencia food/playful concreta) se decide en `shape` durante apply sin cambiar alcance.
