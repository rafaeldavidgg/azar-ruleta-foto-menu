import { createWorker } from 'tesseract.js'

let workerPromise: Promise<any> | null = null

function getWorker(onProgress: (p: number) => void): Promise<any> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('spa', undefined, {
        logger: (m: any) => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            onProgress(m.progress)
          }
        }
      })
      // Carta impresa: bloque uniforme de texto. PSM 6 rinde mejor que el 3 por defecto.
      try {
        await (worker as any).setParameters({
          tessedit_pageseg_mode: '6' as any,
          preserve_interword_spaces: '1' as any,
          user_defined_dpi: '300' as any,
        })
      } catch {
        // Si la versión de tesseract no acepta parámetros, seguimos con el defecto.
      }
      return worker
    })()
  }
  return workerPromise
}

export async function ocrCanvas(
  canvas: HTMLCanvasElement,
  onProgress: (p: number) => void,
  timeoutMs = 60000
): Promise<string> {
  const job = (async () => {
    const worker = await getWorker(onProgress)
    const { data } = await worker.recognize(canvas)
    return (data?.text ?? '') as string
  })()
  const timeout = new Promise<string>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), timeoutMs)
  )
  return Promise.race([job, timeout])
}

export function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) {
      reject(new Error('Formato no soportado. Usa JPG o PNG.'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Formato no soportado. Usa JPG o PNG.'))
    }
    img.src = url
  })
}
