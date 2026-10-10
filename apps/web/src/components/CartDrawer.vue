<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { MAX_QUANTITY, useCartStore, type CartItem } from '@/stores/cart'
import { useModalDialog } from '@/composables/useModalDialog'
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
        class="absolute inset-0 bg-stone-900/40"
        aria-hidden="true"
        data-test="cart-backdrop"
        @click="cart.close()"
      />

      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        class="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl motion-safe:animate-slide-in-right"
        data-test="cart-drawer"
      >
        <div class="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 id="cart-title" class="text-lg font-semibold text-stone-900">
            Carrinho
            <span class="font-normal text-stone-500">({{ cart.itemCount }})</span>
          </h2>
          <button
            ref="closeButton"
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full text-xl text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-900"
            aria-label="Fechar carrinho"
            data-test="close-cart"
            @click="cart.close()"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div
          v-if="cart.items.length === 0"
          class="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center"
          data-test="cart-empty"
        >
          <p class="text-stone-600">Seu carrinho está vazio.</p>
          <button
            type="button"
            class="rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700"
            @click="cart.close()"
          >
            Continuar comprando
          </button>
        </div>

        <template v-else>
          <ul class="flex-1 divide-y divide-stone-200 overflow-y-auto px-5">
            <li
              v-for="item in cart.items"
              :key="item.key"
              class="flex gap-4 py-4"
              data-test="cart-item"
            >
              <img
                :src="imageUrl(item.image, 160)"
                alt=""
                width="80"
                height="80"
                class="h-20 w-20 shrink-0 rounded-md bg-stone-100 object-contain"
              />
              <div class="flex flex-1 flex-col gap-1">
                <p class="text-sm font-medium text-stone-900">{{ item.name }}</p>
                <p class="text-xs text-stone-600" data-test="item-variant">
                  {{ variantLabel(item) }}
                </p>

                <div class="mt-2 flex items-center justify-between gap-2">
                  <div
                    class="flex items-center rounded-full border border-stone-300"
                    role="group"
                    :aria-label="`Quantidade de ${item.name}`"
                  >
                    <button
                      type="button"
                      class="flex h-9 w-9 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                      :disabled="item.quantity <= 1"
                      aria-label="Diminuir quantidade"
                      data-test="decrease"
                      @click="cart.setQuantity(item.key, item.quantity - 1)"
                    >
                      −
                    </button>
                    <span class="w-8 text-center text-sm" aria-live="polite" data-test="quantity">
                      {{ item.quantity }}
                    </span>
                    <button
                      type="button"
                      class="flex h-9 w-9 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                      :disabled="item.quantity >= MAX_QUANTITY"
                      aria-label="Aumentar quantidade"
                      data-test="increase"
                      @click="cart.setQuantity(item.key, item.quantity + 1)"
                    >
                      +
                    </button>
                  </div>
                  <p class="text-sm font-semibold text-stone-900" data-test="item-total">
                    {{ formatPrice(item.unitPriceCents * item.quantity) }}
                  </p>
                </div>

                <button
                  type="button"
                  class="mt-1 self-start text-xs text-stone-600 underline underline-offset-2 hover:text-stone-900"
                  :aria-label="`Remover ${item.name}, ${variantLabel(item)}`"
                  data-test="remove-item"
                  @click="removeItem(item.key)"
                >
                  Remover
                </button>
              </div>
            </li>
          </ul>

          <div class="border-t border-stone-200 px-5 py-4">
            <div class="flex items-center justify-between text-base font-semibold text-stone-900">
              <span>Subtotal</span>
              <span aria-live="polite" data-test="cart-subtotal">
                {{ formatPrice(cart.subtotalCents) }}
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>
