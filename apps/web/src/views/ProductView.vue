<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <main class="product-page p-4">Produto {{ id }}</main>
</template>

<style lang="scss" scoped>
$ink: #1a1a1a;

.product-page {
  color: $ink;
}
</style>
