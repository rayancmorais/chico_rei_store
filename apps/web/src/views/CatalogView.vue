<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router/composables'
import { isNavigationFailure, NavigationFailureType } from 'vue-router'
import axios from 'axios'
import type { FiltersResponse, ProductSort, ProductSummary } from '@chico_rei_store/shared'
import { fetchFilters, fetchProducts } from '@/services/api'
import {
  parseCatalogQuery,
  toggleItem,
  toRouteQuery,
  type CatalogQuery,
} from '@/utils/catalog-query'
import CatalogHero from '@/components/CatalogHero.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductCardSkeleton from '@/components/ProductCardSkeleton.vue'
import FeedbackState from '@/components/FeedbackState.vue'
import FilterChip from '@/components/FilterChip.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import FilterSheet from '@/components/FilterSheet.vue'
import PaginationNav from '@/components/PaginationNav.vue'

// Um status só, em vez de booleans soltos, para "carregando e com erro" ser impossível.
type Status = 'loading' | 'success' | 'error'

const SKELETON_COUNT = 6

const route = useRoute()
const router = useRouter()

// A URL é a fonte da verdade dos filtros: voltar, recarregar e compartilhar o link funcionam sem
// nenhum estado extra.
const query = computed(() => parseCatalogQuery(route.query))

const status = ref<Status>('loading')
const products = ref<ProductSummary[]>([])
const filters = ref<FiltersResponse | null>(null)
const total = ref(0)
const totalPages = ref(0)
const pageSize = ref(0)
const showFilterSheet = ref(false)
const results = ref<HTMLElement | null>(null)

const activeFilterCount = computed(() => query.value.type.length + query.value.color.length)
const isRefreshing = computed(() => status.value === 'loading' && products.value.length > 0)
const showHero = computed(() => query.value.page === 1)

const resultTitle = computed(() => {
  const selected = query.value.type
  if (selected.length === 0) return 'Todas as peças'
  if (selected.length > 1) return 'Seleção'
  const label = filters.value?.types.find((type) => type.id === selected[0])?.label ?? 'Seleção'
  return /[ao]$/.test(label) ? `${label}s` : label
})

const activeChips = computed(() => {
  const types = filters.value?.types ?? []
  const colors = filters.value?.colors ?? []
  return [
    ...query.value.type.map((id) => ({
      key: `type-${id}`,
      label: types.find((type) => type.id === id)?.label ?? id,
      hex: null,
      remove: () => toggleType(id),
    })),
    ...query.value.color.map((id) => {
      const color = colors.find((option) => option.id === id)
      return {
        key: `color-${id}`,
        label: color?.name ?? id,
        hex: color?.hex ?? null,
        remove: () => toggleColor(id),
      }
    }),
  ]
})

let controller: AbortController | null = null

async function load() {
  // Cancela a busca anterior: se o usuário marcar dois filtros seguidos, a resposta mais lenta
  // não pode chegar depois e sobrescrever a mais nova.
  controller?.abort()
  const current = new AbortController()
  controller = current

  status.value = 'loading'
  const { type, color, page, sort } = query.value

  try {
    const [list, facets] = await Promise.all([
      fetchProducts({ type, color, page, sort }, current.signal),
      fetchFilters({ type, color }, current.signal),
    ])

    if (list.data.length === 0 && page > list.meta.totalPages && list.meta.totalPages > 0) {
      updateQuery({ page: list.meta.totalPages }, 'replace')
      return
    }

    products.value = list.data
    total.value = list.meta.total
    totalPages.value = list.meta.totalPages
    pageSize.value = list.meta.limit
    filters.value = facets
    status.value = 'success'
  } catch (error) {
    if (axios.isCancel(error)) return
    status.value = 'error'
  }
}

/** Mudar qualquer filtro volta para a página 1; só a paginação informa a página. */
function updateQuery(patch: Partial<CatalogQuery>, method: 'push' | 'replace' = 'push') {
  const next = { ...query.value, page: 1, ...patch }
  router[method]({ query: toRouteQuery(next) }).catch((failure: unknown) => {
    if (!isNavigationFailure(failure, NavigationFailureType.duplicated)) throw failure
  })
}

function toggleType(id: string) {
  updateQuery({ type: toggleItem(query.value.type, id) })
}

function toggleColor(id: string) {
  updateQuery({ color: toggleItem(query.value.color, id) })
}

function clearTypes() {
  updateQuery({ type: [] })
}

function clearFilters() {
  updateQuery({ type: [], color: [] })
}

function changeSort(sort: ProductSort) {
  updateQuery({ sort })
}

function changePage(page: number) {
  updateQuery({ page })
}

async function shopShirts() {
  updateQuery({ type: ['camiseta'], color: [] })
  await nextTick()
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  results.value?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

watch(query, load, { immediate: true })
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 pb-24 md:px-12">
    <CatalogHero
      v-if="showHero"
      :products="products.slice(0, 3)"
      :total="status === 'success' ? total : undefined"
      @shop="shopShirts"
    />

    <div
      class="sticky top-[69px] z-20 -mx-4 flex gap-2 overflow-x-auto border-b-2 border-ink bg-paper/95 px-4 pb-3 pt-2.5 backdrop-blur [scrollbar-width:none] md:hidden"
    >
      <button
        type="button"
        class="flex h-11 flex-none items-center gap-1.5 rounded-panel border-2 border-ink bg-mustard px-3.5 text-sm font-semibold shadow-[3px_3px_0_#2A1F17] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        aria-haspopup="dialog"
        :aria-expanded="showFilterSheet ? 'true' : 'false'"
        data-test="toggle-filters"
        @click="showFilterSheet = true"
      >
        Filtros
        <span
          v-if="activeFilterCount"
          class="inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-ink px-1 text-[11px] text-surface"
        >
          {{ activeFilterCount }}
        </span>
      </button>
      <template v-if="filters">
        <FilterChip label="Tudo" :pressed="query.type.length === 0" @click="clearTypes" />
        <FilterChip
          v-for="type in filters.types"
          :key="type.id"
          :label="type.label"
          :pressed="query.type.includes(type.id)"
          :disabled="type.count === 0 && !query.type.includes(type.id)"
          @click="toggleType(type.id)"
        />
      </template>
    </div>

    <FilterPanel
      v-if="filters"
      class="sticky top-[72px] z-20 mb-1 mt-6 hidden md:block"
      :filters="filters"
      :selected-types="query.type"
      :selected-colors="query.color"
      :sort="query.sort"
      @toggle-type="toggleType"
      @toggle-color="toggleColor"
      @clear-types="clearTypes"
      @change-sort="changeSort"
    />

    <section ref="results" aria-labelledby="results-title" class="scroll-mt-40">
      <div class="flex flex-wrap items-center justify-between gap-3 py-5 md:pb-6 md:pt-9">
        <div class="flex items-baseline gap-3">
          <component
            :is="showHero ? 'h2' : 'h1'"
            id="results-title"
            class="font-display text-title-sm md:text-title-md"
          >
            {{ resultTitle }}
          </component>
          <p class="min-h-[1.25rem] text-sm text-muted" data-test="result-count">
            <template v-if="status === 'success'">
              {{ total }} {{ total === 1 ? 'produto' : 'produtos' }}
            </template>
          </p>
        </div>

        <div v-if="activeChips.length" class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="chip in activeChips"
            :key="chip.key"
            type="button"
            class="flex h-[30px] items-center gap-2 rounded-control border-2 border-ink bg-accent pl-2.5 pr-1 text-[13px] font-medium text-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            :aria-label="`Remover filtro ${chip.label}`"
            @click="chip.remove"
          >
            <span
              v-if="chip.hex"
              class="h-3 w-3 rounded-pill ring-[1.5px] ring-surface"
              :style="{ backgroundColor: chip.hex }"
              aria-hidden="true"
            />
            {{ chip.label }}
            <span
              class="flex h-5 w-5 items-center justify-center rounded bg-ink text-[11px]"
              aria-hidden="true"
              >✕</span
            >
          </button>
          <button
            type="button"
            class="ml-1.5 text-[13px] font-semibold underline decoration-2 underline-offset-[3px]"
            data-test="clear-filters"
            @click="clearFilters"
          >
            Limpar
          </button>
        </div>
      </div>

      <div
        v-if="status === 'loading' && !isRefreshing"
        class="grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-7"
        aria-busy="true"
        data-test="loading"
      >
        <span class="sr-only" role="status">Carregando produtos…</span>
        <ProductCardSkeleton v-for="n in SKELETON_COUNT" :key="n" />
      </div>

      <FeedbackState
        v-else-if="status === 'error'"
        role="alert"
        seal="XIII!"
        seal-tone="accent"
        title="Não conseguimos carregar a vitrine."
        description="Pode ser a conexão. Seus filtros continuam salvos."
        data-test="error"
      >
        <button type="button" class="btn-hq-accent" data-test="retry" @click="load">
          Tentar de novo
        </button>
      </FeedbackState>

      <FeedbackState
        v-else-if="products.length === 0"
        role="status"
        seal="OPA!"
        :title="
          activeFilterCount ? 'Nenhuma estampa com essa combinação.' : 'Nenhum produto encontrado.'
        "
        :description="
          activeFilterCount ? 'Tente tirar um filtro ou escolher outra cor.' : undefined
        "
        data-test="empty"
      >
        <button
          v-if="activeFilterCount"
          type="button"
          class="btn-hq-accent"
          data-test="empty-clear-filters"
          @click="clearFilters"
        >
          Limpar filtros
        </button>
      </FeedbackState>

      <template v-else>
        <ul
          class="grid grid-cols-2 gap-3.5 transition-opacity md:grid-cols-3 md:gap-7"
          :class="{ 'opacity-50': isRefreshing }"
          :aria-busy="isRefreshing ? 'true' : 'false'"
          data-test="product-grid"
        >
          <li v-for="product in products" :key="product.id">
            <ProductCard :product="product" />
          </li>
        </ul>
        <PaginationNav
          v-if="totalPages > 1"
          :page="query.page"
          :total-pages="totalPages"
          :total="total"
          :page-size="pageSize"
          @change="changePage"
        />
      </template>
    </section>

    <FilterSheet
      v-if="filters"
      :open="showFilterSheet"
      :filters="filters"
      :selected-types="query.type"
      :selected-colors="query.color"
      :sort="query.sort"
      :total="total"
      @close="showFilterSheet = false"
      @toggle-type="toggleType"
      @toggle-color="toggleColor"
      @clear="clearFilters"
      @change-sort="changeSort"
    />
  </main>
</template>
