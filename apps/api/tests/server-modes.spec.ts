import request from 'supertest'
import { createServerApp } from '../src/start-server'

// Os dois caminhos montam o app com o seed real: o de produção (server.ts, handler.ts) e o do dev.
describe('simulação de rede por caminho de inicialização', () => {
  it('produção ignora ?__fail=1 e responde normalmente', async () => {
    const { app } = createServerApp()
    const res = await request(app).get('/api/products?__fail=1')
    expect(res.status).toBe(200)
  })

  it('dev aplica ?__fail=1 e responde 500', async () => {
    const { app } = createServerApp({ latencyMs: 0 })
    const res = await request(app).get('/api/products?__fail=1')
    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('SIMULATED_FAILURE')
  })
})
