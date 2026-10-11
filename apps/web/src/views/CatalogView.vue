<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { FiltersResponse, ProductListResponse, ProductSummary } from '@chico_rei_store/shared'
import { fetchFilters, fetchProducts } from '@/services/api'
import { isCancelled } from '@/services/http'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { useProductFilters } from '@/composables/useProductFilters'
import { DEFAULT_SORT, type CatalogQuery } from '@/utils/catalog-query'
import { pluralize, pluralTypeLabel } from '@/utils/format'
import ActiveFilters from '@/components/ActiveFilters.vue'
import CatalogHero from '@/components/CatalogHero.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductCardSkeleton from '@/components/ProductCardSkeleton.vue'
import FeedbackState from '@/components/FeedbackState.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import FilterSheet from '@/components/FilterSheet.vue'
import MobileFilterBar from '@/components/MobileFilterBar.vue'
import PaginationNav from '@/components/PaginationNav.vue'

// Um status só, em vez de booleans soltos, para "carregando e com erro" ser impossível.
type Status = 'loading' | 'success' | 'error'

const SKELETON_COUNT = 6

const {
  query,
  activeFilterCount,
  updateQuery,
  toggleType,
  toggleColor,
  clearTypes,
  clearFilters,
  changeSort,
  changePage,
} = useProductFilters()

const productsStatus = ref<Status>('loading')
const filtersFailed = ref(false)
// As duas buscas são separadas, mas a tela tem um estado só: falhar em qualquer uma é erro.
const status = computed<Status>(() => (filtersFailed.value ? 'error' : productsStatus.value))
const products = ref<ProductSummary[]>([])
const filters = ref<FiltersResponse | null>(null)
const total = ref(0)
const totalPages = ref(0)
const pageSize = ref(0)
const showFilterSheet = ref(false)
const results = ref<HTMLElement | null>(null)

const isRefreshing = computed(() => status.value === 'loading' && products.value.length > 0)

// O hero mostra a vitrine inteira, e não a busca atual: assim não muda a cada filtro e o total é
// sempre o da loja. Aberta sem filtro, a primeira página já serve; aberta filtrada, busca uma vez.
const heroProducts = ref<ProductSummary[]>([])
const heroTotal = ref<number>()
const heroSource = computed(() => (heroProducts.value.length ? heroProducts.value : products.value))
const heroRequest = useLatestRequest()

const isDefaultListing = ({ type, color, sort, page }: CatalogQuery) =>
  type.length === 0 && color.length === 0 && sort === DEFAULT_SORT && page === 1

function keepAsHero(list: ProductListResponse) {
  if (heroProducts.value.length) return
  heroProducts.value = list.data
  heroTotal.value = list.meta.total
}

async function loadHero() {
  try {
    keepAsHero(await fetchProducts({}, heroRequest.start()))
  } catch {
    // Complementar: sem esta busca, o hero usa os produtos já carregados e a listagem segue normal.
  }
}
const showHero = computed(() => query.value.page === 1)

const resultTitle = computed(() => {
  const selected = query.value.type
  if (selected.length === 0) return 'Todas as peças'
  if (selected.length > 1) return 'Seleção'
  const label = filters.value?.types.find((type) => type.id === selected[0])?.label ?? 'Seleção'
  return pluralTypeLabel(label)
})

const productsRequest = useLatestRequest()
const filtersRequest = useLatestRequest()

// As contagens dos filtros só dependem de tipo e cor: trocar de página ou de ordenação não as muda.
const facetKey = computed(() => `${query.value.type.join(',')}|${query.value.color.join(',')}`)

async function loadProducts() {
  const signal = productsRequest.start()
  productsStatus.value = 'loading'
  const { type, color, page, sort } = query.value

  try {
    const list = await fetchProducts({ type, color, page, sort }, signal)

    // Um link compartilhado pode apontar para uma página que deixou de existir (o catálogo mudou):
    // em vez de mostrar uma página vazia, vai para a última que tem produtos.
    if (list.data.length === 0 && page > list.meta.totalPages && list.meta.totalPages > 0) {
      updateQuery({ page: list.meta.totalPages }, 'replace')
      return
    }

    products.value = list.data
    total.value = list.meta.total
    if (isDefaultListing({ type, color, page, sort })) keepAsHero(list)
    totalPages.value = list.meta.totalPages
    pageSize.value = list.meta.limit
    productsStatus.value = 'success'
  } catch (error) {
    if (isCancelled(error)) return
    productsStatus.value = 'error'
  }
}

async function loadFilters() {
  const signal = filtersRequest.start()
  filtersFailed.value = false
  const { type, color } = query.value

  try {
    filters.value = await fetchFilters({ type, color }, signal)
  } catch (error) {
    if (isCancelled(error)) return
    filtersFailed.value = true
  }
}

function retry() {
  void loadProducts()
  void loadFilters()
}

async function shopShirts() {
  updateQuery({ type: ['camiseta'], color: [] })
  await nextTick()
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  results.value?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

watch(query, loadProducts, { immediate: true })
if (!isDefaultListing(query.value)) void loadHero()
watch(facetKey, loadFilters, { immediate: true })
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 pb-24 md:px-12">
    <CatalogHero v-if="showHero" :products="heroSource" :total="heroTotal" @shop="shopShirts" />

    <MobileFilterBar
      :types="filters ? filters.types : []"
      :selected-types="query.type"
      :active-filter-count="activeFilterCount"
      :sheet-open="showFilterSheet"
      @open-filters="showFilterSheet = true"
      @toggle-type="toggleType"
      @clear-types="clearTypes"
    />

    <FilterPanel
      v-if="filters"
      class="sticky top-[calc(theme(spacing.header)+3px)] z-20 mb-1 mt-6 hidden md:block"
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
              {{ pluralize(total, 'produto', 'produtos') }}
            </template>
          </p>
        </div>

        <ActiveFilters
          :types="filters ? filters.types : []"
          :colors="filters ? filters.colors : []"
          :selected-types="query.type"
          :selected-colors="query.color"
          @toggle-type="toggleType"
          @toggle-color="toggleColor"
          @clear="clearFilters"
        />
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
        <button type="button" class="btn-hq-accent" data-test="retry" @click="retry">
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
            <ProductCard :product="product" :heading-level="showHero ? 3 : 2" />
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
