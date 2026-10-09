<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import type { ProductSummary } from '@chico_rei_store/shared'
import ProductCard from '@/components/ProductCard.vue'

const products = ref<ProductSummary[]>([])
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    const { data } = await axios.get<{ data: ProductSummary[] }>('/api/products')
    products.value = data.data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="p-4">
    <p v-if="loading" data-test="loading">Carregando…</p>
    <p v-else-if="error" data-test="error">Não conseguimos carregar os produtos</p>
    <p v-else-if="products.length === 0" data-test="empty">Nenhum produto</p>
    <div v-else class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <ProductCard v-for="p in products" :key="p.id" :product="p" />
    </div>
  </main>
</template>
