<script setup lang="ts">
import type { ProductSummary } from '@chico_rei_store/shared'
import { formatPrice, formatPriceAmount } from '@/utils/format'

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
    :class="size === 'lg' ? 'flex flex-wrap items-center gap-x-3' : 'text-[15px]'"
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
    <!-- Na página de produto, o preço vira um selo, no mesmo estilo do "no tecido!" do hero, que
         entra com um salto de HQ quando a página abre. O salto fica num invólucro para não
         desfazer a inclinação do selo. -->
    <span v-if="size === 'lg'" class="inline-block motion-safe:animate-pop">
      <span
        class="relative inline-flex -rotate-[1.5deg] items-baseline gap-1 overflow-hidden rounded-control border-2.5 border-ink bg-accent px-2.5 pb-0.5 text-surface shadow-hq-md"
      >
        <span
          class="pointer-events-none absolute inset-0 bg-halftone bg-[length:5px_5px] opacity-20"
          aria-hidden="true"
        />
        <span v-if="product.originalPriceCents !== null" class="sr-only">por</span>
        <span class="relative text-xs font-bold md:text-sm">R$</span>
        <span class="relative font-display text-[22px] leading-tight md:text-[28px]">{{
          formatPriceAmount(product.priceCents)
        }}</span>
      </span>
    </span>
    <span v-else class="font-semibold">
      <span v-if="product.originalPriceCents !== null" class="sr-only">por</span>
      {{ formatPrice(product.priceCents) }}
    </span>
  </p>
</template>
