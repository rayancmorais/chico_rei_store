<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import axios from 'axios'
import type { Product } from '@chico_rei_store/shared'
import { fetchProduct } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'
import BurstSeal from '@/components/BurstSeal.vue'
import ColorSelector from '@/components/ColorSelector.vue'
import FeedbackState from '@/components/FeedbackState.vue'
import ProductGallery from '@/components/ProductGallery.vue'
import RelatedProducts from '@/components/RelatedProducts.vue'
import SizeSelector from '@/components/SizeSelector.vue'

const props = defineProps<{ id: string }>()

type Status = 'loading' | 'success' | 'error' | 'not-found'

const SHAKE_MS = 500

const cart = useCartStore()

const status = ref<Status>('loading')
const product = ref<Product | null>(null)
const selectedColorId = ref<string | null>(null)
const selectedSize = ref<string | null>(null)
const justAdded = ref(false)
// Só destaca o que falta depois que a pessoa tenta comprar; antes disso seria ruído na tela.
const triedToAdd = ref(false)
const shaking = ref(false)

const colorSelector = ref<InstanceType<typeof ColorSelector> | null>(null)
const sizeSelector = ref<InstanceType<typeof SizeSelector> | null>(null)

const selectedColor = computed(
  () => product.value?.colors.find((color) => color.id === selectedColorId.value) ?? null,
)
const needsSize = computed(() => (product.value?.sizes.length ?? 0) > 0)
const colorPending = computed(() => selectedColor.value === null)
const sizePending = computed(() => needsSize.value && selectedSize.value === null)
const missingChoice = computed(() => {
  if (colorPending.value && sizePending.value) return 'Escolha a cor e o tamanho'
  if (colorPending.value) return 'Escolha a cor'
  if (sizePending.value) return 'Escolha o tamanho'
  return null
})
const canAddToCart = computed(() => missingChoice.value === null)
const wasEnriched = computed(
  () =>
    product.value !== null && (product.value.enriched.sizes || product.value.enriched.description),
)

const highlight = computed(() => ({
  color: triedToAdd.value && colorPending.value,
  size: triedToAdd.value && sizePending.value,
}))

let controller: AbortController | null = null
let shakeTimer: ReturnType<typeof setTimeout> | undefined

async function load() {
  controller?.abort()
  const current = new AbortController()
  controller = current

  status.value = 'loading'
  product.value = null
  selectedColorId.value = null
  selectedSize.value = null
  justAdded.value = false
  triedToAdd.value = false

  try {
    const data = await fetchProduct(props.id, current.signal)
    product.value = data
    // Com uma opção só não há escolha a fazer; pedir o clique seria um passo inútil.
    if (data.colors.length === 1) selectedColorId.value = data.colors[0]!.id
    if (data.sizes.length === 1) selectedSize.value = data.sizes[0]!
    status.value = 'success'
  } catch (error) {
    if (axios.isCancel(error)) return
    status.value =
      axios.isAxiosError(error) && error.response?.status === 404 ? 'not-found' : 'error'
  }
}

// O botão bloqueado continua clicável (aria-disabled): o clique mostra o que falta e leva o
// foco até lá, em vez de não fazer nada como um `disabled` faria.
function pointToMissingChoice() {
  triedToAdd.value = true
  shaking.value = true
  clearTimeout(shakeTimer)
  shakeTimer = setTimeout(() => {
    shaking.value = false
  }, SHAKE_MS)

  const firstPending = colorPending.value ? colorSelector : sizeSelector
  firstPending.value?.focus()
}

function addToCart() {
  if (!product.value || !selectedColor.value) return
  cart.add(product.value, {
    color: selectedColor.value,
    size: needsSize.value ? selectedSize.value : null,
  })
  justAdded.value = true
  cart.open()
}

// Um botão só, que muda de estado: assim o foco volta para ele quando o carrinho fecha.
function onPrimaryClick() {
  if (justAdded.value) cart.open()
  else if (!canAddToCart.value) pointToMissingChoice()
  else addToCart()
}

// O Vue reaproveita esta view ao ir de um produto para outro: sem o watch no id, a tela
// continuaria mostrando o produto anterior.
watch(() => props.id, load, { immediate: true })
watch([selectedColorId, selectedSize], () => {
  justAdded.value = false
})
onBeforeUnmount(() => {
  controller?.abort()
  clearTimeout(shakeTimer)
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 pb-24 md:px-12">
    <nav
      aria-label="Navegação estrutural"
      class="flex items-center gap-2 py-4 text-sm font-semibold md:py-6"
    >
      <router-link
        :to="{ name: 'catalog' }"
        class="flex h-8 items-center gap-1.5 rounded-control border-2 border-ink bg-white px-3 shadow-hq-sm transition-transform hover:-translate-x-px hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <span aria-hidden="true">←</span> Loja
      </router-link>
      <template v-if="product">
        <span class="text-muted" aria-hidden="true">/</span>
        <router-link
          :to="{ name: 'catalog', query: { type: product.type.id } }"
          class="text-accent underline-offset-2 hover:underline"
        >
          {{ product.type.label }}
        </router-link>
      </template>
    </nav>

    <div
      v-if="status === 'loading'"
      class="grid items-start gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12"
      aria-busy="true"
      data-test="loading"
    >
      <span class="sr-only" role="status">Carregando produto…</span>
      <div
        class="relative aspect-[4/5] overflow-hidden rounded-panel border-3 border-ink bg-sand shadow-hq md:shadow-hq-lg"
        aria-hidden="true"
      >
        <span
          class="absolute inset-0 bg-[linear-gradient(100deg,transparent_30%,rgba(255,255,255,.55)_50%,transparent_70%)] bg-[length:200%_100%] motion-safe:animate-shimmer"
        />
      </div>
      <div
        class="flex flex-col gap-4 rounded-panel border-3 border-ink bg-surface p-6 shadow-hq md:shadow-hq-lg"
        aria-hidden="true"
      >
        <div class="h-3 w-24 rounded-pill bg-[#E0D4C1]" />
        <div class="h-10 w-4/5 rounded-pill bg-[#E0D4C1]" />
        <div class="h-7 w-28 rounded-pill bg-[#E0D4C1]" />
        <div class="h-24 rounded-panel bg-[#E0D4C1]" />
        <div class="h-14 rounded-panel bg-[#E0D4C1]" />
      </div>
    </div>

    <FeedbackState
      v-else-if="status === 'not-found'"
      role="status"
      seal="ZZZ…"
      title="Produto não encontrado."
      description="Essa estampa saiu de linha ou o link está errado. Que tal ver o que está na vitrine?"
      data-test="not-found"
    >
      <router-link :to="{ name: 'catalog' }" class="btn-hq-accent">Voltar para a loja</router-link>
    </FeedbackState>

    <FeedbackState
      v-else-if="status === 'error'"
      role="alert"
      seal="XIII!"
      seal-tone="accent"
      title="Não conseguimos carregar o produto."
      description="Pode ser a conexão. Tente de novo em instantes."
      data-test="error"
    >
      <button type="button" class="btn-hq-accent" data-test="retry" @click="load">
        Tentar de novo
      </button>
    </FeedbackState>

    <template v-else-if="product">
      <article
        class="grid items-start gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12"
        data-test="product"
      >
        <ProductGallery :image="product.image" :name="product.name" :code="product.id" />

        <div
          class="flex flex-col overflow-hidden rounded-panel border-3 border-ink bg-surface shadow-hq md:sticky md:top-24 md:shadow-hq-lg"
        >
          <div
            class="flex items-center justify-between gap-3 border-b-3 border-ink bg-mustard px-5 py-3 md:px-7"
          >
            <span class="text-eyebrow uppercase">{{ product.type.label }}</span>
            <span class="text-xs font-semibold">Nº {{ product.id }}</span>
          </div>

          <div class="flex flex-col gap-7 px-5 pb-7 pt-6 md:px-7">
            <div class="flex flex-col gap-3">
              <h1
                class="text-balance font-display text-[32px] leading-[1.06] tracking-[-0.02em] md:text-[40px]"
              >
                {{ product.name }}
              </h1>
              <p class="flex flex-wrap items-baseline gap-x-3" data-test="price">
                <span
                  v-if="product.originalPriceCents !== null"
                  class="text-lg text-muted line-through"
                >
                  <span class="sr-only">De</span> {{ formatPrice(product.originalPriceCents) }}
                </span>
                <span class="text-[30px] font-bold tracking-[-0.02em]">
                  <span v-if="product.originalPriceCents !== null" class="sr-only">por</span>
                  {{ formatPrice(product.priceCents) }}
                </span>
              </p>
            </div>

            <ColorSelector
              ref="colorSelector"
              v-model="selectedColorId"
              :colors="product.colors"
              :pending="highlight.color"
              :class="{ 'motion-safe:animate-shake': shaking && highlight.color }"
              data-test="color-selector"
            />
            <SizeSelector
              v-if="needsSize"
              ref="sizeSelector"
              v-model="selectedSize"
              :sizes="product.sizes"
              :pending="highlight.size"
              :class="{ 'motion-safe:animate-shake': shaking && highlight.size }"
              data-test="size-selector"
            />

            <div class="relative">
              <button
                type="button"
                class="flex w-full flex-col items-center justify-center gap-0.5 rounded-panel border-ink font-bold transition-[transform,box-shadow] duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                :class="
                  canAddToCart
                    ? [
                        'h-[58px] border-3 text-base text-surface shadow-hq hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#2A1F17] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#2A1F17]',
                        justAdded
                          ? 'bg-success motion-safe:animate-pop'
                          : 'bg-accent hover:bg-accent-hover',
                      ]
                    : 'h-[62px] cursor-not-allowed border-2.5 border-dashed bg-[#EDE4D5]'
                "
                :aria-disabled="canAddToCart ? undefined : 'true'"
                data-test="add-to-cart"
                @click="onPrimaryClick"
              >
                <template v-if="!canAddToCart">
                  <span class="text-[15px]">Adicionar ao carrinho</span>
                  <span class="text-sm font-semibold text-accent">
                    <span aria-hidden="true">↑ </span>
                    <span data-test="missing-choice">{{ missingChoice }}</span>
                  </span>
                </template>
                <template v-else-if="justAdded">
                  <span><span aria-hidden="true">✓ </span>Adicionado · Ver carrinho →</span>
                </template>
                <template v-else>
                  <span>Adicionar ao carrinho — {{ formatPrice(product.priceCents) }}</span>
                </template>
              </button>
              <!-- O wrapper posiciona: o BurstSeal já é `relative` e ganharia da classe `absolute`. -->
              <span
                v-if="justAdded"
                class="pointer-events-none absolute -right-3 -top-9 motion-safe:animate-zap md:-right-5"
              >
                <BurstSeal
                  v-if="justAdded"
                  label="BOA!"
                  size="sm"
                  class="pointer-events-none absolute -right-3 -top-9 motion-safe:animate-zap md:-right-5"
                />
              </span>
              <p class="sr-only" role="status" :data-test="justAdded ? 'added' : undefined">
                {{ justAdded ? 'Adicionado ao carrinho' : '' }}
              </p>
            </div>

            <section
              class="relative mt-2 rounded-[4px] border-2.5 border-ink bg-mustard px-4 pb-3.5 pt-4"
              aria-labelledby="about-title"
            >
              <h2
                id="about-title"
                class="absolute -top-3 left-3 rounded-[4px] border-2 border-ink bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
              >
                Sobre a peça
              </h2>
              <p class="text-pretty text-sm leading-relaxed">{{ product.description }}</p>
              <p v-if="wasEnriched" class="mt-3 text-xs" data-test="enriched-note">
                A listagem da loja original não informa tamanhos nem descrição; estes foram gerados
                para a demonstração.
              </p>
            </section>

            <a
              :href="product.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="self-start text-sm font-semibold underline decoration-2 underline-offset-[3px] hover:text-accent"
            >
              Ver na loja original<span class="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        </div>
      </article>

      <RelatedProducts :product-id="product.id" :type-id="product.type.id" />
    </template>
  </main>
</template>
