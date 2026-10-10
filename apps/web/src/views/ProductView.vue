<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import axios from 'axios'
import type { Product } from '@chico_rei_store/shared'
import { fetchProduct } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/format'
import { imageUrl } from '@/utils/image'
import ColorSelector from '@/components/ColorSelector.vue'
import SizeSelector from '@/components/SizeSelector.vue'
import FeedbackState from '@/components/FeedbackState.vue'

const props = defineProps<{ id: string }>()

type Status = 'loading' | 'success' | 'error' | 'not-found'

const cart = useCartStore()

const status = ref<Status>('loading')
const product = ref<Product | null>(null)
const selectedColorId = ref<string | null>(null)
const selectedSize = ref<string | null>(null)
const justAdded = ref(false)

const selectedColor = computed(
  () => product.value?.colors.find((color) => color.id === selectedColorId.value) ?? null,
)
const needsSize = computed(() => (product.value?.sizes.length ?? 0) > 0)
const missingChoice = computed(() => {
  const missingColor = selectedColor.value === null
  const missingSize = needsSize.value && selectedSize.value === null
  if (missingColor && missingSize) return 'Escolha a cor e o tamanho'
  if (missingColor) return 'Escolha a cor'
  if (missingSize) return 'Escolha o tamanho'
  return null
})
const canAddToCart = computed(() => missingChoice.value === null)
const wasEnriched = computed(
  () =>
    product.value !== null && (product.value.enriched.sizes || product.value.enriched.description),
)

let controller: AbortController | null = null

async function load() {
  controller?.abort()
  const current = new AbortController()
  controller = current

  status.value = 'loading'
  product.value = null
  selectedColorId.value = null
  selectedSize.value = null
  justAdded.value = false

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

function addToCart() {
  if (!product.value || !selectedColor.value || !canAddToCart.value) return
  cart.add(product.value, {
    color: selectedColor.value,
    size: needsSize.value ? selectedSize.value : null,
  })
  justAdded.value = true
  cart.open()
}

// O Vue reaproveita esta view ao ir de um produto para outro: sem o watch no id, a tela
// continuaria mostrando o produto anterior.
watch(() => props.id, load, { immediate: true })
watch([selectedColorId, selectedSize], () => {
  justAdded.value = false
})
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-6">
    <router-link
      :to="{ name: 'catalog' }"
      class="text-sm text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline"
    >
      ← Voltar para a loja
    </router-link>

    <div
      v-if="status === 'loading'"
      class="mt-6 grid gap-8 motion-safe:animate-pulse md:grid-cols-2"
      aria-busy="true"
      data-test="loading"
    >
      <span class="sr-only" role="status">Carregando produto…</span>
      <div class="aspect-square rounded-lg bg-stone-200" aria-hidden="true" />
      <div class="space-y-4" aria-hidden="true">
        <div class="h-4 w-24 rounded bg-stone-200" />
        <div class="h-8 w-3/4 rounded bg-stone-200" />
        <div class="h-6 w-28 rounded bg-stone-200" />
        <div class="h-24 rounded bg-stone-200" />
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

    <article v-else-if="product" class="mt-6 grid gap-8 md:grid-cols-2" data-test="product">
      <div class="aspect-square overflow-hidden rounded-lg bg-stone-100">
        <img
          :src="imageUrl(product.image, 800)"
          :srcset="`${imageUrl(product.image, 600)} 600w, ${imageUrl(product.image, 1200)} 1200w`"
          sizes="(min-width: 768px) 50vw, 100vw"
          :alt="product.name"
          width="800"
          height="800"
          class="h-full w-full object-contain"
        />
      </div>

      <div class="flex flex-col gap-6">
        <div>
          <p class="text-xs uppercase tracking-wide text-stone-500">{{ product.type.label }}</p>
          <h1 class="mt-1 text-2xl font-bold text-stone-900">{{ product.name }}</h1>
          <p class="mt-2 text-xl" data-test="price">
            <span
              v-if="product.originalPriceCents !== null"
              class="mr-2 text-base text-stone-400 line-through"
            >
              <span class="sr-only">De</span> {{ formatPrice(product.originalPriceCents) }}
            </span>
            <span class="font-semibold text-stone-900">
              <span v-if="product.originalPriceCents !== null" class="sr-only">por</span>
              {{ formatPrice(product.priceCents) }}
            </span>
          </p>
        </div>

        <ColorSelector v-model="selectedColorId" :colors="product.colors" />
        <SizeSelector
          v-if="needsSize"
          v-model="selectedSize"
          :sizes="product.sizes"
          data-test="size-selector"
        />

        <div>
          <button
            type="button"
            class="w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 md:w-auto"
            :disabled="!canAddToCart"
            :aria-describedby="missingChoice ? 'add-to-cart-hint' : undefined"
            data-test="add-to-cart"
            @click="addToCart"
          >
            Adicionar ao carrinho
          </button>
          <p
            v-if="missingChoice"
            id="add-to-cart-hint"
            class="mt-2 text-sm text-stone-600"
            data-test="missing-choice"
          >
            {{ missingChoice }}
          </p>
          <p
            v-else-if="justAdded"
            class="mt-2 text-sm font-medium text-green-700"
            role="status"
            data-test="added"
          >
            Adicionado ao carrinho
          </p>
        </div>

        <div class="border-t border-stone-200 pt-6">
          <h2 class="text-sm font-medium text-stone-900">Descrição</h2>
          <p class="mt-2 text-sm leading-relaxed text-stone-700">{{ product.description }}</p>
          <p v-if="wasEnriched" class="mt-4 text-xs text-stone-500" data-test="enriched-note">
            A listagem da loja original não informa tamanhos nem descrição; estes foram gerados para
            a demonstração.
          </p>
          <a
            :href="product.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2 inline-block text-xs text-stone-600 underline underline-offset-2 hover:text-stone-900"
          >
            Ver na loja original<span class="sr-only"> (abre em nova aba)</span>
          </a>
        </div>
      </div>
    </article>
  </main>
</template>
