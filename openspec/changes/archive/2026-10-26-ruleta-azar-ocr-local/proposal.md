# Proposal

## Why

Existe una fricción entre decidir al azar (ruletas online) y el contexto real (una carta física en un bar). Nadie quiere transcribir 20 platos a mano en el móvil. Una PWA efímera con foto-a-ruleta en español, 100% local y sin cuentas, elimina esa fricción y se diferencia de Wheel of Names / Picker Wheel.

## What Changes

- PWA móvil-first (360px primero), instalable, funciona con cobertura pobre, sin backend.
- Ruleta personalizable: añadir / editar / borrar opciones manualmente, importar lista pegada, giro aleatorio con animación y resultado destacado.
- Foto de carta en español -> opciones: captura con cámara o galería, OCR local con Tesseract.js (`spa`), pre-proceso en canvas, limpieza automática (precios, ruido), revisión editable con checkboxes antes de enviar a la ruleta.
- Sesión efímera y anónima: estado solo en memoria (opcional `sessionStorage` en la sesión), al cerrar se pierde. Sin login, sin persistencia, sin tracking.
- Todo el texto de la app y artefactos OCR en español. Alcance v1: solo carta impresa en español, no manuscrita ni otros idiomas.

## Capabilities

### New Capabilities
- `ruleta`: núcleo de decisión aleatoria — crear lista manual, editar/borrar, giro aleatorio no sesgado, presentación del resultado, reinicio efímero.
- `foto-menu`: captura foto carta -> OCR local -> candidatos editables — input cámara/galería, pre-proceso, OCR `spa` en cliente, limpieza de precios/ruido, pantalla de revisión con selección múltiple.

### Modified Capabilities
- Ninguna (proyecto greenfield, `openspec/specs/` vacío).

## Impact

- Nuevo proyecto estático (sin backend). Dependencias nuevas: Tesseract.js + `spa.traineddata`, framework PWA ligero a decidir en design.
- Riesgos: peso WASM + lentitud en gama baja, calidad OCR con mala luz/perspectiva; se mitigan con downscale, pre-proceso y UX de revisión (no promesa de perfección).
- Sin impacto en sistemas existentes.
