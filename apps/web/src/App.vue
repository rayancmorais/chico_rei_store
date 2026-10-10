<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import CartDrawer from '@/components/CartDrawer.vue'

const cart = useCartStore()

const cartLabel = computed(() => {
  const count = cart.itemCount
  return `Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`
})
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <header class="border-b border-stone-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <router-link :to="{ name: 'catalog' }" class="font-bold text-stone-900">
          Penca Store
        </router-link>
        <button
          type="button"
          class="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-900 hover:border-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          :aria-label="cartLabel"
          aria-haspopup="dialog"
          data-test="open-cart"
          @click="cart.open()"
        >
          Carrinho <span data-test="cart-count">({{ cart.itemCount }})</span>
        </button>
      </div>
    </header>
    <router-view />
    <CartDrawer />
  </div>
</template>
