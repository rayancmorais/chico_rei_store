import type { Route } from 'vue-router'
import { scrollBehavior } from '@/router'

const route = (path: string, query: Record<string, string> = {}) => ({ path, query }) as Route

describe('scrollBehavior do router', () => {
  it('voltar e avançar no navegador devolvem a rolagem de antes', () => {
    expect(scrollBehavior(route('/'), route('/produto/1'), { x: 0, y: 640 })).toEqual({
      x: 0,
      y: 640,
    })
  })

  it('trocar de tela ou de página da listagem volta ao topo', () => {
    expect(scrollBehavior(route('/produto/1'), route('/'), undefined)).toEqual({ x: 0, y: 0 })
    expect(scrollBehavior(route('/', { page: '2' }), route('/'), undefined)).toEqual({ x: 0, y: 0 })
  })

  it('marcar um filtro mantém a rolagem onde está', () => {
    expect(scrollBehavior(route('/', { type: 'caneca' }), route('/'), undefined)).toBeUndefined()
  })
})
