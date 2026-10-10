import seed from '../../../data/seed.json'
import { createProductRepository } from '../src/repositories/product-repository'

describe('createProductRepository', () => {
  it('carrega o seed real e encontra produtos pelo id', () => {
    const repository = createProductRepository(seed)
    const [first] = repository.all()

    expect(repository.all().length).toBe(seed.products.length)
    expect(repository.findById(first!.id)).toBe(first)
  })

  it('recusa um seed com formato inválido', () => {
    expect(() =>
      createProductRepository({ products: [{ name: 'sem os outros campos' }] }),
    ).toThrow()
  })
})
