<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { MAX_QUANTITY, useCartStore, type CartItem } from '@/stores/cart'
import { useModalDialog } from '@/composables/useModalDialog'
import BurstSeal from '@/components/BurstSeal.vue'
import { formatPrice } from '@/utils/format'
import { imageUrl } from '@/utils/image'

const cart = useCartStore()

const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)

const { onKeydown } = useModalDialog({
  isOpen: () => cart.isOpen,
  panel,
  initialFocus: closeButton,
  onClose: () => cart.close(),
})

const countLabel = computed(() => `${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'itens'}`)

function variantLabel(item: CartItem) {
  return item.size ? `${item.color.name} · Tamanho ${item.size}` : item.color.name
}

// O botão clicado some junto com o item; o foco precisa de um lugar para ir.
async function removeItem(key: string) {
  cart.remove(key)
  await nextTick()
  closeButton.value?.focus()
}
</script>

<template>
  <transition
    enter-active-class="transition-opacity duration-200"
    enter-class="opacity-0"
    leave-active-class="transition-opacity duration-150"
    leave-to-class="opacity-0"
  >
    <div v-if="cart.isOpen" class="fixed inset-0 z-40" @keydown="onKeydown">
      <div
        class="absolute inset-0 bg-ink/45"
        aria-hidden="true"
        data-test="cart-backdrop"
        @click="cart.close()"
      />

      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        class="absolute inset-2 flex flex-col overflow-hidden rounded-[10px] border-3 border-ink bg-surface shadow-[-6px_6px_0_#2A1F17] motion-safe:animate-slide-in-right md:inset-y-3 md:left-auto md:right-3 md:w-[440px]"
        data-test="cart-drawer"
      >
        <div
          class="flex items-center justify-between border-b-3 border-ink bg-mustard px-4 py-3.5 md:px-6"
        >
          <h2 id="cart-title" class="flex items-center gap-2.5 font-display text-[26px]">
            Carrinho
            <span
              class="flex h-[30px] min-w-[30px] items-center justify-center rounded-pill border-2.5 border-ink bg-surface px-2 font-sans text-[13px] font-bold"
              aria-hidden="true"
            >
              {{ cart.itemCount }}
            </span>
            <span class="sr-only">, {{ countLabel }}</span>
          </h2>
          <button
            ref="closeButton"
            type="button"
            class="flex size-11 items-center justify-center rounded-control border-2.5 border-ink bg-white text-sm shadow-hq-sm transition-transform hover:-translate-x-px hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            aria-label="Fechar carrinho"
            data-test="close-cart"
            @click="cart.close()"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div
          v-if="cart.items.length === 0"
          class="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-10 text-center"
          data-test="cart-empty"
        >
          <BurstSeal label="OPS!" class="motion-safe:animate-stamp" />
          <p class="font-display text-[30px] leading-[1.1]">Seu carrinho <br />está vazio.</p>
          <p class="max-w-[280px] text-sm text-muted">
            Escolha uma estampa na loja e ela aparece aqui.
          </p>
          <button type="button" class="btn-hq-accent" @click="cart.close()">
            Continuar comprando
          </button>
        </div>

        <template v-else>
          <ul class="flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 py-4 md:px-6">
            <li
              v-for="item in cart.items"
              :key="item.key"
              class="flex gap-3 rounded-control border-2.5 border-ink bg-white p-2.5 shadow-[3px_3px_0_#2A1F17]"
              data-test="cart-item"
            >
              <img
                :src="imageUrl(item.image, 160)"
                alt=""
                width="78"
                height="96"
                class="h-24 w-[78px] shrink-0 rounded-[4px] border-2 border-ink bg-sand object-cover"
              />
              <div class="flex min-w-0 flex-1 flex-col gap-1">
                <div class="flex items-start justify-between gap-2">
                  <p class="font-display text-[15px] leading-tight">{{ item.name }}</p>
                  <button
                    type="button"
                    class="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-[4px] border-2 border-ink text-xs transition-colors hover:bg-accent hover:text-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    :aria-label="`Remover ${item.name}, ${variantLabel(item)}`"
                    title="Remover"
                    data-test="remove-item"
                    @click="removeItem(item.key)"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
                <p class="text-xs text-muted" data-test="item-variant">
                  {{ variantLabel(item) }}
                </p>

                <div class="mt-auto flex items-center justify-between gap-2 pt-2">
                  <div
                    class="flex items-center overflow-hidden rounded-control border-2 border-ink"
                    role="group"
                    :aria-label="`Quantidade de ${item.name}`"
                  >
                    <button
                      type="button"
                      class="flex h-10 w-11 items-center justify-center border-r-2 border-ink bg-surface transition-colors hover:bg-sand focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-surface"
                      :disabled="item.quantity <= 1"
                      aria-label="Diminuir quantidade"
                      data-test="decrease"
                      @click="cart.setQuantity(item.key, item.quantity - 1)"
                    >
                      −
                    </button>
                    <span
                      class="w-[30px] text-center text-[13px] font-bold"
                      aria-live="polite"
                      data-test="quantity"
                    >
                      {{ item.quantity }}
                    </span>
                    <button
                      type="button"
                      class="flex h-10 w-11 items-center justify-center border-l-2 border-ink bg-surface transition-colors hover:bg-sand focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-surface"
                      :disabled="item.quantity >= MAX_QUANTITY"
                      aria-label="Aumentar quantidade"
                      data-test="increase"
                      @click="cart.setQuantity(item.key, item.quantity + 1)"
                    >
                      +
                    </button>
                  </div>
                  <p class="text-[15px] font-bold" data-test="item-total">
                    {{ formatPrice(item.unitPriceCents * item.quantity) }}
                  </p>
                </div>
              </div>
            </li>
          </ul>

          <div class="flex flex-col gap-3 border-t-3 border-ink bg-paper px-4 pb-5 pt-4 md:px-6">
            <div class="flex items-baseline justify-between">
              <span class="font-display text-xl">Subtotal</span>
              <span class="text-2xl font-bold" aria-live="polite" data-test="cart-subtotal">
                {{ formatPrice(cart.subtotalCents) }}
              </span>
            </div>
            <p class="text-xs text-muted">
              Esta loja é uma demonstração: frete e pagamento ficam fora do escopo.
            </p>
            <button
              type="button"
              class="btn-hq w-full bg-white"
              data-test="keep-shopping"
              @click="cart.close()"
            >
              Continuar comprando
            </button>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>
