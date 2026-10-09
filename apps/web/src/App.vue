<script setup lang="ts">
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <header class="flex items-center justify-between p-4">
      <router-link to="/" class="font-bold">Chico Rei Store</router-link>
      <span>Carrinho ({{ cart.itemCount }})</span>
    </header>
    <router-view />
  </div>
</template>
