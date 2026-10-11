<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { mediaBelow, mediaFrom } from '@/config/breakpoints'
import { imageCornerUrl, imageUrl } from '@/utils/image'

const props = defineProps<{ image: string; name: string }>()

const ZOOM = 2
const PHONE = mediaBelow('md')
const PHOTO_SIZES = `${mediaFrom('md')} 50vw, 100vw`
// As fotos da fonte têm 1800 px de largura: pedir mais ao CDN só aumentaria o arquivo, sem detalhe.
const ZOOM_SRCSET_WIDTHS = [1200, 1800]

// Com mouse, o zoom ligado amplia ao passar o mouse e segue o cursor. No toque não há hover: ligado,
// a foto já amplia no centro, e arrastar o dedo escolhe o ponto. Por isso, só enquanto ele está
// ligado, o arrasto sobre a foto (`touch-none`) move o zoom em vez de rolar a página.
const hasMouse = useMediaQuery('(hover: hover) and (pointer: fine)')
const toggleButton = ref<HTMLButtonElement | null>(null)

const zoomOn = ref(false)
const pointerInside = ref(false)
const origin = ref('50% 50%')
// A versão grande só é baixada quando o zoom é ligado pela primeira vez.
const wantsHiRes = ref(false)
const hiResLoaded = ref(false)

const zooming = computed(() => zoomOn.value && (pointerInside.value || !hasMouse.value))
const hiResSrcset = (trim: boolean) =>
  ZOOM_SRCSET_WIDTHS.map((width) => `${imageUrl(props.image, width, { trim })} ${width}w`).join(
    ', ',
  )
// No celular, a moldura é mais larga que a foto: ela aparece inteira (sem cortar a peça) e a sobra
// ganha a cor do fundo da própria foto. A URL vai numa variável e o fundo só é aplicado abaixo do
// `md`: no desktop a foto cobre a moldura, e o navegador nem baixa a imagem do canto.
const cornerVariable = computed(() => {
  const corner = imageCornerUrl(props.image)
  return corner ? { '--photo-corner': `url("${corner}")` } : undefined
})
const zoomStyle = computed(() => ({
  transform: zooming.value ? `scale(${ZOOM})` : 'none',
  transformOrigin: origin.value,
}))

function followPointer(event: PointerEvent) {
  // O toque no próprio botão não escolhe ponto: o zoom recém-ligado começa no centro da foto.
  if (toggleButton.value?.contains(event.target as Node)) return
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
    origin.value = '50% 50%'
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
})
</script>

<template>
  <div
    class="relative aspect-[16/10] overflow-hidden bg-cover bg-center max-md:bg-[image:var(--photo-corner)] border-b-3 border-ink bg-sand md:rounded-panel md:border-3 md:aspect-[4/5] md:shadow-hq-lg"
    :class="{ 'cursor-zoom-in': zoomOn, 'touch-none': zoomOn && !hasMouse }"
    :style="cornerVariable"
    data-test="photo-frame"
    @pointerenter="followPointer"
    @pointermove="followPointer"
    @pointerleave="pointerInside = false"
  >
    <div
      class="absolute inset-0 transition-transform duration-200 ease-out motion-reduce:transition-none"
      :style="zoomStyle"
      data-test="photo-zoom"
    >
      <!-- No celular, a foto vem sem a margem de fundo, para a peça não ficar pequena na moldura. -->
      <picture>
        <source
          :media="PHONE"
          :srcset="`${imageUrl(image, 600, { trim: true })} 600w, ${imageUrl(image, 1200, { trim: true })} 1200w`"
          sizes="100vw"
        />
        <img
          :src="imageUrl(image, 800)"
          :srcset="`${imageUrl(image, 600)} 600w, ${imageUrl(image, 1200)} 1200w`"
          :sizes="PHOTO_SIZES"
          :alt="name"
          width="800"
          height="1000"
          class="absolute inset-0 h-full w-full object-contain motion-safe:animate-pop md:object-cover"
          data-test="product-photo"
        />
      </picture>
      <!-- O dobro do `sizes` da foto principal, porque ela é exibida com zoom 2x. -->
      <picture v-if="wantsHiRes">
        <source :media="PHONE" :srcset="hiResSrcset(true)" sizes="200vw" />
        <img
          :srcset="hiResSrcset(false)"
          sizes="100vw"
          alt=""
          decoding="async"
          class="absolute inset-0 h-full w-full object-contain md:object-cover"
          :class="hiResLoaded ? 'opacity-100' : 'opacity-0'"
          data-test="product-photo-hires"
          @load="hiResLoaded = true"
        />
      </picture>
    </div>
    <span
      class="pointer-events-none absolute bottom-0 right-0 h-[45%] w-[55%] bg-halftone bg-dots opacity-25 mix-blend-multiply [mask-image:linear-gradient(135deg,transparent_35%,black)]"
      aria-hidden="true"
    />
    <!-- No celular, no canto de cima (embaixo, a peça ocupa a foto); no desktop, embaixo. -->
    <button
      ref="toggleButton"
      type="button"
      class="btn-hq-icon absolute right-3 top-3 md:bottom-3 md:left-3 md:right-auto md:top-auto"
      :class="zoomOn ? 'bg-mustard' : 'bg-white'"
      aria-label="Ampliar foto"
      :aria-pressed="zoomOn ? 'true' : 'false'"
      data-test="zoom-toggle"
      @click="zoomOn = !zoomOn"
    >
      <svg
        class="size-5 flex-none"
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
    </button>
    <slot />
  </div>
</template>
