// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
     globals: true, 
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/**',   // <- não correr Playwright
      '**/e2e/**'
    ],
  },
});

