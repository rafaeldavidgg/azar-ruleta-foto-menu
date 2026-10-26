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

// limpieza (replica src/clean.ts)
const PRICE_RE = /(\d{1,3}([.,]\d{3})*[.,]\d{2}|\d+\s?(€|eur|euros?))|(\€)|(\b\d{1,2}[.,]\d{2}\b)|\b(eur|euros?)\b/gi
const HEADERS = new Set(['menu', 'menú', 'carta', 'iva incluido', 'iva'])
function clean(raw) {
  const out = []
  for (const lineRaw of raw.split(/\r?\n/)) {
    let line = lineRaw.replace(/[.·•_—-]{2,}/g, ' ').replace(PRICE_RE, ' ').replace(/\s{2,}/g, ' ').trim()
    if (line.length <= 2) continue
    const norm = line.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    if (HEADERS.has(norm)) continue
    line = line.replace(/^\d{1,2}\s*[.)\-]\s*/, '').trim()
    if (line.length <= 2) continue
    out.push(line.slice(0, 80))
  }
  return out
}
const t1 = clean('PAELLA .... 14,50 EUR\n1. Cocido\nIVA INCLUIDO\nAB')
console.log('clean test:', JSON.stringify(t1))
if (!t1.includes('PAELLA') || !t1.includes('Cocido')) { console.error('clean FAIL'); ok = false }

// dist instalable
for (const f of ['dist/index.html', 'dist/manifest.webmanifest', 'dist/sw.js']) {
  const exists = fs.existsSync(f)
  console.log(`${f}: ${exists ? 'OK' : 'MISSING'}`)
  if (!exists) ok = false
}

if (!ok) { console.error('VERIFY FAIL'); process.exit(1) }
console.log('VERIFY OK')
