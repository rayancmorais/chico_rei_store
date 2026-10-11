<template>
  <div
    class="flex flex-col gap-3 rounded-control border-2.5 border-ink bg-surface p-[7px] shadow-hq md:p-3"
    aria-hidden="true"
  >
    <div class="relative aspect-[4/5] overflow-hidden rounded-[3px] border-2 border-ink bg-sand">
      <span
        class="absolute inset-0 bg-[linear-gradient(100deg,transparent_30%,rgba(247,242,233,.7)_50%,transparent_70%)] bg-[length:200%_100%] motion-safe:animate-shimmer"
      />
      <span class="absolute inset-0 bg-halftone bg-dots opacity-10" />
    </div>
    <span class="h-2.5 w-2/5 rounded-pill bg-skeleton" />
    <span class="h-3.5 w-[85%] rounded-pill bg-skeleton" />
    <span class="h-3.5 w-3/5 rounded-pill bg-skeleton" />
    <div class="flex justify-between border-t-2 border-ink pt-2">
      <span class="h-3.5 w-[70px] rounded-pill bg-skeleton" />
      <span class="h-3.5 w-[50px] rounded-pill bg-skeleton" />
    </div>
  </div>
</template>
