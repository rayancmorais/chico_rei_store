<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { imageUrl, type ImageCrop } from '@/utils/image'

const props = defineProps<{ image: string; name: string; code: string }>()

interface View {
  label: string
  crop?: ImageCrop
}

// A fonte tem uma foto por produto; os outros dois "ângulos" são recortes dela feitos pelo CDN.
const VIEWS: View[] = [
  { label: 'Peça inteira' },
  { label: 'Detalhe da estampa', crop: 'detail' },
  { label: 'Textura', crop: 'texture' },
]

const index = ref(0)
const current = computed(() => VIEWS[index.value]!)
const alt = computed(() =>
  index.value === 0 ? props.name : `${props.name}: ${current.value.label.toLowerCase()}`,
)

function show(next: number) {
  index.value = (next + VIEWS.length) % VIEWS.length
}

watch(
  () => props.image,
  () => {
    index.value = 0
  },
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      class="relative aspect-[4/5] overflow-hidden rounded-panel border-3 border-ink bg-sand shadow-hq md:shadow-hq-lg"
    >
      <img
        :key="index"
        :src="imageUrl(image, 800, current.crop)"
        :srcset="`${imageUrl(image, 600, current.crop)} 600w, ${imageUrl(image, 1200, current.crop)} 1200w`"
        sizes="(min-width: 768px) 50vw, 100vw"
        :alt="alt"
        width="800"
        height="1000"
        class="absolute inset-0 h-full w-full object-cover motion-safe:animate-pop"
        data-test="gallery-image"
      />
      <span
        class="pointer-events-none absolute bottom-0 right-0 h-[45%] w-[55%] bg-halftone bg-dots opacity-25 mix-blend-multiply [mask-image:linear-gradient(135deg,transparent_35%,#000)]"
        aria-hidden="true"
      />
      <span
        class="absolute left-3 top-3 rounded-chip border-2 border-ink bg-white px-2.5 py-1 text-xs font-bold"
      >
        Nº {{ code }}
      </span>
      <div class="absolute inset-x-3 bottom-3 flex items-center justify-between">
        <span
          class="rounded-chip border-2 border-ink bg-mustard px-2.5 py-1 text-xs font-bold"
          data-test="gallery-position"
        >
          <span class="sr-only">Imagem </span>{{ index + 1 }} / {{ VIEWS.length }}
        </span>
        <div class="flex gap-2">
          <button
            v-for="step in [-1, 1]"
            :key="step"
            type="button"
            class="size-11 rounded-control border-2.5 border-ink bg-white text-lg shadow-hq-md transition-[transform,box-shadow] duration-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-hq-press focus-ring"
            :aria-label="step < 0 ? 'Imagem anterior' : 'Próxima imagem'"
            :data-test="step < 0 ? 'gallery-prev' : 'gallery-next'"
            @click="show(index + step)"
          >
            <span aria-hidden="true">{{ step < 0 ? '←' : '→' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3 md:gap-3.5">
      <button
        v-for="(view, i) in VIEWS"
        :key="view.label"
        type="button"
        class="flex flex-col overflow-hidden rounded-control border-2.5 border-ink bg-white text-left transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 focus-ring"
        :class="i === index ? 'shadow-hq-accent' : 'shadow-hq-sm'"
        :aria-pressed="i === index ? 'true' : 'false'"
        :data-test="`gallery-thumb-${i}`"
        @click="show(i)"
      >
        <span class="block aspect-[4/3] w-full bg-sand" :class="{ 'opacity-60': i !== index }">
          <img
            :src="imageUrl(image, 300, view.crop)"
            alt=""
            width="300"
            height="225"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover"
          />
        </span>
        <span
          class="border-t-2.5 border-ink px-2 py-1.5 text-xs font-semibold"
          :class="i === index ? 'bg-[#FBE7B5]' : 'bg-white'"
        >
          {{ view.label }}
        </span>
      </button>
    </div>
  </div>
</template>
