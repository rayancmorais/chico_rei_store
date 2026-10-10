import { imageUrl } from '@/utils/image'

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

  it('pede um recorte quadrado com zoom no detalhe da estampa', () => {
    expect(imageUrl('https://umapenca.imgix.net/1/a.png', 400, 'detail')).toBe(
      'https://umapenca.imgix.net/1/a.png?w=400&h=400&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.42&fp-z=2.2&auto=format,compress',
    )
  })

  it('não mexe em imagens de outros hosts', () => {
    expect(imageUrl('https://cdn.example.com/a.png', 400)).toBe('https://cdn.example.com/a.png')
    expect(imageUrl('https://cdn.example.com/a.png', 400, 'detail')).toBe(
      'https://cdn.example.com/a.png',
    )
  })
})
