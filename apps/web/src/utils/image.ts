// As imagens da fonte são PNGs grandes no imgix, que redimensiona e converte para WebP/AVIF pela
// própria URL. Fora do imgix a URL volta intacta, porque outro host ignoraria ou recusaria os params.
const isImgix = (src: string) => new URL(src).hostname.endsWith('.imgix.net')
const withParams = (src: string, params: string) =>
  `${src}${src.includes('?') ? '&' : '?'}${params}`

/**
 * `trim`: corta a margem de fundo liso em volta da peça (com um respiro), para ela ocupar uma
 * moldura pequena sem ficar minúscula.
 */
export function imageUrl(src: string, width: number, { trim = false } = {}) {
  if (!isImgix(src)) return src
  return withParams(src, `${trim ? 'trim=auto&trim-pad=60&' : ''}w=${width}&auto=format,compress`)
}

/**
 * Um recorte de 20 px do canto da foto. As fotos da fonte têm fundo liso: esticado, ele pinta a
 * sobra quando a foto inteira é encaixada numa moldura de outra proporção, sem emenda visível.
 */
export function imageCornerUrl(src: string) {
  return isImgix(src) ? withParams(src, 'rect=0,0,20,20') : undefined
}
