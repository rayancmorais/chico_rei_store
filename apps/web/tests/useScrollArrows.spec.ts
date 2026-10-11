import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { useScrollArrows } from '@/composables/useScrollArrows'

// O jsdom não calcula layout: largura, rolagem e posição de cada item são definidas à mão.
function mountTrack({ itemRights }: { itemRights: number[] }) {
  let arrows!: ReturnType<typeof useScrollArrows>
  const wrapper = mount(
    {
      setup() {
        const track = ref<HTMLElement | null>(null)
        arrows = useScrollArrows(track)
        return { track }
      },
      template: '<div ref="track"><span v-for="n in 3" :key="n" /></div>',
    },
    { attachTo: document.body },
  )
  const el = wrapper.element as HTMLElement
  Object.defineProperties(el, {
    clientWidth: { value: 300, configurable: true },
    scrollWidth: { value: 700, configurable: true },
    scrollLeft: { value: 0, writable: true, configurable: true },
  })
  el.getBoundingClientRect = () => ({ right: 300 }) as DOMRect
  Array.from(el.children).forEach((child, i) => {
    child.getBoundingClientRect = () => ({ width: 100, right: itemRights[i]! }) as DOMRect
  })
  el.scrollBy = vi.fn()
  return { wrapper, el, arrows }
}

describe('useScrollArrows', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('no início, só a seta de avançar aparece, com quantos itens estão escondidos', () => {
    const { arrows } = mountTrack({ itemRights: [100, 400, 700] })
    arrows.measure()

    expect(arrows.canScrollBack.value).toBe(false)
    expect(arrows.canScrollForward.value).toBe(true)
    expect(arrows.hiddenAhead.value).toBe(2)
  })

  it('no fim da linha, a seta de avançar some e a de voltar aparece', () => {
    const { el, arrows } = mountTrack({ itemRights: [-300, 0, 300] })
    el.scrollLeft = 400
    arrows.measure()

    expect(arrows.canScrollBack.value).toBe(true)
    expect(arrows.canScrollForward.value).toBe(false)
    expect(arrows.hiddenAhead.value).toBe(0)
  })

  it('as setas rolam 70% da largura visível', () => {
    const { el, arrows } = mountTrack({ itemRights: [100, 400, 700] })

    arrows.scrollForward()
    arrows.scrollBack()

    expect(el.scrollBy).toHaveBeenNthCalledWith(1, { left: 210, behavior: 'smooth' })
    expect(el.scrollBy).toHaveBeenNthCalledWith(2, { left: -210, behavior: 'smooth' })
  })
})
