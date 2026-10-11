import { pickHeroProducts } from '@/utils/hero-picks'

const item = (name: string, type: string) => ({ name, type: { id: type, label: type } })
const names = (list: { name: string }[]) => list.map((product) => product.name)

describe('pickHeroProducts', () => {
  it('ignora os modelos personalizáveis, sem diferenciar maiúsculas de minúsculas', () => {
    const picks = pickHeroProducts(
      [
        item('Camiseta Personalizada - Estampa Tradicional', 'camiseta'),
        item('CAMISETA INFANTIL PERSONALIZADA', 'camiseta-infantil'),
        item('Camiseta Tridente Exu', 'camiseta'),
      ],
      3,
    )
    expect(names(picks)).toEqual(['Camiseta Tridente Exu'])
  })

  it('prefere um produto de cada tipo, na ordem em que aparecem', () => {
    const picks = pickHeroProducts(
      [
        item('Camiseta A', 'camiseta'),
        item('Camiseta B', 'camiseta'),
        item('Moletom A', 'moletom'),
        item('Caneca A', 'caneca'),
      ],
      3,
    )
    expect(names(picks)).toEqual(['Camiseta A', 'Moletom A', 'Caneca A'])
  })

  it('repete tipo só quando falta variedade', () => {
    const picks = pickHeroProducts(
      [
        item('Camiseta A', 'camiseta'),
        item('Camiseta B', 'camiseta'),
        item('Moletom A', 'moletom'),
      ],
      3,
    )
    expect(names(picks)).toEqual(['Camiseta A', 'Moletom A', 'Camiseta B'])
  })

  it('com lista vazia ou curta, devolve o que houver', () => {
    expect(pickHeroProducts([], 3)).toEqual([])
    expect(names(pickHeroProducts([item('Caneca A', 'caneca')], 3))).toEqual(['Caneca A'])
    expect(pickHeroProducts([item('Camiseta Personalizada', 'camiseta')], 3)).toEqual([])
  })

  it('é determinística e não altera a lista recebida', () => {
    const products = [
      item('Camiseta A', 'camiseta'),
      item('Camiseta B', 'camiseta'),
      item('Moletom A', 'moletom'),
    ]
    const copy = structuredClone(products)

    expect(pickHeroProducts(products, 3)).toEqual(pickHeroProducts(products, 3))
    expect(products).toEqual(copy)
  })
})
