import { imageCornerUrl, imageUrl } from '@/utils/image'

describe('imageUrl', () => {
  it('pede ao imgix a largura e o formato certos', () => {
    expect(imageUrl('https://umapenca.imgix.net/1/a.png', 400)).toBe(
      'https://umapenca.imgix.net/1/a.png?w=400&auto=format,compress',
    )
  })

  it('preserva parâmetros que a URL já tinha', () => {
    expect(imageUrl('https://umapenca.imgix.net/1/a.png?v=2', 800)).toBe(
      'https://umapenca.imgix.net/1/a.png?v=2&w=800&auto=format,compress',
    )
  })

  it('com trim, corta a margem de fundo em volta da peça, com respiro', () => {
    expect(imageUrl('https://umapenca.imgix.net/1/a.png', 600, { trim: true })).toBe(
      'https://umapenca.imgix.net/1/a.png?trim=auto&trim-pad=60&w=600&auto=format,compress',
    )
  })

  it('não mexe em imagens de outros hosts', () => {
    expect(imageUrl('https://cdn.example.com/a.png', 400)).toBe('https://cdn.example.com/a.png')
    expect(imageUrl('https://cdn.example.com/a.png', 400, { trim: true })).toBe(
      'https://cdn.example.com/a.png',
    )
  })
})

describe('imageCornerUrl', () => {
  it('pede ao imgix só um recorte de 20 px do canto, para pintar o fundo da moldura', () => {
    expect(imageCornerUrl('https://umapenca.imgix.net/1/a.png')).toBe(
      'https://umapenca.imgix.net/1/a.png?rect=0,0,20,20',
    )
  })

  it('fora do imgix não há recorte, e a moldura fica com o fundo padrão', () => {
    expect(imageCornerUrl('https://cdn.example.com/a.png')).toBeUndefined()
  })
})
