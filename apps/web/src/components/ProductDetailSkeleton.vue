<template>
  <div
    class="grid grid-cols-1 items-start gap-5 md:grid-cols-[1.1fr_1fr] md:gap-12"
    aria-busy="true"
    data-test="loading"
  >
    <span class="sr-only" role="status">Carregando produto…</span>
    <div
      class="relative -mx-4 aspect-[4/3] overflow-hidden border-b-3 border-ink bg-sand md:mx-0 md:rounded-panel md:border-3 md:aspect-[4/5] md:shadow-hq-lg"
      aria-hidden="true"
    >
      <span
        class="absolute inset-0 bg-[linear-gradient(100deg,transparent_30%,rgba(255,255,255,.55)_50%,transparent_70%)] bg-[length:200%_100%] motion-safe:animate-shimmer"
      />
    </div>
    <div
      class="flex flex-col gap-4 md:rounded-panel md:border-3 md:border-ink md:bg-surface md:p-6 md:shadow-hq-lg"
      aria-hidden="true"
    >
      <div class="h-3 w-24 rounded-pill bg-skeleton" />
      <div class="h-10 w-4/5 rounded-pill bg-skeleton" />
      <div class="h-7 w-28 rounded-pill bg-skeleton" />
      <div class="h-24 rounded-panel bg-skeleton" />
      <div class="h-14 rounded-panel bg-skeleton" />
    </div>
  </div>
</template>
