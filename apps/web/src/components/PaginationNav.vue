<script setup lang="ts">
import { computed } from 'vue'
import { pageItems, rangeLabel } from '@/utils/pagination'

const props = defineProps<{ page: number; totalPages: number; total: number; pageSize: number }>()

const emit = defineEmits<{ (event: 'change', page: number): void }>()

const items = computed(() => pageItems(props.page, props.totalPages))
const range = computed(() => rangeLabel(props.page, props.pageSize, props.total))
</script>

<template>
  <nav aria-label="Paginação" class="flex flex-col items-center gap-3 pt-14">
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="h-[46px] rounded-control border-2.5 border-ink bg-white px-4 text-sm font-semibold text-ink shadow-hq-md transition-transform active:translate-x-0.5 active:translate-y-0.5 focus-ring disabled:cursor-not-allowed disabled:border-dashed disabled:border-line-strong disabled:bg-transparent disabled:text-muted disabled:shadow-none"
        :disabled="page <= 1"
        data-test="prev-page"
        @click="emit('change', page - 1)"
      >
        ← Anterior
      </button>

      <ol class="hidden items-center gap-2 md:flex">
        <li v-for="(item, index) in items" :key="`${item}-${index}`">
          <span v-if="item === 'gap'" class="px-1 text-muted" aria-hidden="true">…</span>
          <button
            v-else
            type="button"
            class="h-[46px] w-[46px] rounded-control border-2.5 border-ink text-[15px] font-bold focus-ring"
            :class="
              item === page
                ? 'bg-ink text-surface shadow-hq-accent'
                : 'bg-white text-ink shadow-hq-sm hover:-translate-x-0.5 hover:-translate-y-0.5'
            "
            :aria-label="`Página ${item}`"
            :aria-current="item === page ? 'page' : undefined"
            :data-test="`page-${item}`"
            @click="item !== page && emit('change', item)"
          >
            {{ item }}
          </button>
        </li>
      </ol>

      <p class="px-2.5 text-sm font-bold md:sr-only" data-test="page-status">
        Página {{ page }} de {{ totalPages }}
      </p>

      <button
        type="button"
        class="h-[46px] rounded-control border-2.5 border-ink bg-accent px-4 text-sm font-bold text-surface shadow-hq-md transition-transform active:translate-x-0.5 active:translate-y-0.5 focus-ring disabled:cursor-not-allowed disabled:border-dashed disabled:border-line-strong disabled:bg-transparent disabled:font-semibold disabled:text-muted disabled:shadow-none"
        :disabled="page >= totalPages"
        data-test="next-page"
        @click="emit('change', page + 1)"
      >
        Próxima →
      </button>
    </div>
    <p class="text-sm text-muted" data-test="page-range">{{ range }}</p>
  </nav>
</template>
