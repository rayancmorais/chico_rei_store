<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { imageUrl } from '@/utils/image'

const props = defineProps<{ image: string; name: string; code: string }>()

const ZOOM = 2
// As fotos da fonte têm 1800 px de largura: pedir mais ao CDN só aumentaria o arquivo, sem detalhe.
const ZOOM_SRCSET_WIDTHS = [1200, 1800]

// O toque no celular também dispara eventos de mouse. O zoom fica só para mouse de verdade; no
// celular vale o zoom de pinça do navegador.
const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)')
const canZoom = ref(finePointer?.matches ?? false)
const syncCanZoom = (event: MediaQueryListEvent) => (canZoom.value = event.matches)
finePointer?.addEventListener?.('change', syncCanZoom)

const zoomOn = ref(false)
const pointerInside = ref(false)
const origin = ref('50% 50%')
// A versão grande só é baixada quando o zoom é ligado pela primeira vez.
const wantsHiRes = ref(false)
const hiResLoaded = ref(false)

const zooming = computed(() => zoomOn.value && pointerInside.value)
const hiResSrcset = computed(() =>
  ZOOM_SRCSET_WIDTHS.map((width) => `${imageUrl(props.image, width)} ${width}w`).join(', '),
)
const zoomStyle = computed(() => ({
  transform: zooming.value ? `scale(${ZOOM})` : 'none',
  transformOrigin: origin.value,
}))

function followPointer(event: MouseEvent) {
  pointerInside.value = true
  const frame = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = ((event.clientX - frame.left) / frame.width) * 100
  const y = ((event.clientY - frame.top) / frame.height) * 100
  origin.value = `${x}% ${y}%`
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') zoomOn.value = false
}

// Esc vale com o foco em qualquer lugar da página, e não só no botão.
watch(zoomOn, (on) => {
  if (on) {
    wantsHiRes.value = true
    document.addEventListener('keydown', closeOnEscape)
  } else {
    document.removeEventListener('keydown', closeOnEscape)
  }
})

// Abrir um produto relacionado reaproveita este componente: a nova foto grande ainda não carregou.
watch(
  () => props.image,
  () => {
    hiResLoaded.value = false
    zoomOn.value = false
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', closeOnEscape)
  finePointer?.removeEventListener?.('change', syncCanZoom)
})
</script>

<template>
  <div
    class="relative aspect-[4/5] overflow-hidden rounded-panel border-3 border-ink bg-sand shadow-hq md:shadow-hq-lg"
    :class="{ 'cursor-zoom-in': zoomOn }"
    data-test="photo-frame"
    @mouseenter="followPointer"
    @mousemove="followPointer"
    @mouseleave="pointerInside = false"
  >
    <div
      class="absolute inset-0 transition-transform duration-200 ease-out motion-reduce:transition-none"
      :style="zoomStyle"
      data-test="photo-zoom"
    >
      <img
        :src="imageUrl(image, 800)"
        :srcset="`${imageUrl(image, 600)} 600w, ${imageUrl(image, 1200)} 1200w`"
        sizes="(min-width: 768px) 50vw, 100vw"
        :alt="name"
        width="800"
        height="1000"
        class="absolute inset-0 h-full w-full object-cover motion-safe:animate-pop"
        data-test="product-photo"
      />
      <!-- O dobro do `sizes` da foto principal, porque ela é exibida com zoom 2x. -->
      <img
        v-if="wantsHiRes"
        :srcset="hiResSrcset"
        sizes="(min-width: 768px) 100vw, 200vw"
        alt=""
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover"
        :class="hiResLoaded ? 'opacity-100' : 'opacity-0'"
        data-test="product-photo-hires"
        @load="hiResLoaded = true"
      />
    </div>
    <span
      class="pointer-events-none absolute bottom-0 right-0 h-[45%] w-[55%] bg-halftone bg-dots opacity-25 mix-blend-multiply [mask-image:linear-gradient(135deg,transparent_35%,black)]"
      aria-hidden="true"
    />
    <span
      class="absolute left-3 top-3 rounded-chip border-2 border-ink bg-white px-2.5 py-1 text-xs font-bold"
    >
      Nº {{ code }}
    </span>
    <button
      v-if="canZoom"
      type="button"
      class="absolute bottom-3 left-3 inline-flex h-11 items-center gap-2 rounded-control border-2.5 border-ink px-3.5 text-sm font-bold shadow-hq-md transition-[transform,box-shadow] duration-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-hq-press focus-ring"
      :class="zoomOn ? 'bg-mustard' : 'bg-white'"
      :aria-pressed="zoomOn ? 'true' : 'false'"
      data-test="zoom-toggle"
      @click="zoomOn = !zoomOn"
    >
      <svg
        class="size-4 flex-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      {{ zoomOn ? 'Sair do zoom' : 'Ampliar' }}
    </button>
  </div>
</template>
