<script setup lang="ts">
import { imageUrl } from '@/utils/image'

defineProps<{ image: string; name: string; code: string }>()
</script>

<template>
  <div
    class="relative aspect-[4/5] overflow-hidden rounded-panel border-3 border-ink bg-sand shadow-hq md:shadow-hq-lg"
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
    <span
      class="pointer-events-none absolute bottom-0 right-0 h-[45%] w-[55%] bg-halftone bg-dots opacity-25 mix-blend-multiply [mask-image:linear-gradient(135deg,transparent_35%,black)]"
      aria-hidden="true"
    />
    <span
      class="absolute left-3 top-3 rounded-chip border-2 border-ink bg-white px-2.5 py-1 text-xs font-bold"
    >
      Nº {{ code }}
    </span>
  </div>
</template>
