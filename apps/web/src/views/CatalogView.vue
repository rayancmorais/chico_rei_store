<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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
import ProductCard from '@/components/ProductCard.vue'
import ProductCardSkeleton from '@/components/ProductCardSkeleton.vue'
import FeedbackState from '@/components/FeedbackState.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import PaginationNav from '@/components/PaginationNav.vue'

// Um status só, em vez de booleans soltos, para "carregando e com erro" ser impossível.
type Status = 'loading' | 'success' | 'error'

const SKELETON_COUNT = 6

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
]

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
const showFilters = ref(false)

const activeFilterCount = computed(() => query.value.type.length + query.value.color.length)
const isRefreshing = computed(() => status.value === 'loading' && products.value.length > 0)

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

function clearFilters() {
  updateQuery({ type: [], color: [] })
}

function onSortChange(event: Event) {
  updateQuery({ sort: (event.target as HTMLSelectElement).value as ProductSort })
}

function changePage(page: number) {
  updateQuery({ page })
}

watch(query, load, { immediate: true })
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-stone-900">Loja</h1>
        <p class="mt-1 min-h-[1.25rem] text-sm text-stone-600" data-test="result-count">
          <template v-if="status === 'success'">
            {{ total }} {{ total === 1 ? 'produto' : 'produtos' }}
          </template>
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="rounded-full border border-stone-300 px-4 py-2 text-sm md:hidden"
          aria-controls="catalog-filters"
          :aria-expanded="showFilters ? 'true' : 'false'"
          data-test="toggle-filters"
          @click="showFilters = !showFilters"
        >
          Filtros<span v-if="activeFilterCount"> ({{ activeFilterCount }})</span>
        </button>
        <label class="flex items-center gap-2 text-sm text-stone-600">
          Ordenar por
          <select
            class="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
            :value="query.sort"
            data-test="sort"
            @change="onSortChange"
          >
            <option v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <div class="mt-6 md:grid md:grid-cols-[13rem_1fr] md:gap-8">
      <aside
        id="catalog-filters"
        aria-label="Filtros"
        class="mb-6 md:mb-0 md:block"
        :class="{ hidden: !showFilters }"
      >
        <FilterPanel
          v-if="filters"
          :filters="filters"
          :selected-types="query.type"
          :selected-colors="query.color"
          @toggle-type="toggleType"
          @toggle-color="toggleColor"
          @clear="clearFilters"
        />
      </aside>

      <section aria-label="Produtos">
        <div
          v-if="status === 'loading' && !isRefreshing"
          class="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3"
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
            activeFilterCount
              ? 'Nenhuma estampa com essa combinação.'
              : 'Nenhum produto encontrado.'
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
            class="grid grid-cols-2 gap-x-4 gap-y-8 transition-opacity lg:grid-cols-3"
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
            @change="changePage"
          />
        </template>
      </section>
    </div>
  </main>
</template>
