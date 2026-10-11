<script setup lang="ts">
withDefaults(
  defineProps<{ label: string; count?: number; pressed: boolean; disabled?: boolean }>(),
  { count: undefined, disabled: false },
)

const emit = defineEmits<{ (event: 'click'): void }>()
</script>

<template>
  <button
    type="button"
    class="flex h-11 flex-none items-center gap-2 rounded-panel border-2 border-ink pl-3.5 text-sm transition-[transform,box-shadow] duration-100 focus-ring md:h-[38px]"
    :class="[
      count === undefined ? 'pr-3.5' : 'pr-1.5',
      pressed
        ? 'bg-ink font-semibold text-surface shadow-hq-accent'
        : 'bg-white text-ink shadow-hq-sm',
      disabled
        ? 'cursor-not-allowed border-dashed opacity-50 shadow-none'
        : 'hover:-translate-x-0.5 hover:-translate-y-0.5',
    ]"
    :aria-pressed="pressed ? 'true' : 'false'"
    :disabled="disabled"
    @click="emit('click')"
  >
    {{ label }}
    <span
      v-if="count !== undefined"
      class="flex h-6 min-w-6 items-center justify-center rounded-pill px-1.5 text-[11px] font-semibold"
      :class="pressed ? 'bg-accent text-surface' : 'bg-sand text-ink'"
    >
      {{ count }}
    </span>
  </button>
</template>
