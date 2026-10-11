<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Product } from '@chico_rei_store/shared'
import { fetchProduct } from '@/services/api'
import { HttpError, isCancelled } from '@/services/http'
import { useCartStore } from '@/stores/cart'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { mediaFrom } from '@/config/breakpoints'
import { scrollMotion } from '@/utils/scroll'
import ColorSelector from '@/components/ColorSelector.vue'
import FeedbackState from '@/components/FeedbackState.vue'
import PriceTag from '@/components/PriceTag.vue'
import ProductBuyPanel from '@/components/ProductBuyPanel.vue'
import ProductDetailSkeleton from '@/components/ProductDetailSkeleton.vue'
import ProductPhoto from '@/components/ProductPhoto.vue'
import RelatedProducts from '@/components/RelatedProducts.vue'
import SizeSelector from '@/components/SizeSelector.vue'

const props = defineProps<{ id: string }>()

type Status = 'loading' | 'success' | 'error' | 'not-found'

const SHAKE_MS = 500
// Tempo do estado "adicionado" (selo BOA! e "Ver carrinho"): depois, o botão volta a "Adicionar".
const ADDED_STATE_MS = 3000

const cart = useCartStore()

const status = ref<Status>('loading')
const product = ref<Product | null>(null)
const selectedColorId = ref<string | null>(null)
const selectedSize = ref<string | null>(null)
const justAdded = ref(false)
// Só destaca o que falta depois que a pessoa tenta comprar; antes disso seria ruído na tela.
const triedToAdd = ref(false)
const shaking = ref(false)

// Do tablet para cima, foto e informações ficam lado a lado, num card; no celular, empilhadas e
// sem moldura. Decide só o que muda no DOM; o resto são classes responsivas.
const twoColumns = useMediaQuery(mediaFrom('md'))

const colorSelector = ref<InstanceType<typeof ColorSelector> | null>(null)
const sizeSelector = ref<InstanceType<typeof SizeSelector> | null>(null)

const selectedColor = computed(
  () => product.value?.colors.find((color) => color.id === selectedColorId.value) ?? null,
)
const needsSize = computed(() => (product.value?.sizes.length ?? 0) > 0)
const colorPending = computed(() => selectedColor.value === null)
const sizePending = computed(() => needsSize.value && selectedSize.value === null)
const canAddToCart = computed(() => !colorPending.value && !sizePending.value)
const chosenVariant = computed(() => {
  const color = selectedColor.value?.name ?? ''
  return needsSize.value && selectedSize.value ? `${color} · Tam. ${selectedSize.value}` : color
})
const choiceLine = computed(() => {
  if (colorPending.value && sizePending.value) return { ready: false, text: 'Falta cor e tamanho' }
  if (colorPending.value) return { ready: false, text: 'Falta a cor' }
  if (sizePending.value) return { ready: false, text: 'Falta o tamanho' }
  return { ready: true, text: chosenVariant.value }
})

const addedNotice = computed(() =>
  justAdded.value && product.value
    ? { name: product.value.name, detail: chosenVariant.value }
    : undefined,
)
let addedTimer: ReturnType<typeof setTimeout> | undefined
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
    if (isCancelled(error)) return
    status.value = error instanceof HttpError && error.status === 404 ? 'not-found' : 'error'
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

  // Rolagem explícita, e não a do foco: respeita o movimento reduzido e o `scroll-mt` do grupo, que
  // desconta o cabeçalho fixo. `nearest` não mexe na tela se o grupo já estiver visível.
  const firstPending = (colorPending.value ? colorSelector : sizeSelector).value
  const pendingGroup = firstPending?.$el as HTMLElement | undefined
  pendingGroup?.scrollIntoView({ block: 'nearest', behavior: scrollMotion() })
  firstPending?.focus({ preventScroll: true })
}

function addToCart() {
  if (!product.value || !selectedColor.value) return
  cart.add(product.value, {
    color: selectedColor.value,
    size: needsSize.value ? selectedSize.value : null,
  })
  // O carrinho não abre sozinho: quem quer continuar escolhendo não é interrompido nem tem o foco
  // levado para um diálogo que não abriu. O botão vira "Ver carrinho" e o contador do cabeçalho sobe.
  justAdded.value = true
  clearTimeout(addedTimer)
  addedTimer = setTimeout(() => {
    justAdded.value = false
  }, ADDED_STATE_MS)
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
watch(justAdded, (added) => {
  if (!added) clearTimeout(addedTimer)
})
onBeforeUnmount(() => {
  clearTimeout(shakeTimer)
  clearTimeout(addedTimer)
})
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 pb-24 md:px-12">
    <!-- No celular, o caminho vira o botão Voltar sobre a foto; sem foto (erro), ele continua. -->
    <nav
      v-if="twoColumns || status === 'error'"
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
      <!-- `grid-cols-1` (coluna `minmax(0, 1fr)`): sem ele, a coluna cresce até caber a linha de
      cores, que não quebra, e a página passa da largura do celular. -->
      <article
        class="grid grid-cols-1 items-start gap-3 md:grid-cols-[1.1fr_1fr] md:gap-12 lg:grid-cols-[auto_minmax(0,1fr)]"
        data-test="product"
      >
        <!-- No notebook, a foto inteira cabe na tela abaixo do cabeçalho e fica parada enquanto as
        informações rolam. A largura é limitada pela altura da tela para manter a proporção 4:5:
        7rem é o espaço do caminho de navegação acima da foto mais um respiro embaixo, e 37.5rem
        (600 px) é a largura que a coluna da foto já tinha antes desse limite. -->
        <ProductPhoto
          :image="product.image"
          :name="product.name"
          class="-mx-4 md:mx-0 lg:sticky lg:top-[calc(theme(spacing.header)+1.5rem)] lg:w-[min(calc((100vh-theme(spacing.header)-7rem)*0.8),37.5rem)]"
        >
          <router-link
            v-if="!twoColumns"
            :to="{ name: 'catalog' }"
            class="btn-hq-icon absolute left-3 top-3 bg-white text-lg"
            aria-label="Voltar para a loja"
            data-test="back-to-store"
          >
            <span aria-hidden="true">←</span>
          </router-link>
        </ProductPhoto>

        <!-- No tablet, quando a foto é mais alta que as informações, o painel acompanha a rolagem;
        no desktop quem fica parada é a foto, então o painel volta a rolar. -->
        <div
          class="flex flex-col md:sticky md:top-24 md:overflow-hidden md:rounded-panel md:border-3 md:border-ink md:bg-surface md:shadow-hq-lg lg:static"
        >
          <div
            v-if="twoColumns"
            class="flex items-center justify-between gap-3 border-b-3 border-ink bg-mustard px-5 py-3 md:px-7"
          >
            <span class="text-eyebrow uppercase">{{ product.type.label }}</span>
            <span class="text-xs font-semibold">Nº {{ product.id }}</span>
          </div>

          <div class="flex flex-col gap-2 md:gap-4 md:px-6 md:py-5">
            <div class="flex flex-col gap-1">
              <p
                v-if="!twoColumns"
                class="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.12em]"
                data-test="product-meta"
              >
                <span class="text-accent">{{ product.type.label }}</span>
                <span>Nº {{ product.id }}</span>
              </p>
              <div class="flex items-start justify-between gap-3">
                <h1
                  class="min-w-0 text-balance font-display text-[20px] leading-[1.15] tracking-[-0.02em] md:text-[28px]"
                >
                  {{ product.name }}
                </h1>
                <PriceTag :product="product" size="lg" class="flex-none whitespace-nowrap" />
              </div>
            </div>

            <ColorSelector
              ref="colorSelector"
              v-model="selectedColorId"
              :colors="product.colors"
              :pending="highlight.color"
              class="scroll-mt-[calc(theme(spacing.header)+1rem)]"
              :class="{ 'motion-safe:animate-shake': shaking && highlight.color }"
              data-test="color-selector"
            />
            <SizeSelector
              v-if="needsSize"
              ref="sizeSelector"
              v-model="selectedSize"
              :sizes="product.sizes"
              :pending="highlight.size"
              class="scroll-mt-[calc(theme(spacing.header)+1rem)]"
              :class="{ 'motion-safe:animate-shake': shaking && highlight.size }"
              data-test="size-selector"
            />

            <ProductBuyPanel
              :image="product.image"
              :price-cents="product.priceCents"
              :state="buttonState"
              :choice="choiceLine"
              :color-hex="selectedColor ? selectedColor.hex : undefined"
              :notice="addedNotice"
              @click="onPrimaryClick"
            />

            <!-- No celular, a descrição fica recolhida para não afastar o resto da página; aberta, é o
            mesmo bloco mostarda do desktop. -->
            <component
              :is="twoColumns ? 'section' : 'details'"
              :class="twoColumns ? 'relative mt-2' : 'group border-y-2 border-ink'"
              :aria-labelledby="twoColumns ? 'about-title' : undefined"
              data-test="about"
            >
              <h2
                v-if="twoColumns"
                id="about-title"
                class="absolute -top-3 left-3 rounded-[4px] border-2 border-ink bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
              >
                Sobre a peça
              </h2>
              <summary
                v-else
                class="flex h-13 cursor-pointer list-none items-center justify-between text-eyebrow uppercase focus-ring [&::-webkit-details-marker]:hidden"
              >
                Sobre a peça
                <span
                  class="text-2xl leading-none motion-safe:transition-transform group-open:rotate-45"
                  aria-hidden="true"
                  >+</span
                >
              </summary>
              <div
                class="rounded-[4px] border-2.5 border-ink bg-mustard px-4"
                :class="twoColumns ? 'pb-3.5 pt-4' : 'mb-3 py-3.5'"
              >
                <p class="text-pretty text-sm leading-relaxed">{{ product.description }}</p>
                <p v-if="wasEnriched" class="mt-3 text-xs" data-test="enriched-note">
                  A listagem da loja original não traz todos os dados deste produto; os que faltavam
                  (como tamanhos e descrição) foram gerados para a demonstração.
                </p>
              </div>
            </component>

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
