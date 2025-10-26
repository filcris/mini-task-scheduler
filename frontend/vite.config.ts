import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // aceita ligações de rede (útil em Docker ou LAN)
    port: 5174,
    strictPort: true,    // falha se 5174 estiver ocupada (não muda de porta)
    proxy: {
      // Qualquer pedido que comece por /api é encaminhado para o backend
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        // se o backend já expõe /api, não precisamos reescrever
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  // útil para testes locais de build
  preview: {
    host: true,
    port: 5174,
    strictPort: true,
  },
  // aliases comuns (opcional)
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // build padrão (podes ajustar se precisares)
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
})




