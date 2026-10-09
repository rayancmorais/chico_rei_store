import request from 'supertest'
import { createApp } from '../src/app'

describe('API', () => {
  it('responde o health check', async () => {
    const res = await request(createApp()).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('rejeita query inválida', async () => {
    const res = await request(createApp()).get('/api/products?page=abc')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_QUERY')
  })

  it('converte CSV em array', async () => {
    const res = await request(createApp()).get('/api/products?type=camiseta,moletom')
    expect(res.body.meta.type).toEqual(['camiseta', 'moletom'])
  })
})
