// Atalhos do menu do topo para filtros de tipo da listagem. São navegação, não dados de produto: os
// produtos vêm todos da API. "Papelaria" junta três tipos da vitrine num atalho só.
export const NAV_SHORTCUTS = [
  { label: 'Loja', type: undefined },
  { label: 'Camisetas', type: 'camiseta' },
  { label: 'Moletons', type: 'moletom' },
  { label: 'Papelaria', type: 'bottons,caderno,ima' },
] as const
