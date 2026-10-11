import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useLatestRequest } from '@/composables/useLatestRequest'

function mountWithRequest() {
  let request!: ReturnType<typeof useLatestRequest>
  const wrapper = mount(
    defineComponent({
      setup() {
        request = useLatestRequest()
        return () => h('div')
      },
    }),
  )
  return { wrapper, request }
}

describe('useLatestRequest', () => {
  it('uma nova busca cancela a anterior', () => {
    const { request } = mountWithRequest()
    const first = request.start()
    const second = request.start()

    expect(first.aborted).toBe(true)
    expect(second.aborted).toBe(false)
  })

  it('sair da tela cancela a busca em andamento', () => {
    const { wrapper, request } = mountWithRequest()
    const signal = request.start()

    wrapper.destroy()

    expect(signal.aborted).toBe(true)
  })
})
