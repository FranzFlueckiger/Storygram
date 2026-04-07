import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: 'doc',
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'doc/preview.html'),
    },
  },
  resolve: {
    alias: {
      'storygram/dist/Types': path.resolve(__dirname, 'src/Types.ts'),
      'storygram': path.resolve(__dirname, 'src/index.ts'),
    },
  },
})
