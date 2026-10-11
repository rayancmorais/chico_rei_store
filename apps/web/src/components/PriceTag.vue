<script setup lang="ts">
import type { ProductSummary } from '@chico_rei_store/shared'
import { formatPrice } from '@/utils/format'

withDefaults(
  defineProps<{
    product: Pick<ProductSummary, 'priceCents' | 'originalPriceCents'>
    size?: 'sm' | 'lg'
  }>(),
  { size: 'sm' },
)
</script>

<template>
  <!-- "De/por" só para leitor de tela: visualmente o risco no preço antigo já diz isso. -->
  <p
    :class="size === 'lg' ? 'flex flex-wrap items-baseline gap-x-3' : 'text-[15px]'"
    data-test="price"
  >
    <span
      v-if="product.originalPriceCents !== null"
      class="text-muted line-through"
      :class="size === 'lg' ? 'text-lg' : 'mr-1.5 text-xs'"
      data-test="original-price"
    >
      <span class="sr-only">De</span> {{ formatPrice(product.originalPriceCents) }}
    </span>
    <span :class="size === 'lg' ? 'text-[30px] font-bold tracking-[-0.02em]' : 'font-semibold'">
      <span v-if="product.originalPriceCents !== null" class="sr-only">por</span>
      {{ formatPrice(product.priceCents) }}
    </span>
  </p>
</template>
