import { nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { scrollMotion } from '@/utils/scroll'

// Folga em pixels: arredondamento de zoom deixa o scroll a 1px da ponta.
const EDGE = 4
const PAGE_RATIO = 0.7

/**
 * Setas para uma linha que rola na horizontal. Trackpad e toque já rolam sozinhos; mouse de
 * roda não rola na horizontal, então sem setas os itens escondidos ficam fora de alcance.
 * A roda não é convertida em rolagem horizontal de propósito: a barra é fixa no topo, e isso
 * travaria a rolagem da página sempre que o cursor passasse por cima dela.
 */
export function useScrollArrows(track: Ref<HTMLElement | null>) {
  const canScrollBack = ref(false)
  const canScrollForward = ref(false)
  const hiddenAhead = ref(0)

  function measure() {
    const el = track.value
    if (!el) return
    const visibleEnd = el.scrollLeft + el.clientWidth
    canScrollBack.value = el.scrollLeft > EDGE
    canScrollForward.value = visibleEnd < el.scrollWidth - EDGE
    // Conta quem não aparece inteiro antes da borda direita: é o que a seta vai revelar.
    const right = el.getBoundingClientRect().right
    hiddenAhead.value = Array.from(el.children).filter((child) => {
      const box = child.getBoundingClientRect()
      return box.width > 0 && box.right > right + 1
    }).length
  }

  function scrollPage(direction: 1 | -1) {
    const el = track.value
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * PAGE_RATIO, behavior: scrollMotion() })
  }

  let observer: ResizeObserver | undefined

  onMounted(() => {
    const el = track.value
    if (!el) return
    el.addEventListener('scroll', measure, { passive: true })
    // Pega mudança de largura da linha (janela redimensionada). Mudança nos itens não muda o
    // tamanho da linha, então quem usa chama `measure` quando a lista muda.
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure)
      observer.observe(el)
    }
    void nextTick(measure)
  })

  onBeforeUnmount(() => {
    track.value?.removeEventListener('scroll', measure)
    observer?.disconnect()
  })

  return {
    canScrollBack,
    canScrollForward,
    hiddenAhead,
    measure,
    scrollBack: () => scrollPage(-1),
    scrollForward: () => scrollPage(1),
  }
}
