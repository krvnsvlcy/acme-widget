import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Forward API calls to the PHP dev server (apps/api).
    proxy: { '/api': 'http://localhost:8000' },
  },
})
