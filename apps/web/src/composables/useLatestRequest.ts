import { onBeforeUnmount } from 'vue'

/**
 * Para telas que refazem a mesma busca (trocar filtro, ir de um produto a outro): cada `start()`
 * cancela a anterior, porque uma resposta lenta que chegasse depois sobrescreveria a mais nova.
 * Sair da tela cancela a que estiver em andamento.
 */
export function useLatestRequest() {
  let controller: AbortController | null = null

  function start(): AbortSignal {
    controller?.abort()
    controller = new AbortController()
    return controller.signal
  }

  onBeforeUnmount(() => controller?.abort())

  return { start }
}
