import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { http, HttpResponse } from 'msw'
import CatalogView from '@/views/CatalogView.vue'
import { server } from './setup'
import { listResponse, productSummary } from './factories'

const localVue = createLocalVue()
localVue.use(PiniaVuePlugin)

// Espera a resposta do MSW e o re-render do Vue.

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

function mountView() {
  return mount(CatalogView, {
    localVue,
    pinia: createTestingPinia({ createSpy: vi.fn }),
    stubs: { RouterLink: RouterLinkStub },
  })
}

describe('CatalogView', () => {
  it('mostra o skeleton e depois a grade com a contagem', async () => {
    const wrapper = mountView()
    expect(wrapper.find('[data-test="loading"]').exists()).toBe(true)

    await settle()

    expect(wrapper.find('[data-test="loading"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test="product-card"]')).toHaveLength(1)
    expect(wrapper.find('[data-test="result-count"]').text()).toBe('1 produto')
  })

  it('mostra o estado vazio quando a API não retorna produtos', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.json(listResponse([]))))
    const wrapper = mountView()
    await settle()
    expect(wrapper.find('[data-test="empty"]').exists()).toBe(true)
  })

  it('mostra o erro e recupera ao tentar de novo', async () => {
    // O primeiro handler tem prioridade; com `once`, o 500 responde só a primeira chamada.
    server.use(
      http.get('*/api/products', () => HttpResponse.json({}, { status: 500 }), { once: true }),
      http.get('*/api/products', () =>
        HttpResponse.json(listResponse([productSummary(), productSummary({ id: 'cam-2' })])),
      ),
    )
    const wrapper = mountView()
    await settle()
    expect(wrapper.find('[data-test="error"]').attributes('role')).toBe('alert')

    await wrapper.find('[data-test="retry"]').trigger('click')
    await settle()

    expect(wrapper.find('[data-test="error"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test="product-card"]')).toHaveLength(2)
  })
})
