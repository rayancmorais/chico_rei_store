import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'

// No nível do módulo porque quem pede (o menu, no App) e quem atende (a listagem) não se conhecem,
// e o pedido pode vir de outra tela, antes de a listagem existir.
const requested = ref(false)

/**
 * Pedido do menu do topo para levar a pessoa até a listagem. Não depende de a rota mudar: clicar
 * no link que já está ativo não navega, mas deve rolar do mesmo jeito.
 */
export function requestListingReveal() {
  requested.value = true
}

/**
 * Atende o pedido uma vez só, quando `ready` indicar que a listagem já está na posição final
 * (vindo de outra tela, hero e filtros ainda mudam de altura durante a primeira carga).
 */
export function useListingReveal(reveal: () => void, ready: Ref<boolean>) {
  watch(
    [requested, ready],
    async () => {
      if (!requested.value || !ready.value) return
      requested.value = false
      await nextTick()
      reveal()
    },
    { immediate: true },
  )

  // Quem clicou no menu e saiu antes da primeira carga não pode ser rolado em outra visita.
  onBeforeUnmount(() => {
    requested.value = false
  })
}
