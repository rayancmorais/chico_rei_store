<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { ProductSummary } from '@chico_rei_store/shared'
import { fetchProducts } from '@/services/api'
import ProductCard from '@/components/ProductCard.vue'

const props = defineProps<{ productId: string; typeId: string }>()

const LIMIT = 4

const products = ref<ProductSummary[]>([])
let controller: AbortController | null = null

async function load() {
  controller?.abort()
  const current = new AbortController()
  controller = current
  products.value = []

  try {
    // Pede um a mais porque o produto aberto pode vir na lista e é descartado.
    const { data } = await fetchProducts({ type: [props.typeId], limit: LIMIT + 1 }, current.signal)
    products.value = data.filter((item) => item.id !== props.productId).slice(0, LIMIT)
  } catch {
    // Seção complementar: se falhar, some em silêncio em vez de competir com o erro principal.
    products.value = []
  }
}

watch(() => props.productId, load, { immediate: true })
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <section
    v-if="products.length"
    class="flex flex-col gap-6 pt-14 md:pt-20"
    aria-labelledby="related-title"
    data-test="related"
  >
    <h2 id="related-title" class="font-display text-title-md md:text-[38px]">
      Mais do
      <span
        class="inline-block -rotate-[1.5deg] rounded-control border-3 border-ink bg-accent px-2.5 pb-1 text-surface shadow-hq"
      >
        ateliê
      </span>
    </h2>
    <ul class="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-7">
      <li v-for="item in products" :key="item.id">
        <ProductCard :product="item" />
      </li>
    </ul>
  </section>
</template>
