<script setup lang="ts">
import type { ProductSummary } from '@chico_rei_store/shared'

defineProps<{ product: ProductSummary }>()
</script>

<template>
  <router-link :to="`/produto/${product.id}`" class="block">
    <img :src="product.image" :alt="product.name" loading="lazy" width="300" height="300" />
    <h2>{{ product.name }}</h2>
  </router-link>
</template>
