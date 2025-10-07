import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/data': path.resolve(__dirname, './src/data'),
      '@/presentation': path.resolve(__dirname, './src/presentation'),
      '@/infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
})
