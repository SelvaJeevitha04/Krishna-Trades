import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy only used in local dev when no VITE_API_URL is set
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for security
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching on Vercel
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['@heroicons/react'],
        },
      },
    },
  },
}))
