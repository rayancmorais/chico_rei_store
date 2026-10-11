import { pluralize } from '../src/pluralize'

describe('pluralize', () => {
  it('usa o singular só para 1', () => {
    expect(pluralize(1, 'página', 'páginas')).toBe('1 página')
    expect(pluralize(5, 'página', 'páginas')).toBe('5 páginas')
    expect(pluralize(0, 'produto', 'produtos')).toBe('0 produtos')
  })
})
