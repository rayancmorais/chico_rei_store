<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProductSummary } from '@chico_rei_store/shared'
import { pluralize } from '@/utils/format'
import { imageUrl } from '@/utils/image'
import PriceTag from '@/components/PriceTag.vue'

const props = defineProps<{ product: ProductSummary }>()

const MAX_SWATCHES = 5

const visibleColors = computed(() => props.product.colors.slice(0, MAX_SWATCHES))
const hiddenColorCount = computed(() => props.product.colors.length - visibleColors.value.length)
const colorsLabel = computed(
  () => `Disponível em ${pluralize(props.product.colors.length, 'cor', 'cores')}`,
)
const srcset = computed(
  () => `${imageUrl(props.product.image, 400)} 400w, ${imageUrl(props.product.image, 800)} 800w`,
)

// O recorte de detalhe só é baixado depois do primeiro hover: 24 cards não pedem 24 imagens extras.
const showDetail = ref(false)
</script>

<template>
  <router-link
    :to="{ name: 'product', params: { id: product.id } }"
    class="group flex h-full flex-col gap-3 rounded-control border-2.5 border-ink bg-surface p-[7px] shadow-hq transition-[transform,box-shadow] duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-hq-hover focus-ring-lg md:p-3"
    data-test="product-card"
    @mouseenter.native="showDetail = true"
  >
    <div class="relative aspect-[4/5] overflow-hidden rounded-[3px] border-2 border-ink bg-sand">
      <!-- alt vazio: o nome já é o texto do link, e o leitor de tela leria duas vezes. -->
      <img
        :src="imageUrl(product.image, 400)"
        :srcset="srcset"
        sizes="(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw"
        alt=""
        width="400"
        height="500"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <img
        v-if="showDetail"
        :src="imageUrl(product.image, 500, 'detail')"
        alt=""
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        data-test="detail-image"
      />
      <span
        class="pointer-events-none absolute bottom-0 right-0 h-[45%] w-[55%] bg-halftone bg-[length:7px_7px] opacity-25 mix-blend-multiply [mask-image:linear-gradient(135deg,transparent_35%,#000)]"
        aria-hidden="true"
      />
    </div>

    <div class="flex flex-1 flex-col gap-1 px-1 pb-1">
      <p class="text-xs font-medium text-accent">{{ product.type.label }}</p>
      <h2 class="line-clamp-2 min-h-[2.4em] font-display text-[15px] leading-tight md:text-lg">
        {{ product.name }}
      </h2>

      <div
        class="mt-auto flex flex-wrap items-center justify-between gap-1.5 border-t-2 border-ink pt-2"
      >
        <PriceTag :product="product" />

        <div v-if="product.colors.length" class="flex items-center pl-1">
          <span class="sr-only">{{ colorsLabel }}</span>
          <span
            v-for="color in visibleColors"
            :key="color.id"
            class="-ml-1 h-4 w-4 rounded-pill shadow-[inset_0_0_0_1px_rgba(0,0,0,.22)] ring-2 ring-surface"
            :style="{ backgroundColor: color.hex }"
            aria-hidden="true"
          />
          <span
            v-if="hiddenColorCount > 0"
            class="ml-1.5 text-[11px] text-muted"
            aria-hidden="true"
            data-test="more-colors"
          >
            +{{ hiddenColorCount }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>
