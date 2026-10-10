import { slugify } from '../src/slugify'

describe('slugify', () => {
  it('remove acentos e troca espaços por hífen', () => {
    expect(slugify('Cinza Mescla')).toBe('cinza-mescla')
    expect(slugify('Lilás')).toBe('lilas')
  })

  it('não deixa pontuação nem hífens nas pontas', () => {
    expect(slugify(' Off-White/Creme! ')).toBe('off-white-creme')
  })
})
