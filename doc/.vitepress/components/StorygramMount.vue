<template>
  <ClientOnly>
    <div class="storygram-demo">
      <div :id="uid" />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  data: any[]
  config: Record<string, any>
}>()

const uid = `sg-${Math.random().toString(36).slice(2, 7)}`
let sg: any = null

onMounted(async () => {
  // Dynamic import keeps d3/DOM code off the SSR path
  const { Storygram } = await import('storygram')
  sg = new Storygram(props.data, {
    ...props.config,
    root: `#${uid}`,
    tooltipPosition: 'static',
  })
  sg.draw()
})

onBeforeUnmount(() => {
  sg?.remove()
})
</script>

<style scoped>
.storygram-demo {
  margin: 1.5rem 0;
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
}
</style>
