import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { http, HttpResponse } from 'msw'
import CatalogView from '@/views/CatalogView.vue'
import { server } from './setup'

const localVue = createLocalVue()
localVue.use(PiniaVuePlugin)

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

function mountView() {
  return mount(CatalogView, {
    localVue,
    pinia: createTestingPinia({ createSpy: vi.fn }),
    stubs: { RouterLink: RouterLinkStub },
  })
}

describe('CatalogView', () => {
  it('mostra loading e depois a grade', async () => {
    const wrapper = mountView()
    expect(wrapper.find('[data-test="loading"]').exists()).toBe(true)
    await flushPromises()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Camiseta Teste')
  })

  it('mostra o estado de erro quando a API falha', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.json({}, { status: 500 })))
    const wrapper = mountView()
    await flushPromises()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-test="error"]').exists()).toBe(true)
  })
})
