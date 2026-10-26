# Design

## Context

Ver `proposal.md - Why`. Estado: proyecto sin git, sin `.gitignore`, `gh` autenticado como `rafaeldavidgg`, repo `azar-ruleta-foto-menu` no existe (se crea). La app ya usa `base: './'` en `vite.config.ts`, compatible con Pages bajo subpath `/azar-ruleta-foto-menu/`.

## Goals / Non-Goals

**Goals:**
- Repo público creado y push inicial limpio (sin node_modules/dist/PNGs de verificación).
- Deploy automático a Pages en cada push a `main` con build reproducible (`npm ci`).

**Non-Goals:**
- Dominio personalizado, sin analytics, sin ramas de release (deploy directo desde `main`).

## Decisions

### 1. GitHub Actions (deploy-pages) sobre push manual a rama `gh-pages`
**Qué:** workflow `.github/workflows/deploy-pages.yml` con `actions/upload-pages-artifact` + `actions/deploy-pages`, build `npm ci && npm run build`, artifact `dist/`.
**Por qué:** despliegue atómico y auditable en cada push; evita commits de build en el historial. La alternativa manual (`gh-pages` con `dist/` commiteado) ensucia el repo.
**Permisos:** Pages habilitado en settings del repo (Source: GitHub Actions). El primer run puede requerir aprobar el deploy en la pestaña Actions.

### 2. Rutas relativas (`base: './'`) sin cambios
La config actual ya genera assets relativos; funciona igual en `localhost` y en `https://rafaeldavidgg.github.io/azar-ruleta-foto-menu/`. Solo se toca si la verificación post-deploy detecta un asset absoluto (Tesseract resuelve `spa.traineddata` desde el worker empaquetado por Vite, no requiere ajuste esperado).

### 3. `.gitignore` mínimo y explícito
`node_modules/`, `dist/`, `verify-final-*.png`, `.impeccable/` (config local de detect). Se versiona `DESIGN.md`, `openspec/`, `.github/`, `.opencode/` (skills del proyecto).

## Risks / Trade-offs

- [Service Worker bajo subpath no registra] → Mitigación: Workbox genera `sw.js` con scope relativo; verificar en post-deploy que `navigator.serviceWorker` registra sin 404. Si falla, scope explícito en registro.
- [Tesseract `spa.traineddata` (~1-2MB) tarda en primera carga móvil] → Aceptado: es lazy (solo al pulsar Foto) y queda en caché PWA; no bloquea el primer pintado.
- [Primer deploy de Pages tarda / requiere aprobación] → Mitigación: revisar pestaña Actions tras el push y reintentar el job si queda en espera.

## Migration Plan

No hay migración (nada publicado antes). Rollback: revert del commit en `main` re-despliega la versión anterior automáticamente.
