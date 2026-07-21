import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.fbx'],
  server: {
    watch: {
      ignored: [
        '**/public/data/soccer-faces.json',
        '**/public/data/basketball-faces.json',
        '**/public/data/baseball-faces.json',
        '**/public/data/football-faces.json',
        '**/public/data/hockey-faces.json',
      ],
    },
    proxy: {
      '/duel': {
        target: 'ws://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
      '/live': {
        target: 'ws://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
