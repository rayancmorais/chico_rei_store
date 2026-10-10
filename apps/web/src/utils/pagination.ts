export type PageItem = number | 'gap'

/**
 * Páginas para mostrar: sempre a primeira, a última e as vizinhas da atual; o resto vira
 * reticências. Com poucas páginas, mostra todas.
 */
export function pageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  const sorted = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b)

  return sorted.flatMap((n, index) => {
    const previous = sorted[index - 1]
    return previous !== undefined && n - previous > 1 ? (['gap', n] as PageItem[]) : [n]
  })
}

/** "13–24 de 26": o intervalo de itens mostrado na página atual. */
export function rangeLabel(page: number, pageSize: number, total: number) {
  if (total === 0) return ''
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)
  return `${first}–${last} de ${total}`
}
