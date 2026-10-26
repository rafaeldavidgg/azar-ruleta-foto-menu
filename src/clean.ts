// Limpieza best-effort de texto OCR de carta en español.
// "PAELLA .... 14,50 EUR" -> "PAELLA"

const PRICE_RE =
  /(\d{1,3}([.,]\d{3})*[.,]\d{2}|\d+\s?(€|eur|euros?))|(\€)|(\b\d{1,2}[.,]\d{2}\b)|\b(eur|euros?)\b/gi

const HEADERS = new Set([
  'menu', 'menú', 'menus', 'menús', 'carta', 'platos', 'entrantes', 'entrante',
  'primeros', 'segundos', 'postres', 'postre', 'bebidas', 'bebida', 'precios',
  'precio', 'iva', 'iva incluido', 'iva incluído', 'alergenos', 'alérgenos'
])

export function cleanOcrLines(raw: string): string[] {
  const out: string[] = []
  for (const lineRaw of raw.split(/\r?\n/)) {
    let line = lineRaw
      .replace(/[.·•_—-]{2,}/g, ' ')
      .replace(PRICE_RE, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
    if (line.length <= 2) continue
    const norm = line
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    if (HEADERS.has(norm)) continue
    if (/^[0-9\s.,€]+$/.test(line)) continue
    // Recorta numeración "1. Paella" -> "Paella"
    line = line.replace(/^\d{1,2}\s*[.)\-]\s*/, '').trim()
    if (line.length <= 2) continue
    out.push(line.slice(0, 80))
  }
  // dedup insensible a mayúsculas
  const seen = new Set<string>()
  return out.filter((x) => {
    const k = x.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export function downscaleImage(img: HTMLImageElement, maxSide = 2000): HTMLCanvasElement {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
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
    // empuja a blanco/negro suave
    v = v > 150 ? Math.min(255, v + 30) : Math.max(0, v - 20)
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v
  }
  ctx.putImageData(img, 0, 0)
  return c
}
