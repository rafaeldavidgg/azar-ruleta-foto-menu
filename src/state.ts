const KEY = 'azar-opciones-v1'

export function loadOptions(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return ['Paella valenciana', 'Cocido madrileño', 'Flamenquín']
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function saveOptions(options: string[]): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(options))
  } catch {
    // efímero: si no hay storage, seguimos solo en memoria
  }
}

export function splitPasted(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 100)
}

export function secureIndex(length: number): number {
  if (length <= 0) return -1
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] % length
}
