import { defineConfig } from 'vitepress'
import path from 'path'

export default defineConfig({
  title: 'Storygram',
  description: 'Visualize sequential groupings in your data',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'npm', link: 'https://www.npmjs.com/package/storygram' },
      { text: 'GitHub', link: 'https://github.com/FranzFlueckiger/Storygram' },
    ],

    sidebar: [
      { text: 'Installation', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Importing Data', link: '/data-import' },
      { text: 'Filtering', link: '/filtering' },
      { text: 'Layout', link: '/layout' },
      { text: 'Advanced', link: '/advanced' },
      { text: 'Data Structure', link: '/data-structure' },
      { text: 'FAQ', link: '/faq' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/FranzFlueckiger/Storygram' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © Franz Flückiger, ZHaW',
    },
  },

  vite: {
    resolve: {
      alias: {
        // Use local source during docs dev/build — no need to publish first
        'storygram': path.resolve(__dirname, '../../src/index.ts'),
        'storygram/dist/Types': path.resolve(__dirname, '../../src/Types.ts'),
      },
    },
  },
})
