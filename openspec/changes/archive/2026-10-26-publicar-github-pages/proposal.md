# Proposal

## Why

El proyecto funciona en local pero no existe en ningún sitio público ni desplegado. Publicarlo en GitHub y servirlo en GitHub Pages lo hace instalable y usable desde el móvil sin pasar por un PC.

## What Changes

- Inicializar git en el proyecto (`main` como rama principal) sin historial previo relevante que conservar.
- Crear `.gitignore` (node_modules, dist, PNGs de verificación, `.impeccable/` local) para no subir artefactos.
- Crear repo público `rafaeldavidgg/azar-ruleta-foto-menu` con `gh repo create --public` y push inicial.
- Añadir workflow de GitHub Actions que en cada push a `main` ejecuta `npm ci && npm run build` y despliega `dist/` en GitHub Pages (URL proyecto: `https://rafaeldavidgg.github.io/azar-ruleta-foto-menu/`).
- Verificar despliegue: la PWA carga bajo subpath, el OCR `spa` resuelve assets relativos y el Service Worker registra.

## Capabilities

### New Capabilities
- Ninguna (change de tooling/publicación, sin cambios de comportamiento de la app).

### Modified Capabilities
- Ninguna. `openspec/specs/` (`ruleta`, `foto-menu`) queda intacto. Este change declara `skip_specs: true`.

## Impact

- Nuevo: `.git/`, `.gitignore`, `.github/workflows/deploy-pages.yml`.
- Sin cambios en `src/`, `index.html`, `vite.config.ts` salvo que el deploy revele un asset con ruta absoluta (entonces se corrige a relativa).
- La app ya usa `base: './'` en Vite, compatible con Pages bajo subpath.
- Externo: repo público nuevo + Pages habilitado en el repo.
