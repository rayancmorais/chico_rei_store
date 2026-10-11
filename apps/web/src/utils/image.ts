// As imagens da fonte são PNGs grandes no imgix, que redimensiona e converte para WebP/AVIF pela
// própria URL. Fora do imgix a URL volta intacta, porque outro host ignoraria ou recusaria os params.
export function imageUrl(src: string, width: number) {
  if (!new URL(src).hostname.endsWith('.imgix.net')) return src
  const separator = src.includes('?') ? '&' : '?'
  return `${src}${separator}w=${width}&auto=format,compress`
}
