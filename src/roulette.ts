const PALETTE = ['#E4572E', '#2A9D48', '#F2A007', '#3A86FF', '#9B5DE5', '#F15BB5', '#00BBF9', '#FF8C42']

export function drawWheel(canvas: HTMLCanvasElement, options: string[], rotationRad = 0): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const size = canvas.width
  const r = size / 2
  ctx.clearRect(0, 0, size, size)
  const n = Math.max(options.length, 1)
  const arc = (Math.PI * 2) / n
  ctx.save()
  ctx.translate(r, r)
  ctx.rotate(rotationRad)
  for (let i = 0; i < n; i++) {
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, r - 4, i * arc, (i + 1) * arc)
    ctx.closePath()
    ctx.fillStyle = PALETTE[i % PALETTE.length]
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#1A1C1E'
    ctx.stroke()
    ctx.save()
    ctx.rotate(i * arc + arc / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#fff'
    ctx.font = `700 ${Math.max(18, size / 22)}px Archivo, sans-serif`
    ctx.shadowColor = 'rgba(0,0,0,.45)'
    ctx.shadowBlur = 4
    const label = (options[i] ?? '—').slice(0, 22)
    ctx.fillText(label, r - 18, 7)
    ctx.restore()
  }
  ctx.beginPath()
  ctx.arc(0, 0, 44, 0, Math.PI * 2)
  ctx.fillStyle = '#FFF8EC'
  ctx.fill()
  ctx.lineWidth = 4
  ctx.strokeStyle = '#1A1C1E'
  ctx.stroke()
  ctx.restore()
}

export function spinWheel(
  canvas: HTMLCanvasElement,
  options: string[],
  onDone: (winner: string) => void
): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const { secureIndex } = { secureIndex: (len: number) => {
    const b = new Uint32Array(1)
    crypto.getRandomValues(b)
    return b[0] % len
  } }
  const winner = secureIndex(options.length)
  if (reduced || options.length < 2) {
    drawWheel(canvas, options, 0)
    onDone(options[winner] ?? '')
    return
  }
  const n = options.length
  const arc = (Math.PI * 2) / n
  // Queremos que el ganador quede bajo el puntero (arriba = -PI/2).
  const targetAngle = -Math.PI / 2 - (winner * arc + arc / 2)
  const turns = 5 + (secureIndex(3) + 1)
  const start = performance.now()
  const duration = 3200
  const from = 0
  const total = turns * Math.PI * 2 + (((targetAngle - from) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  function frame(now: number): void {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    drawWheel(canvas, options, from + total * eased)
    if (t < 1) requestAnimationFrame(frame)
    else onDone(options[winner] ?? '')
  }
  requestAnimationFrame(frame)
}
