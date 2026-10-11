import { onBeforeUnmount, ref } from 'vue'

/**
 * Acompanha uma media query, para quando o DOM muda conforme a tela (e não só o estilo, que fica
 * com as classes responsivas). Sem `matchMedia` (jsdom), a query vale como falsa.
 */
export function useMediaQuery(query: string) {
  const media = window.matchMedia?.(query)
  const matches = ref(media?.matches ?? false)
  const sync = (event: MediaQueryListEvent) => (matches.value = event.matches)

  media?.addEventListener?.('change', sync)
  onBeforeUnmount(() => media?.removeEventListener?.('change', sync))

  return matches
}
