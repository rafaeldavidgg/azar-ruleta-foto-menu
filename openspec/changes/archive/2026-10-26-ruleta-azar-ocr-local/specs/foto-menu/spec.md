# Spec Delta

## Purpose

Convierte una foto de carta impresa en español en candidatos de ruleta mediante OCR totalmente local, con revisión humana obligatoria antes de jugar.

## ADDED Requirements

### Requirement: Captura de carta en español
El sistema SHALL aceptar foto de carta impresa en español desde cámara o galería en móvil.

#### Scenario: Captura desde cámara
- **WHEN** el usuario pulsa "Foto de carta" y toma foto con `capture=environment`
- **THEN** la imagen se carga en cliente, se downscalea a max ~2000px lado largo y se muestra vista previa

#### Scenario: Carga desde galería
- **WHEN** el usuario elige imagen existente JPG/PNG/HEIC convertible
- **THEN** el sistema la acepta o muestra error legible "formato no soportado" si no puede decodificarla

#### Scenario: Solo español impreso v1
- **WHEN** la carta es impresa en español
- **THEN** el OCR usa `spa`; manuscrita u otros idiomas quedan fuera de alcance y no se garantiza resultado

### Requirement: OCR local con pre-proceso
El sistema SHALL ejecutar OCR en cliente sin enviar la imagen a ningún servidor.

#### Scenario: OCR offline tras primera carga
- **WHEN** los assets WASM + `spa.traineddata` ya están en caché PWA
- **THEN** el OCR completa en dispositivo y muestra progreso (ej. "Leyendo carta 60%"), sin llamadas de red para la imagen

#### Scenario: Pre-proceso mínimo
- **WHEN** la imagen entra al OCR
- **THEN** se aplica conversión a gris + auto-contraste + enderezado best-effort en canvas antes de Tesseract

#### Scenario: Fallo OCR legible
- **WHEN** Tesseract no devuelve texto o tarda >60s en gama baja
- **THEN** se muestra "No pude leerla, prueba con más luz / más cerca / sin sombras" y opción de reintentar o pasar a manual

### Requirement: Limpieza y revisión editable
El sistema SHALL proponer candidatos limpios y exigir confirmación humana antes de enviar a la ruleta.

#### Scenario: Limpieza automática best-effort
- **WHEN** el OCR devuelve texto bruto con precios ("PAELLA .... 14,50 EUR")
- **THEN** el sistema sugiere líneas sin precios (regex precios/moneda), elimina líneas vacías de <=2 caracteres y encabezados evidentes, preservando el texto original editable

#### Scenario: Revisión con checkboxes
- **WHEN** hay N candidatos
- **THEN** se muestran como lista con checkbox + texto editable, "seleccionar todas", contador "7 seleccionadas" y botón "Añadir a la ruleta" que solo envía las marcadas

#### Scenario: Edición antes de jugar
- **WHEN** el usuario edita "Palla" a "Paella" o desmarca "IVA INCLUIDO"
- **THEN** solo el texto corregido y marcado llega a la ruleta, el resto se descarta
