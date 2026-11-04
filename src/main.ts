import './styles.css'
import { loadOptions, saveOptions, splitPasted } from './state'
import { drawWheel, spinWheel } from './roulette'
import { cleanOcrLines, downscaleImage, preprocessCanvas } from './clean'
import { ocrCanvas, fileToImage } from './ocr'

let options: string[] = loadOptions()
let review: { text: string; checked: boolean }[] = []
let currentRotation = 0

const wheel = document.getElementById('wheel') as HTMLCanvasElement
const result = document.getElementById('result') as HTMLParagraphElement
const btnSpin = document.getElementById('btn-spin') as HTMLButtonElement
const btnSpinBar = document.getElementById('btn-spin-bar') as HTMLButtonElement
const count = document.getElementById('count') as HTMLSpanElement
const formAdd = document.getElementById('form-add') as HTMLFormElement
const inputOption = document.getElementById('input-option') as HTMLInputElement
const pasteArea = document.getElementById('paste-area') as HTMLTextAreaElement
const btnPaste = document.getElementById('btn-paste') as HTMLButtonElement
const list = document.getElementById('options-list') as HTMLUListElement
const btnClear = document.getElementById('btn-clear') as HTMLButtonElement

const inputCamera = document.getElementById('input-camera') as HTMLInputElement
const inputGallery = document.getElementById('input-gallery') as HTMLInputElement
const preview = document.getElementById('preview') as HTMLImageElement
const ocrProgress = document.getElementById('ocr-progress') as HTMLDivElement
const ocrBar = document.getElementById('ocr-bar') as HTMLDivElement
const ocrLabel = document.getElementById('ocr-label') as HTMLParagraphElement
const ocrError = document.getElementById('ocr-error') as HTMLParagraphElement
const reviewBox = document.getElementById('review') as HTMLDivElement
const reviewList = document.getElementById('review-list') as HTMLUListElement
const reviewCount = document.getElementById('review-count') as HTMLParagraphElement
const btnAll = document.getElementById('btn-all') as HTMLButtonElement
const btnToWheel = document.getElementById('btn-to-wheel') as HTMLButtonElement

function render(): void {
  saveOptions(options)
  count.textContent = `(${options.length})`
  drawWheel(wheel, options, currentRotation)
  const ok = options.length >= 2
  btnSpin.disabled = !ok
  btnSpinBar.disabled = !ok
  btnSpin.textContent = ok ? 'Girar la ruleta' : 'Añade al menos 2 opciones'
  if (!result.classList.contains('winner')) {
    result.textContent = ok ? 'Lista para girar. ¡Suerte!' : 'Añade al menos 2 opciones para girar'
  }
  list.innerHTML = ''
  options.forEach((opt, i) => {
    const li = document.createElement('li')
    const input = document.createElement('input')
    input.type = 'text'
    input.value = opt
    input.maxLength = 80
    input.setAttribute('aria-label', `Opción ${i + 1}`)
    input.addEventListener('change', () => {
      const v = input.value.trim()
      if (!v) options.splice(i, 1)
      else options[i] = v.slice(0, 80)
      result.classList.remove('winner')
      currentRotation = 0
      render()
    })
    const del = document.createElement('button')
    del.className = 'icon-btn'
    del.type = 'button'
    del.textContent = '×'
    del.setAttribute('aria-label', `Borrar ${opt}`)
    del.addEventListener('click', () => {
      options.splice(i, 1)
      result.classList.remove('winner')
      currentRotation = 0
      render()
    })
    li.append(input, del)
    list.append(li)
  })
}

function doSpin(): void {
  if (options.length < 2) return
  btnSpin.disabled = true
  btnSpinBar.disabled = true
  result.classList.remove('winner')
  result.textContent = 'Girando…'
  spinWheel(wheel, options, (winner, finalRotation) => {
    currentRotation = finalRotation
    result.textContent = `Ha tocado: ${winner}`
    result.classList.add('winner')
    render()
  }, currentRotation)
}

btnSpin.addEventListener('click', doSpin)
btnSpinBar.addEventListener('click', () => {
  document.getElementById('seccion-ruleta')?.scrollIntoView({ behavior: 'smooth' })
  doSpin()
})

formAdd.addEventListener('submit', (e) => {
  e.preventDefault()
  const v = inputOption.value.trim().slice(0, 80)
  if (!v || options.length >= 100) return
  options.push(v)
  inputOption.value = ''
  result.classList.remove('winner')
  currentRotation = 0
  render()
})

btnPaste.addEventListener('click', () => {
  const parts = splitPasted(pasteArea.value)
  options = [...options, ...parts].slice(0, 100)
  pasteArea.value = ''
  result.classList.remove('winner')
  currentRotation = 0
  render()
})

btnClear.addEventListener('click', () => {
  options = []
  result.classList.remove('winner')
  currentRotation = 0
  render()
})

function renderReview(): void {
  reviewList.innerHTML = ''
  review.forEach((r, i) => {
    const li = document.createElement('li')
    const cb = document.createElement('input')
    cb.type = 'checkbox'
    cb.checked = r.checked
    cb.setAttribute('aria-label', `Seleccionar ${r.text}`)
    cb.addEventListener('change', () => {
      r.checked = cb.checked
      renderReview()
    })
    const input = document.createElement('input')
    input.type = 'text'
    input.value = r.text
    input.maxLength = 80
    input.addEventListener('change', () => {
      r.text = input.value.trim().slice(0, 80)
    })
    li.append(cb, input)
    reviewList.append(li)
    void i
  })
  const n = review.filter((r) => r.checked).length
  reviewCount.textContent = `${n} seleccionadas`
  reviewBox.hidden = review.length === 0
  btnToWheel.disabled = n === 0
}

btnAll.addEventListener('click', () => {
  const allChecked = review.every((r) => r.checked)
  review.forEach((r) => (r.checked = !allChecked))
  renderReview()
})

btnToWheel.addEventListener('click', () => {
  const picked = review.filter((r) => r.checked).map((r) => r.text.trim()).filter(Boolean)
  options = [...options, ...picked].slice(0, 100)
  review = []
  renderReview()
  result.classList.remove('winner')
  currentRotation = 0
  render()
  document.getElementById('seccion-ruleta')?.scrollIntoView({ behavior: 'smooth' })
})

async function handleFile(file: File | undefined): Promise<void> {
  if (!file) return
  ocrError.hidden = true
  try {
    const img = await fileToImage(file)
    preview.src = img.src
    preview.hidden = false
    const down = downscaleImage(img)
    const pre = preprocessCanvas(down)
    ocrProgress.hidden = false
    ocrBar.style.setProperty('--p', '5%')
    ocrLabel.textContent = 'Leyendo carta… 5%'
    const text = await ocrCanvas(pre, (p) => {
      const pct = Math.round(p * 100)
      ocrBar.style.setProperty('--p', `${pct}%`)
      ocrLabel.textContent = `Leyendo carta… ${pct}%`
    })
    ocrProgress.hidden = true
    const lines = cleanOcrLines(text)
    if (lines.length === 0) throw new Error('vacio')
    review = lines.map((t) => ({ text: t, checked: true }))
    renderReview()
  } catch (err) {
    ocrProgress.hidden = true
    ocrError.hidden = false
    ocrError.textContent =
      err instanceof Error && err.message.includes('soportado')
        ? 'Formato no soportado. Usa JPG o PNG, o haz la foto directa.'
        : 'No pude leerla, prueba con más luz / más cerca / sin sombras. O añade manual.'
  }
}

inputCamera.addEventListener('change', () => void handleFile(inputCamera.files?.[0]))
inputGallery.addEventListener('change', () => void handleFile(inputGallery.files?.[0]))

render()
renderReview()
