<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router/composables'
import { useCartStore } from '@/stores/cart'
import { pluralize } from '@/utils/format'
import CartDrawer from '@/components/CartDrawer.vue'

const cart = useCartStore()
const route = useRoute()

const NAV_LINKS = [
  { label: 'Loja', type: undefined },
  { label: 'Camisetas', type: 'camiseta' },
  { label: 'Moletons', type: 'moletom' },
  { label: 'Papelaria', type: 'bottons,caderno,ima' },
] as const

const BADGE_BUMP_MS = 380

const cartLabel = computed(() => `Abrir carrinho, ${pluralize(cart.itemCount, 'item', 'itens')}`)

function isActive(type: string | undefined) {
  return route.name === 'catalog' && route.query.type === type
}

// O selo cresce por um instante quando a quantidade sobe: o retorno visual de "entrou no carrinho".
const badgeBump = ref(false)
let bumpTimer: ReturnType<typeof setTimeout> | undefined
watch(
  () => cart.itemCount,
  (count, previous) => {
    if (count <= previous) return
    badgeBump.value = true
    clearTimeout(bumpTimer)
    bumpTimer = setTimeout(() => (badgeBump.value = false), BADGE_BUMP_MS)
  },
)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-12">
        <router-link
          :to="{ name: 'catalog' }"
          class="flex items-center gap-3 rounded-control focus-ring-lg"
        >
          <span
            class="flex h-10 w-10 items-center justify-center rounded-pill bg-accent font-display text-[15px] text-surface"
            aria-hidden="true"
          >
            PS
          </span>
          <span class="flex flex-col leading-none">
            <span class="whitespace-nowrap font-display text-title-sm">Penca Store</span>
            <span class="mt-1 hidden text-[11px] text-muted md:block">armazém de estampas</span>
          </span>
        </router-link>

        <nav
          aria-label="Categorias"
          class="hidden gap-1.5 rounded-pill bg-sand p-1 text-sm md:flex"
        >
          <router-link
            v-for="link in NAV_LINKS"
            :key="link.label"
            :to="{ name: 'catalog', query: link.type ? { type: link.type } : {} }"
            class="rounded-pill px-4 py-2 text-[#5C4C3E] transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
            :class="{ 'bg-surface text-ink': isActive(link.type) }"
            :aria-current="isActive(link.type) ? 'page' : undefined"
          >
            {{ link.label }}
          </router-link>
        </nav>

        <button
          type="button"
          class="flex h-11 items-center gap-2.5 rounded-pill bg-ink pl-4.5 pr-2 text-sm text-surface transition-colors hover:bg-[#43342A] focus-ring"
          :aria-label="cartLabel"
          aria-haspopup="dialog"
          data-test="open-cart"
          @click="cart.open()"
        >
          Carrinho
          <span
            class="inline-flex h-[30px] min-w-[30px] items-center justify-center rounded-pill bg-accent px-1.5 text-xs font-semibold transition-transform duration-300"
            :class="badgeBump ? 'scale-[1.35]' : 'scale-100'"
            data-test="cart-count"
          >
            {{ cart.itemCount }}
          </span>
        </button>
      </div>
    </header>

    <div class="flex-1">
      <router-view />
    </div>

    <footer class="border-t border-line px-4 py-8 text-center text-xs text-muted md:px-12">
      <p class="mx-auto max-w-2xl">
        Penca Store é um projeto de teste técnico para a vaga de front-end da Chico Rei, sem vínculo
        oficial com a marca. Produtos e imagens de
        <a
          href="https://umapenca.com/loja/"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2 hover:text-ink"
          >umapenca.com<span class="sr-only"> (abre em nova aba)</span></a
        >.
      </p>
    </footer>

    <CartDrawer />
  </div>
</template>
