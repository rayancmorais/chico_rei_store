<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import axios from 'axios'
import type { Product } from '@chico_rei_store/shared'
import { fetchProduct } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import { useLatestRequest } from '@/composables/useLatestRequest'
import AddToCartButton from '@/components/AddToCartButton.vue'
import ColorSelector from '@/components/ColorSelector.vue'
import FeedbackState from '@/components/FeedbackState.vue'
import PriceTag from '@/components/PriceTag.vue'
import ProductDetailSkeleton from '@/components/ProductDetailSkeleton.vue'
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
  return undefined
})
const canAddToCart = computed(() => missingChoice.value === undefined)
const buttonState = computed(() => {
  if (!canAddToCart.value) return 'blocked'
  return justAdded.value ? 'added' : 'ready'
})
const wasEnriched = computed(() => {
  const enriched = product.value?.enriched
  return Boolean(enriched && (enriched.colors || enriched.sizes || enriched.description))
})

const highlight = computed(() => ({
  color: triedToAdd.value && colorPending.value,
  size: triedToAdd.value && sizePending.value,
}))

const request = useLatestRequest()
let shakeTimer: ReturnType<typeof setTimeout> | undefined

async function load() {
  const signal = request.start()
  status.value = 'loading'
  product.value = null
  resetSelection()

  try {
    const data = await fetchProduct(props.id, signal)
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

function resetSelection() {
  selectedColorId.value = null
  selectedSize.value = null
  justAdded.value = false
  triedToAdd.value = false
}

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
onBeforeUnmount(() => clearTimeout(shakeTimer))
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 pb-24 md:px-12">
    <nav
      aria-label="Navegação estrutural"
      class="flex items-center gap-2 py-4 text-sm font-semibold md:py-6"
    >
      <router-link
        :to="{ name: 'catalog' }"
        class="flex h-8 items-center gap-1.5 rounded-control border-2 border-ink bg-white px-3 shadow-hq-sm transition-transform hover:-translate-x-px hover:-translate-y-px focus-ring"
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

    <ProductDetailSkeleton v-if="status === 'loading'" />

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
              <PriceTag :product="product" size="lg" />
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

            <AddToCartButton
              :state="buttonState"
              :price-cents="product.priceCents"
              :missing-choice="missingChoice"
              @click="onPrimaryClick"
            />

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
                A listagem da loja original não traz todos os dados deste produto; os que faltavam
                (como tamanhos e descrição) foram gerados para a demonstração.
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
