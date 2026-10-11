import { mount } from '@vue/test-utils'
import { useMediaQuery } from '@/composables/useMediaQuery'

describe('useMediaQuery', () => {
  afterEach(() => vi.unstubAllGlobals())

  function mountWithQuery() {
    let listener: ((event: MediaQueryListEvent) => void) | undefined
    const removeEventListener = vi.fn()
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_type: string, callback: typeof listener) => (listener = callback),
      removeEventListener,
    }))
    let matches: ReturnType<typeof useMediaQuery> | undefined
    const wrapper = mount({
      setup() {
        matches = useMediaQuery('(min-width: 768px)')
        return {}
      },
      render: (h) => h('div'),
    })
    return {
      wrapper,
      matches: matches!,
      change: (value: boolean) => listener?.({ matches: value } as MediaQueryListEvent),
      removeEventListener,
    }
  }

  it('começa com o valor atual e acompanha as mudanças da tela', () => {
    const { matches, change } = mountWithQuery()
    expect(matches.value).toBe(false)

    change(true)
    expect(matches.value).toBe(true)
  })

  it('para de ouvir quando o componente sai da tela', () => {
    const { wrapper, removeEventListener } = mountWithQuery()
    wrapper.destroy()
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('sem matchMedia (jsdom), a query vale como falsa', () => {
    const wrapper = mount({
      setup() {
        return { matches: useMediaQuery('(min-width: 768px)') }
      },
      render(h) {
        return h('div', String((this as unknown as { matches: boolean }).matches))
      },
    })
    expect(wrapper.text()).toBe('false')
  })
})
