import request from 'supertest'
import { createApp } from '../src/app'
import type { ProductRepository } from '../src/repositories/product-repository'
import { catalog } from './factories'

const repository: ProductRepository = {
  all: () => catalog,
  findById: (id) => catalog.find((product) => product.id === id),
}

const app = createApp({ repository })

describe('rotas da API', () => {
  it('GET /api/health informa quantos produtos estão carregados', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok', products: 4 })
  })

  it('GET /api/products devolve dados e paginação, com cache', async () => {
    const res = await request(app).get('/api/products?type=camiseta&limit=1')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.meta).toEqual({ total: 2, page: 1, limit: 1, totalPages: 2 })
    expect(res.headers['cache-control']).toBe('public, max-age=300')
  })

  it('GET /api/products recusa parâmetros inválidos com 400', async () => {
    const res = await request(app).get('/api/products?page=abc')

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_QUERY')
  })

  it('GET /api/products/:id devolve o produto completo', async () => {
    const res = await request(app).get('/api/products/3')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: '3', type: { id: 'moletom' } })
    expect(res.body.sizes).toBeDefined()
  })

  it('GET /api/products/:id responde 404 para produto inexistente', async () => {
    const res = await request(app).get('/api/products/999')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND')
  })

  it('GET /api/filters devolve tipos e cores com contagem', async () => {
    const res = await request(app).get('/api/filters')

    expect(res.status).toBe(200)
    expect(res.body.types[0]).toEqual({ id: 'camiseta', label: 'Camiseta', count: 2 })
  })

  it('rota inexistente responde 404 no mesmo formato de erro', async () => {
    const res = await request(app).get('/api/nada')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('não expõe o x-powered-by e envia cabeçalhos de segurança', async () => {
    const res = await request(app).get('/api/health')

    expect(res.headers['x-powered-by']).toBeUndefined()
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })
})

describe('cache das respostas', () => {
  it('resposta de sucesso pode ficar 5 minutos no cache', async () => {
    const res = await request(app).get('/api/filters')
    expect(res.headers['cache-control']).toBe('public, max-age=300')
  })

  it.each([
    ['produto inexistente', '/api/products/999'],
    ['rota inexistente', '/api/nada'],
    ['parâmetro inválido', '/api/products?page=abc'],
  ])('erro nunca é guardado em cache: %s', async (_case, url) => {
    const res = await request(app).get(url)
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(res.headers['cache-control']).toBe('no-store')
  })

  it('erro inesperado (500) também não é guardado em cache', async () => {
    const broken = createApp({
      repository: {
        all: () => {
          throw new Error('seed indisponível')
        },
        findById: () => undefined,
      },
    })
    // O errorHandler loga o erro inesperado; aqui o log só polui a saída do teste.
    const silenced = vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await request(broken).get('/api/products')
    silenced.mockRestore()

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    expect(res.headers['cache-control']).toBe('no-store')
  })
})

describe('simulação de rede (desenvolvimento)', () => {
  const devApp = createApp({ repository, simulation: { latencyMs: 0 } })

  it('?__fail=1 força o erro 500 para ver o estado de erro na tela', async () => {
    const res = await request(devApp).get('/api/products?__fail=1')

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('SIMULATED_FAILURE')
  })

  it('sem simulação ligada, ?__fail=1 é ignorado', async () => {
    const res = await request(app).get('/api/products?__fail=1')

    expect(res.status).toBe(200)
  })
})
