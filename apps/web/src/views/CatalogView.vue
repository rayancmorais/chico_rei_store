<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ProductSummary } from '@chico_rei_store/shared'
import { fetchProducts } from '@/services/api'
import ProductCard from '@/components/ProductCard.vue'
import ProductCardSkeleton from '@/components/ProductCardSkeleton.vue'
import FeedbackState from '@/components/FeedbackState.vue'

// Um status só, em vez de booleans soltos, para "carregando e com erro" ser impossível.

type Status = 'loading' | 'success' | 'error'

const SKELETON_COUNT = 8

const status = ref<Status>('loading')
const products = ref<ProductSummary[]>([])
const total = ref(0)

async function load() {
  status.value = 'loading'
  try {
    const response = await fetchProducts()
    products.value = response.data
    total.value = response.meta.total
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
}

onMounted(load)
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-6">
    <h1 class="text-2xl font-bold text-stone-900">Loja</h1>
    <p v-if="status === 'success'" class="mt-1 text-sm text-stone-600" data-test="result-count">
      {{ total }} {{ total === 1 ? 'produto' : 'produtos' }}
    </p>

    <div
      v-if="status === 'loading'"
      class="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      data-test="loading"
    >
      <span class="sr-only" role="status">Carregando produtos…</span>
      <ProductCardSkeleton v-for="n in SKELETON_COUNT" :key="n" />
    </div>

    <FeedbackState
      v-else-if="status === 'error'"
      role="alert"
      title="Não conseguimos carregar os produtos"
      description="Verifique sua conexão e tente de novo."
      data-test="error"
    >
      <button
        type="button"
        class="rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        data-test="retry"
        @click="load"
      >
        Tentar de novo
      </button>
    </FeedbackState>

    <FeedbackState
      v-else-if="products.length === 0"
      role="status"
      title="Nenhum produto encontrado"
      data-test="empty"
    />

    <ul
      v-else
      class="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"
      data-test="product-grid"
    >
      <li v-for="product in products" :key="product.id">
        <ProductCard :product="product" />
      </li>
    </ul>
  </main>
</template>
