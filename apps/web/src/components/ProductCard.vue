<script setup lang="ts">
import { computed } from 'vue'
import type { ProductSummary } from '@chico_rei_store/shared'
import { formatPrice } from '@/utils/format'
import { imageUrl } from '@/utils/image'

const props = defineProps<{ product: ProductSummary }>()

const MAX_SWATCHES = 5

const visibleColors = computed(() => props.product.colors.slice(0, MAX_SWATCHES))
const hiddenColorCount = computed(() => props.product.colors.length - visibleColors.value.length)
const colorsLabel = computed(() => {
  const count = props.product.colors.length
  return `Disponível em ${count} ${count === 1 ? 'cor' : 'cores'}`
})
const srcset = computed(
  () => `${imageUrl(props.product.image, 400)} 400w, ${imageUrl(props.product.image, 800)} 800w`,
)
</script>

<template>
  <router-link
    :to="{ name: 'product', params: { id: product.id } }"
    class="group block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-900"
    data-test="product-card"
  >
    <div class="aspect-square overflow-hidden rounded-lg bg-stone-100">
      <!-- alt vazio: o nome já é o texto do link, e o leitor de tela leria duas vezes. -->

      <img
        :src="imageUrl(product.image, 400)"
        :srcset="srcset"
        sizes="(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw"
        alt=""
        width="400"
        height="400"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-contain transition-transform duration-300 motion-safe:group-hover:scale-105"
      />
    </div>

    <p class="mt-3 text-xs uppercase tracking-wide text-stone-500">{{ product.type.label }}</p>
    <h2 class="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-stone-900">
      {{ product.name }}
    </h2>

    <p class="mt-1 text-sm">
      <span
        v-if="product.originalPriceCents !== null"
        class="mr-2 text-stone-400 line-through"
        data-test="original-price"
      >
        <span class="sr-only">De</span> {{ formatPrice(product.originalPriceCents) }}
      </span>
      <span class="font-semibold text-stone-900" data-test="price">
        <span v-if="product.originalPriceCents !== null" class="sr-only">por</span>
        {{ formatPrice(product.priceCents) }}
      </span>
    </p>

    <div v-if="product.colors.length" class="mt-2 flex items-center gap-1">
      <span class="sr-only">{{ colorsLabel }}</span>
      <span
        v-for="color in visibleColors"
        :key="color.id"
        class="h-3 w-3 rounded-full border border-stone-300"
        :style="{ backgroundColor: color.hex }"
        aria-hidden="true"
      />
      <span
        v-if="hiddenColorCount > 0"
        class="text-xs text-stone-500"
        aria-hidden="true"
        data-test="more-colors"
      >
        +{{ hiddenColorCount }}
      </span>
    </div>
  </router-link>
</template>
