import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

interface ModalDialogOptions {
  isOpen: () => boolean
  panel: Ref<HTMLElement | null>
  initialFocus: Ref<HTMLElement | null>
  onClose: () => void
}

/**
 * Comportamento de teclado e foco de um diálogo modal: o foco entra ao abrir e volta para quem
 * abriu ao fechar, Tab fica preso dentro, Esc fecha e a página de trás não rola.
 */
export function useModalDialog({ isOpen, panel, initialFocus, onClose }: ModalDialogOptions) {
  let focusBeforeOpen: HTMLElement | null = null

  watch(isOpen, async (open) => {
    if (open) {
      focusBeforeOpen = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      await nextTick()
      initialFocus.value?.focus()
    } else {
      document.body.style.overflow = ''
      focusBeforeOpen?.focus()
    }
  })

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose()
      return
    }
    if (event.key !== 'Tab' || !panel.value) return

    const focusable = panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  // Desmontar com o diálogo aberto não pode deixar a página travada.
  onBeforeUnmount(() => {
    document.body.style.overflow = ''
  })

  return { onKeydown }
}
