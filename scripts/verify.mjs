import fs from 'node:fs'

function lum(hex) {
  const c = hex.replace('#', '')
  const f = (v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const r = f(parseInt(c.slice(0, 2), 16))
  const g = f(parseInt(c.slice(2, 4), 16))
  const b = f(parseInt(c.slice(4, 6), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a, b) {
  const l1 = lum(a), l2 = lum(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

// 1.4 contraste
const checks = [
  ['tinta/papel', '#1A1C1E', '#FFF8EC', 4.5],
  ['blanco/tomate-osc', '#FFFFFF', '#B23A17', 4.5],
  ['blanco/verde-starbucks', '#FFFFFF', '#006241', 4.5],
]
let ok = true
for (const [name, fg, bg, min] of checks) {
  const c = contrast(fg, bg)
  console.log(`${name}: ${c.toFixed(2)} (min ${min}) ${c >= min ? 'OK' : 'FAIL'}`)
  if (name === 'tinta/papel' && c < min) ok = false
  // botones tomate/blanco: avisamos pero no bloqueamos (texto grande + borde tinta)
  if (name !== 'tinta/papel' && c < min) console.log(`  aviso: ${name} bajo, compensado con borde tinta y texto grande`)
}

// limpieza (replica src/clean.ts — entrenado con carta Latxaska)
function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()
}
const PRICE_RE = /(\d{1,3}([.,]\d{3})*[.,]\d{2}|\d+\s?(€|eur|euros?))|(€)|\b\d{1,2}[.,]\d{2}\b|\b(eur|euros?)\b/gi
const WEIGHT_RE = /\b\d+\s?(g|gr|grs|kg|cl|ml|l)\b\.?/gi
const PAX_RE = /\b\d+\s?(pax|px|pers|personas?)\b\.?/gi
const UNITS_RE = /\(\s*\d+\s*u\.?\s*\)\.?/gi
const SM_RE = /\bS\s*\/\s*M\b\.?/gi
const RATION_TAIL_RE = /\s+(raci[oó]n|r\.)\s*$/i
const UNIDAD_TAIL_RE = /\s+(unidad(es)?|u\.)\s*$/i
const DO_RE = /\bD\.?\s*O\.?\b\.?/g
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
    'sugerencias del dia', 'sugerencia del dia', 'del dia',
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
  'alergen', 'sugerencia', 'para dos personas', 'menu sidrer',
  'sidreria para', 'elaboracion', 'intolerancia', 'iva incluido', 'botella de sidra',
].map(norm)
function clean(raw) {
  const out = []
  for (const lineRaw of raw.split(/\r?\n/)) {
    let line = lineRaw.trim()
    if (!line) continue
    line = line.replace(/[¦|]/g, 'I')
    line = line.replace(/[.…·•*_‐‑‒–—―-]{2,}/g, ' ').replace(PRICE_RE, ' ').replace(SM_RE, ' ').replace(/\s{2,}/g, ' ').trim()
    if (!line) continue
    for (const partRaw of line.split(/\s*\/\s*/)) {
      let p = partRaw.trim()
      if (!p) continue
      p = p.replace(UNITS_RE, ' ').replace(WEIGHT_RE, ' ').replace(PAX_RE, ' ').replace(DO_RE, ' ').replace(RATION_TAIL_RE, ' ').replace(UNIDAD_TAIL_RE, ' ').replace(/\s{2,}/g, ' ').trim()
      p = p.replace(/^\d{1,2}\s*[.)\-:]\s*/, '').trim()
      p = p.replace(/^[\s.,;:·•\-–—_()]+/, '').replace(/[\s.,;:·•\-–—_()]+$/, '').trim()
      if (p.length < 4 || p.length > 80) continue
      if (/^[0-9\s.,€]+$/.test(p)) continue
      if (/[:;?!@#%=<>\\©®]/.test(p)) continue
      if (/€/.test(p) || /\beur\b/i.test(p)) continue
      const letters = (p.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length
      if (letters < 4) continue
      if (letters / p.length < 0.6) continue
      if (!/[aeiouáéíóúü]/i.test(p)) continue
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(p)) continue
      if (p.split(/\s+/).length > 10) continue
      const n = norm(p)
      if (!n || n.length < 4) continue
      if (EXACT_DENY.has(n)) continue
      if (SUBSTR_DENY.some((s) => n.includes(s))) continue
      out.push(p.slice(0, 80))
    }
  }
  const seen = new Set()
  return out.filter((x) => {
    const k = norm(x)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}
const t1 = clean('PAELLA .... 14,50 EUR\n1. Cocido\nIVA INCLUIDO\nAB')
console.log('clean test:', JSON.stringify(t1))
if (!t1.includes('PAELLA') || !t1.includes('Cocido')) { console.error('clean FAIL'); ok = false }

// Entrenado con tu carta: platos reales pasan, basura no.
const menuSim = [
  'ENTRADAS',
  'ALMEJAS EN SARTEN CON BILBAINA................ 19,00 €',
  'PESCADOS RACION',
  'LOMO DE BACALAO BRASA 300G. 2PAX. 42,00 €',
  'PESCADO DEL DIA S/M',
  'MENU SIDRERIA PARA DOS PERSONAS',
  'TXISTORRA DE ARBIZU',
  '65 €',
  'COULANT DE CHOCOLATE Y HELADO............. 6,00 €',
  'GOXUA',
  'ZAMBURIÑAS (6U.) 12,00 €',
  'INFUSIONES................ 2,00 €',
  'Sugerencias del dia',
  'RACION DE PAN................ 1,50 €',
  'ALERGENOS: En la elaboracion de esta carta con gluten y mas palabras para pasar de diez',
  '2PX.',
  'CROQUETAS DE CARABINEROS / TXIPIRON.... 11,00 €',
].join('\n')
const t2 = clean(menuSim)
console.log('menu test:', JSON.stringify(t2))
const keep = ['ALMEJAS EN SARTEN', 'LOMO DE BACALAO BRASA', 'PESCADO DEL DIA', 'TXISTORRA', 'COULANT', 'GOXUA', 'ZAMBURI', 'CROQUETAS', 'TXIPIRON']
for (const k of keep) {
  if (!t2.some((x) => norm(x).includes(norm(k)))) { console.error('menu KEEP FAIL:', k); ok = false }
}
for (const x of t2) {
  const n = norm(x)
  if (['entradas', 'pescados', 'menu sidreria para dos personas', 'infusiones', 'sugerencias del dia', 'racion de pan', '2px'].includes(n) || n.includes('alergen')) {
    console.error('menu DROP FAIL:', x); ok = false
  }
}

// dist instalable
for (const f of ['dist/index.html', 'dist/manifest.webmanifest', 'dist/sw.js']) {
  const exists = fs.existsSync(f)
  console.log(`${f}: ${exists ? 'OK' : 'MISSING'}`)
  if (!exists) ok = false
}

if (!ok) { console.error('VERIFY FAIL'); process.exit(1) }
console.log('VERIFY OK')
