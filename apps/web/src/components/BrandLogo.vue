<script setup lang="ts">
import { useRoute } from 'vue-router/composables'
import { opensInThisTab, scrollMotion } from '@/utils/scroll'

// Três quadros de HQ empilhados: "penca" é um monte, como estampas uma sobre a outra.
const FRAME =
  'absolute size-8 rounded-[5px] border-2 border-ink transition-transform duration-200 ease-[cubic-bezier(.3,1.6,.5,1)]'

const route = useRoute()

// O logo é o início da loja. Já no catálogo, o router não volta ao topo: em `/` ignora a navegação
// repetida, e com filtro só tira a query, mantendo a rolagem. Vindo de outra tela, o scrollBehavior
// do router já cuida disso. Ouvido na captura para ler a rota de antes do clique: o `router-link`
// navega no próprio clique, e a rota já seria o catálogo mesmo vindo de um produto.
function onClick(event: MouseEvent) {
  if (route.name === 'catalog' && opensInThisTab(event)) {
    window.scrollTo({ top: 0, behavior: scrollMotion() })
  }
}
</script>

<template>
  <router-link
    :to="{ name: 'catalog' }"
    class="group flex items-center gap-3 rounded-control focus-ring-lg"
    aria-label="Penca Store, página inicial"
    data-test="brand-logo"
    @click.native.capture="onClick"
  >
    <span class="relative block size-[42px] flex-none" aria-hidden="true">
      <span
        :class="FRAME"
        class="left-0 top-0 -rotate-[8deg] bg-mustard motion-safe:group-hover:-translate-x-[3px] motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:-rotate-[16deg]"
      />
      <span
        :class="FRAME"
        class="left-[5px] top-1 rotate-[4deg] bg-surface motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:rotate-[8deg]"
      />
      <!-- O padding de baixo compensa a serifa, que deixaria o "P" alto demais no quadro. -->
      <span
        :class="FRAME"
        class="left-2.5 top-[9px] flex items-center justify-center bg-accent pb-[3px] font-display text-xl leading-none text-surface motion-safe:group-hover:translate-x-px motion-safe:group-hover:-rotate-[3deg]"
      >
        P
      </span>
    </span>
    <span class="flex flex-col items-center leading-none">
      <span class="whitespace-nowrap font-display text-[17px] md:text-[22px]">Penca Store</span>
      <span class="mt-1 hidden text-[11px] text-muted md:block">armazém de estampas</span>
    </span>
  </router-link>
</template>
