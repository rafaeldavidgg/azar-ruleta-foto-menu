// Limpieza best-effort de texto OCR de carta en español.
// "PAELLA .... 14,50 EUR" -> "PAELLA"
// Entrenado con carta Latxaska (entrantes/pescados/carnes/postres + menú sidrería).

const PRICE_RE =
  /(\d{1,3}([.,]\d{3})*[.,]\d{2}|\d+\s?(€|eur|euros?))|(€)|\b\d{1,2}[.,]\d{2}\b|\b(eur|euros?)\b/gi

const WEIGHT_RE = /\b\d+\s?(g|gr|grs|kg|cl|ml|l)\b\.?/gi
const PAX_RE = /\b\d+\s?(pax|px|pers|personas?)\b\.?/gi
const UNITS_RE = /\(\s*\d+\s*u\.?\s*\)\.?/gi
const SM_RE = /\bS\s*\/\s*M\b\.?/gi
const RATION_TAIL_RE = /\s+(raci[oó]n|r\.)\s*$/i
const UNIDAD_TAIL_RE = /\s+(unidad(es)?|u\.)\s*$/i
const DO_RE = /\bD\.?\s*O\.?\b\.?/g

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Comparar siempre en forma normalizada (sin acentos, minúsculas).
const EXACT_DENY = new Set(
  [
    'menu', 'menus', 'carta', 'platos', 'plato',
    'entradas', 'entrante', 'entrantes',
    'primeros', 'segundos',
    'pescados', 'pescado',
    'carnes', 'carne',
    'postres', 'postre',
    'bebidas', 'bebida',
    'ensaladas', 'ensalada',
    'precios', 'precio',
    'iva', 'iva incluido',
    'alergenos', 'alergeno',
    'sugerencias', 'sugerencia',
    'sugerencias del dia', 'sugerencia del dia', 'del dia', 'sugerencia',
    'sidreria', 'menu sidreria', 'menu sidreria para dos personas',
    'para dos personas', 'para dos', 'dos personas', 'personas',
    'racion', 'racion de pan', 'bollo', 'bollo pan', 'bollo pan celiacos', 'pan',
    'infusiones', 'infusion', 'cafes', 'cafe',
    'botella de sidra', 'botella',
    'unidad', 'unidades', 'dia',
    's m', 'sm', 'px', 'pax', 'g', 'u',
  ].map(norm)
)

const SUBSTR_DENY = [
  'alergen',
  'sugerencia',
  'para dos personas',
  'menu sidrer',
  'sidreria para',
  'elaboracion',
  'intolerancia',
  'iva incluido',
  'botella de sidra',
].map(norm)

export function cleanOcrLines(raw: string): string[] {
  const out: string[] = []
  for (const lineRaw of raw.split(/\r?\n/)) {
    let line = lineRaw.trim()
    if (!line) continue
    // Tesseract confunde I con | en mayúsculas de carta. "/" se conserva para partir "A / B".
    line = line.replace(/[¦|]/g, 'I')
    // Puntos guía "....", rayas y viñetas de relleno.
    line = line
      .replace(/[.…·•*_‐‑‒–—―-]{2,}/g, ' ')
      .replace(PRICE_RE, ' ')
      .replace(SM_RE, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
    if (!line) continue
    // "CROQUETAS DE CARABINEROS / TXIPIRON" son dos opciones.
    const parts = line.split(/\s*\/\s*/)
    for (const partRaw of parts) {
      let p = partRaw.trim()
      if (!p) continue
      p = p
        .replace(UNITS_RE, ' ')
        .replace(WEIGHT_RE, ' ')
        .replace(PAX_RE, ' ')
        .replace(DO_RE, ' ')
        .replace(RATION_TAIL_RE, ' ')
        .replace(UNIDAD_TAIL_RE, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
      // Recorta numeración "1. Paella" -> "Paella"
      p = p.replace(/^\d{1,2}\s*[.)\-:]\s*/, '').trim()
      // Puntuación pegada a los bordes.
      p = p.replace(/^[\s.,;:·•\-–—_()]+/, '').replace(/[\s.,;:·•\-–—_()]+$/, '').trim()
      if (p.length < 4 || p.length > 80) continue
      if (/^[0-9\s.,€]+$/.test(p)) continue
      // ":" es pie ("ALERGENOS: ..."), el resto es basura OCR o frase, nunca plato.
      if (/[:;?!@#%=<>\\©®]/.test(p)) continue
      if (/€/.test(p) || /\beur\b/i.test(p)) continue
      const letters = (p.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length
      if (letters < 4) continue
      if (letters / p.length < 0.6) continue
      // Todo plato en español tiene vocal. Mata "S/M", "2PX", "300G", "TX".
      if (!/[aeiouáéíóúü]/i.test(p)) continue
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(p)) continue
      // Frases largas son pies (alérgenos) o descripciones, no opciones.
      if (p.split(/\s+/).length > 10) continue
      const n = norm(p)
      if (!n || n.length < 4) continue
      if (EXACT_DENY.has(n)) continue
      if (SUBSTR_DENY.some((s) => n.includes(s))) continue
      out.push(p.slice(0, 80))
    }
  }
  // dedup insensible a mayúsculas y acentos ("SARTEN" = "SARTÉN")
  const seen = new Set<string>()
  return out.filter((x) => {
    const k = norm(x)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export function downscaleImage(img: HTMLImageElement, maxSide = 3000): HTMLCanvasElement {
  const maxDim = Math.max(img.naturalWidth, img.naturalHeight)
  // No bajar de 1500 px en el lado largo: la letra pequeña de carta lo necesita.
  // Si la foto ya es pequeña, reescalar hasta 2x para dar aire a Tesseract.
  let scale = Math.min(1, maxSide / maxDim)
  if (maxDim < 1500) scale = Math.min(2, 1500 / maxDim)
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  return c
}

export function preprocessCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = src.width
  c.height = src.height
  const ctx = c.getContext('2d')!
  ctx.drawImage(src, 0, 0)
  const img = ctx.getImageData(0, 0, c.width, c.height)
  const d = img.data
  // gris + auto-contraste simple + umbral suave
  let min = 255
  let max = 0
  const gray = new Uint8Array(c.width * c.height)
  for (let i = 0; i < gray.length; i++) {
    const g = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]
    gray[i] = g
    if (g < min) min = g
    if (g > max) max = g
  }
  const range = Math.max(1, max - min)
  for (let i = 0; i < gray.length; i++) {
    let v = ((gray[i] - min) / range) * 255
    // empuja a blanco/negro suave (umbral 165: papel cálido con sombra)
    v = v > 165 ? Math.min(255, v + 30) : Math.max(0, v - 20)
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v
  }
  ctx.putImageData(img, 0, 0)
  return c
}
