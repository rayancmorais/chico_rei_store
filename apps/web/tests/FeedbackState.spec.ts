import { mount } from '@vue/test-utils'
import type Vue from 'vue'
import type { ComponentOptions } from 'vue'
import FeedbackState from '@/components/FeedbackState.vue'

function mountState(propsData: Record<string, unknown>, slot?: string) {
  // Os tipos do test-utils 1 não reconhecem componentes de <script setup> com props tipadas.
  return mount(FeedbackState as ComponentOptions<Vue>, {
    propsData,
    slots: slot ? { default: slot } : {},
  })
}

describe('FeedbackState', () => {
  it('mostra o selo, o título e a descrição', () => {
    const wrapper = mountState({
      seal: 'OPA!',
      title: 'Nada aqui.',
      description: 'Tente outro filtro.',
    })
    expect(wrapper.text()).toContain('OPA!')
    expect(wrapper.find('h2').text()).toBe('Nada aqui.')
    expect(wrapper.text()).toContain('Tente outro filtro.')
  })

  it('esconde o selo do leitor de tela, porque o título já diz o que houve', () => {
    const wrapper = mountState({ seal: 'XIII!', title: 'Erro.' })
    expect(wrapper.find('[aria-hidden="true"]').text()).toContain('XIII!')
  })

  it('só cria a área de ação quando o pai passa um botão', () => {
    expect(mountState({ seal: 'OPA!', title: 'Vazio.' }).find('button').exists()).toBe(false)
    expect(
      mountState({ seal: 'OPA!', title: 'Vazio.' }, '<button>Limpar filtros</button>')
        .find('button')
        .text(),
    ).toBe('Limpar filtros')
  })
})
