import DefaultTheme from 'vitepress/theme'
import StorygramMount from '../components/StorygramMount.vue'
import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('StorygramMount', StorygramMount)
  },
} satisfies Theme
