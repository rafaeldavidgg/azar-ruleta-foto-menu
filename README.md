# Azar — Ruleta foto-menú

PWA móvil-first y efímera para decidir al azar: escribe opciones, **haz una foto a la carta** y deja que la ruleta elija. Sin cuentas, sin backend, sin tracking. Todo pasa en tu móvil.

**En vivo:** https://rafaeldavidgg.github.io/azar-ruleta-foto-menu/

![Ruleta Azar](https://rafaeldavidgg.github.io/azar-ruleta-foto-menu/icon-512.svg)

## Qué hace

- **Ruleta personalizable** — añade, edita y borra opciones a mano o pega una lista entera de una vez.
- **Foto de carta → opciones** — fotografía una carta impresa en español y el OCR local propone los platos como candidatos. Tú revisas, corriges y eliges cuáles entran en la ruleta.
- **OCR 100% local** — Tesseract.js con modelo `spa` en tu dispositivo. Ninguna imagen sale de tu móvil. Funciona offline tras la primera carga.
- **Efímera y anónima** — sin login ni persistencia: al cerrar la pestaña, todo se olvida.
- **Instalable (PWA)** — Service Worker + manifest; funciona con mala cobertura.

## Cómo se usa

1. Abre la app en el móvil y pulsa **Foto** para capturar la carta (o **Opciones** para escribir a mano).
2. Revisa los candidatos: marca, edita o descarta.
3. Pulsa **Añadir a la ruleta** y luego **Girar**. ¡Suerte!

> El OCR es best-effort: con mala luz o perspectiva torcida conviene reencuadrar. El flujo está diseñado para que la revisión humana (10 segundos) compense.

## Desarrollo local

```bash
npm ci
npm run dev      # servidor de desarrollo
npm run build    # compila a dist/ (verificado con tsc)
npm run test     # verificación: contraste, limpieza OCR, dist instalable
```

Cada push a `main` despliega automáticamente a GitHub Pages (workflow `deploy-pages.yml`).

## Stack

Vite + TypeScript + Tesseract.js (`spa`), sin framework. Canvas propio para la ruleta (`crypto.getRandomValues`, respeta `prefers-reduced-motion`). Dirección visual documentada en `DESIGN.md`.

## Estructura

```
src/        # main, roulette, ocr, clean, state, styles
public/     # iconos, manifest vía plugin PWA
openspec/   # specs (ruleta, foto-menu) y changes archivados
scripts/    # verify.mjs (contraste WCAG, limpieza OCR, dist)
```

## Licencia

MIT — úsalo donde quieras.
