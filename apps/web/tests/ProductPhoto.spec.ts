import { mount } from '@vue/test-utils'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'
import ProductPhoto from '@/components/ProductPhoto.vue'

const IMAGE = 'https://umapenca.imgix.net/1/a.png'

// O jsdom não implementa media queries: aqui se escolhe se o aparelho tem mouse.
function mountPhoto({ hasMouse = true } = {}) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: hasMouse, media: query }))
  return mount(ProductPhoto as ComponentOptions<Vue>, {
    propsData: { image: IMAGE, name: 'Ecobag Teste' },
    attachTo: document.body,
  })
}

type Wrapper = ReturnType<typeof mountPhoto>
const frame = (wrapper: Wrapper) => wrapper.find('[data-test="photo-frame"]')
const toggle = (wrapper: Wrapper) => wrapper.find('[data-test="zoom-toggle"]')
const transform = (wrapper: Wrapper) =>
  (wrapper.find('[data-test="photo-zoom"]').element as HTMLElement).style.transform
const pressEscape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

describe('ProductPhoto: zoom ligado pelo botão', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('sem ligar o zoom, passar o mouse não amplia', async () => {
    const wrapper = mountPhoto()

    await frame(wrapper).trigger('pointerenter')

    expect(transform(wrapper)).toBe('none')
    expect(toggle(wrapper).attributes('aria-pressed')).toBe('false')
    // Só a lupa aparece; o nome do botão vem do aria-label, e o estado, do aria-pressed.
    expect(toggle(wrapper).text()).toBe('')
    expect(toggle(wrapper).attributes('aria-label')).toBe('Ampliar foto')
  })

  it('o botão da lupa liga o zoom, e o hover amplia 2x seguindo o mouse', async () => {
    const wrapper = mountPhoto()
    frame(wrapper).element.getBoundingClientRect = () =>
      ({ left: 100, top: 50, width: 400, height: 500 }) as DOMRect

    await toggle(wrapper).trigger('click')
    expect(toggle(wrapper).attributes('aria-pressed')).toBe('true')
    expect(frame(wrapper).classes()).toContain('cursor-zoom-in')

    await frame(wrapper).trigger('pointermove', { clientX: 200, clientY: 425 })
    expect(transform(wrapper)).toBe('scale(2)')
    const zoomLayer = wrapper.find('[data-test="photo-zoom"]').element as HTMLElement
    expect(zoomLayer.style.transformOrigin).toBe('25% 75%')

    await frame(wrapper).trigger('pointerleave')
    expect(transform(wrapper)).toBe('none')
  })

  it('clicar de novo desliga o zoom e a foto volta ao normal', async () => {
    const wrapper = mountPhoto()
    await toggle(wrapper).trigger('click')
    await frame(wrapper).trigger('pointerenter')

    await toggle(wrapper).trigger('click')

    expect(toggle(wrapper).attributes('aria-pressed')).toBe('false')
    expect(transform(wrapper)).toBe('none')
  })

  it('Esc desliga o zoom, com o foco em qualquer lugar da página', async () => {
    const wrapper = mountPhoto()
    await toggle(wrapper).trigger('click')
    await frame(wrapper).trigger('pointerenter')

    pressEscape()
    await wrapper.vm.$nextTick()

    expect(toggle(wrapper).attributes('aria-pressed')).toBe('false')
    expect(transform(wrapper)).toBe('none')
  })

  it('a versão grande só é pedida depois de ligar o zoom', async () => {
    const wrapper = mountPhoto()
    await frame(wrapper).trigger('pointerenter')
    expect(wrapper.find('[data-test="product-photo-hires"]').exists()).toBe(false)

    await toggle(wrapper).trigger('click')

    const hiRes = wrapper.find('[data-test="product-photo-hires"]')
    expect(hiRes.attributes('srcset')).toBe(
      `${IMAGE}?w=1200&auto=format,compress 1200w, ${IMAGE}?w=1800&auto=format,compress 1800w`,
    )
    expect(hiRes.attributes('alt')).toBe('')
  })

  it('no celular, o botão também aparece; ligado, a foto já amplia e o dedo escolhe o ponto', async () => {
    const wrapper = mountPhoto({ hasMouse: false })
    frame(wrapper).element.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 400, height: 250 }) as DOMRect
    expect(transform(wrapper)).toBe('none')

    await toggle(wrapper).trigger('click')
    expect(transform(wrapper)).toBe('scale(2)')

    await frame(wrapper).trigger('pointermove', { clientX: 100, clientY: 200 })
    const zoomLayer = wrapper.find('[data-test="photo-zoom"]').element as HTMLElement
    expect(zoomLayer.style.transformOrigin).toBe('25% 80%')

    // Sem hover no toque: soltar o dedo não desfaz o zoom; só o botão desliga.
    await frame(wrapper).trigger('pointerleave')
    expect(transform(wrapper)).toBe('scale(2)')
    await toggle(wrapper).trigger('click')
    expect(transform(wrapper)).toBe('none')
  })

  it('a foto principal mantém alt e dimensões, e a lupa do botão é decorativa', () => {
    const wrapper = mountPhoto()
    const photo = wrapper.find('[data-test="product-photo"]')

    expect(photo.attributes('alt')).toBe('Ecobag Teste')
    expect(photo.attributes('width')).toBe('800')
    expect(photo.attributes('height')).toBe('1000')
    expect(toggle(wrapper).find('svg').attributes('aria-hidden')).toBe('true')
  })
})
