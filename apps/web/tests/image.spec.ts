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

  it('não mexe em imagens de outros hosts', () => {
    expect(imageUrl('https://cdn.example.com/a.png', 400)).toBe('https://cdn.example.com/a.png')
  })
})
