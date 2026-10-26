# Tasks

## 1. Setup PWA + tooling visual

- [x] 1.1 Inicializar Vite TS PWA estática con manifest, iconos y Service Worker y verificar `npm run build` genera `dist/` instalable
- [x] 1.2 Instalar tooling visual con `npx impeccable install --providers=opencode` y verificar aparece skill/command impeccable disponible
- [x] 1.3 Copiar un `DESIGN.md` referencia lúdica desde `https://getdesign.md/` (awesome-design-md) a raíz y verificar el agente lo usa como referencia en `shape`
- [x] 1.4 Definir tokens base (crema/tinta/tomate/albahaca, 2 fuentes max display=swap, radios 20-28px, SVG Lucide) y verificar contraste texto >=4.5:1 con chequeo manual

## 2. Ruleta core efímera

- [x] 2.1 Implementar lista manual (añadir/editar/borrar/pegar multilínea, 2-100 opciones) y verificar añadir "Paella", editar y borrar actualizan ruleta sin recargar
- [x] 2.2 Implementar giro Canvas con `crypto.getRandomValues`, deceleración easeOut y resultado aria-live, deshabilitado con <2 opciones, y verificar 2 giros seguidos son independientes
- [x] 2.3 Implementar estado solo-sesión sin login ni persistencia y verificar cerrar/reabrir limpia las opciones
- [x] 2.4 Añadir reduced-motion (resultado instantáneo si `prefers-reduced-motion`) y verificar con emulación OS activada no hay animación

## 3. Foto carta a opciones (OCR local español)

- [x] 3.1 Implementar input cámara (`capture=environment`) + galería JPG/PNG con downscale ~2000px y preview y verificar foto 12MP se reduce antes del OCR
- [x] 3.2 Integrar Tesseract.js worker lazy + `spa` en caché PWA con barra progreso y timeout 60s con error "prueba con más luz / más cerca" y verificar modo avión tras primera carga sigue leyendo
- [x] 3.3 Implementar pre-proceso canvas (gris + auto-contraste + umbral) y verificar misma foto torcida con poca luz mejora nº líneas útiles vs sin pre-proceso
- [x] 3.4 Implementar limpieza (regex precios/EUR, líneas <=2 chars, headers) preservando editable y verificar "PAELLA .... 14,50 EUR" sugiere "PAELLA"
- [x] 3.5 Implementar pantalla revisión (checkbox + texto editable, seleccionar todas, contador, "Añadir a la ruleta") y verificar solo marcadas llegan a la ruleta

## 4. Mobile-first QA + gate visual

- [x] 4.1 Maquetar bottom-bar pulgar (Foto/Manual/Girar), targets >=44px, cuerpo >=16px, sin scroll horizontal a 360px y verificar con DevTools 375px
- [x] 4.2 Servir `dist/` local y capturar Playwright `screenshot --viewport-size` en 375/768/1024/1440 full-page y verificar leyendo los PNGs: sin overflow, sin secciones vacías, sin solapes
- [x] 4.3 Cerrar con gate `impeccable audit` + `polish` (o `bolder` si parece plantilla) y verificar 0 bloqueantes visuales y contraste/responsive/reduced-motion en verde
