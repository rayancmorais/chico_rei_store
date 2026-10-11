export function scrollMotion(): ScrollBehavior {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

/**
 * Cmd/Ctrl/Shift+clique e o botão do meio abrem o link em outra aba ou janela: esta aba não navega
 * e não deve rolar. Os mesmos casos que o `router-link` deixa para o navegador.
 */
export function opensInThisTab(event: MouseEvent) {
  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
}
