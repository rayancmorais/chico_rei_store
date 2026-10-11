import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router/composables'
import { isNavigationFailure, NavigationFailureType } from 'vue-router'
import type { ProductSort } from '@chico_rei_store/shared'
import {
  parseCatalogQuery,
  toggleItem,
  toRouteQuery,
  type CatalogQuery,
} from '@/utils/catalog-query'

/**
 * Filtros, ordenação e página da listagem, lidos e escritos na URL. A URL é a fonte da verdade:
 * voltar, recarregar e compartilhar o link funcionam sem nenhum estado extra.
 */
export function useProductFilters() {
  const route = useRoute()
  const router = useRouter()

  const query = computed(() => parseCatalogQuery(route.query))
  const activeFilterCount = computed(() => query.value.type.length + query.value.color.length)

  /** Mudar qualquer filtro volta para a página 1; só a paginação informa a página. */
  function updateQuery(patch: Partial<CatalogQuery>, method: 'push' | 'replace' = 'push') {
    const next = { ...query.value, page: 1, ...patch }
    router[method]({ query: toRouteQuery(next) }).catch((failure: unknown) => {
      if (!isNavigationFailure(failure, NavigationFailureType.duplicated)) throw failure
    })
  }

  return {
    query,
    activeFilterCount,
    updateQuery,
    toggleType: (id: string) => updateQuery({ type: toggleItem(query.value.type, id) }),
    toggleColor: (id: string) => updateQuery({ color: toggleItem(query.value.color, id) }),
    clearTypes: () => updateQuery({ type: [] }),
    clearFilters: () => updateQuery({ type: [], color: [] }),
    changeSort: (sort: ProductSort) => updateQuery({ sort }),
    changePage: (page: number) => updateQuery({ page }),
  }
}
