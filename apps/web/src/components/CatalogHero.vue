<script setup lang="ts">
import { computed } from 'vue'
import type { ProductSummary } from '@chico_rei_store/shared'
import BurstSeal from '@/components/BurstSeal.vue'
import { formatPrice } from '@/utils/format'
import { pickHeroProducts } from '@/utils/hero-picks'
import { imageUrl } from '@/utils/image'

// `total` opcional, e não `number | null`: o Vue 2.7 não sabe validar `null` em props tipadas.
const props = defineProps<{ products: ProductSummary[]; total?: number }>()

const emit = defineEmits<{ (event: 'shop'): void }>()

const HIGHLIGHTS = ['Impresso sob demanda', 'Cores e tamanhos à escolha', 'Vitrine de umapenca.com']

// O selo do quadro grande fica sempre visível, então só diz o que vale para todas as peças: a
// API não tem dado de vendas para sustentar um "Mais vendida". Os outros aparecem só no hover.
const FRAMES = [
  {
    word: 'Arte autoral',
    tone: 'mustard',
    alwaysVisible: true,
    tilt: 'group-hover:-rotate-1',
    delay: '100ms',
    area: 'row-span-2',
  },
  {
    word: 'ZAP!',
    tone: 'accent',
    alwaysVisible: false,
    tilt: 'group-hover:rotate-[1.5deg]',
    delay: '250ms',
    area: '',
  },
  {
    word: 'UAU!',
    tone: 'mustard',
    alwaysVisible: false,
    tilt: 'group-hover:-rotate-[1.5deg]',
    delay: '400ms',
    area: '',
  },
] as const

const frames = computed(() => {
  const picks = pickHeroProducts(props.products, FRAMES.length)
  return FRAMES.map((frame, index) => ({ ...frame, product: picks[index] ?? null }))
})
</script>

<template>
  <section aria-labelledby="hero-title" class="py-4 md:py-11">
    <div
      class="overflow-hidden rounded-panel border-3 border-ink bg-surface shadow-hq md:shadow-hq-lg"
    >
      <div class="md:grid md:grid-cols-2">
        <div
          class="flex flex-col items-center gap-2.5 px-4 pb-4.5 pt-5 text-center md:justify-center md:gap-6 md:px-10 md:py-12"
        >
          <p class="text-[10px] font-bold uppercase tracking-[.12em] text-accent md:text-xs">
            Estampas autorais<template v-if="total !== undefined"> · {{ total }} produtos</template>
          </p>
          <h1
            id="hero-title"
            class="font-display text-[30px] leading-[1.1] md:text-[clamp(40px,4.4vw,64px)] md:leading-[1.06]"
          >
            Arte de gente daqui,<br />
            <span
              class="mt-1.5 inline-block -rotate-[1.5deg] rounded-control border-2.5 border-ink bg-accent px-2.5 pb-1 text-surface shadow-hq-md md:mt-2.5 md:border-3 md:px-3.5 md:pb-1.5 md:shadow-hq"
            >
              no tecido!
            </span>
          </h1>
          <p class="max-w-sm text-sm text-ink-soft [text-wrap:balance] md:text-lg">
            Criações de artistas independentes brasileiros, de camisetas a moletons.
          </p>
          <button
            type="button"
            class="btn-hq-accent hidden md:inline-flex"
            data-test="hero-shop"
            @click="emit('shop')"
          >
            Ver camisetas →
          </button>
        </div>

        <div
          class="relative hidden min-h-[420px] grid-cols-[1.25fr_1fr] grid-rows-2 gap-4 px-9 pb-9 pt-8 md:grid"
        >
          <div
            v-for="(frame, index) in frames"
            :key="frame.word"
            class="group relative motion-safe:animate-pop"
            :class="frame.area"
            :style="{ animationDelay: frame.delay }"
          >
            <router-link
              v-if="frame.product"
              :to="{ name: 'product', params: { id: frame.product.id } }"
              class="absolute inset-0 overflow-hidden rounded-control border-3 border-ink bg-sand shadow-hq-frame transition-[transform,box-shadow] duration-200 group-hover:-translate-x-[3px] group-hover:-translate-y-[3px] group-hover:shadow-hq-hover focus-ring-lg"
              :class="frame.tilt"
            >
              <img
                :src="imageUrl(frame.product.image, index === 0 ? 700 : 400)"
                alt=""
                class="absolute inset-0 h-full w-full object-cover"
              />
              <span
                class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 border-t-3 border-ink bg-surface px-3 py-2"
              >
                <span class="truncate text-[13px] font-semibold">{{ frame.product.name }}</span>
                <span class="flex-none text-sm font-bold">
                  {{ formatPrice(frame.product.priceCents) }}
                </span>
              </span>
            </router-link>
            <span
              v-else
              class="absolute inset-0 rounded-control border-3 border-ink bg-sand shadow-hq-frame"
              aria-hidden="true"
            />
            <BurstSeal
              v-if="frame.product"
              :label="frame.word"
              :tone="frame.tone"
              :size="frame.alwaysVisible ? 'md' : 'sm'"
              class="pointer-events-none absolute z-10"
              :class="
                frame.alwaysVisible
                  ? '-right-5 -top-7 -rotate-[12deg] motion-safe:animate-stamp'
                  : '-right-4 -top-6 opacity-0 transition-opacity group-hover:opacity-100 motion-safe:group-hover:animate-zap'
              "
              data-test="hero-seal"
            />
          </div>
        </div>
      </div>

      <ul
        class="grid grid-cols-3 border-t-2.5 border-ink bg-mustard text-center md:border-t-3"
        aria-label="Sobre a loja"
      >
        <li
          v-for="(highlight, index) in HIGHLIGHTS"
          :key="highlight"
          class="flex items-center justify-center gap-2.5 px-1 py-2 text-[11px] font-bold leading-tight md:px-4 md:py-3.5 md:text-sm"
          :class="{ 'border-l-2.5 border-ink md:border-l-3': index > 0 }"
        >
          <span class="hidden md:inline" aria-hidden="true">✦</span>
          {{ highlight }}
        </li>
      </ul>
    </div>
  </section>
</template>
