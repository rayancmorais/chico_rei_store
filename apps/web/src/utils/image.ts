export type ImageCrop = 'detail' | 'texture'

// Recortes da mesma foto com zoom em pontos diferentes: dão "ângulos" extras sem fotos novas.
const CROP_PARAMS: Record<ImageCrop, string> = {
  detail: 'fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.42&fp-z=2.2',
  texture: 'fit=crop&crop=focalpoint&fp-x=0.46&fp-y=0.5&fp-z=4',
}

// As imagens da fonte são PNGs grandes no imgix, que redimensiona e converte para WebP/AVIF pela
// própria URL. Fora do imgix a URL volta intacta, porque outro host ignoraria ou recusaria os params.
export function imageUrl(src: string, width: number, crop?: ImageCrop) {
  if (!new URL(src).hostname.endsWith('.imgix.net')) return src
  const separator = src.includes('?') ? '&' : '?'
  const cropParams = crop ? `&h=${width}&${CROP_PARAMS[crop]}` : ''
  return `${src}${separator}w=${width}${cropParams}&auto=format,compress`
}
