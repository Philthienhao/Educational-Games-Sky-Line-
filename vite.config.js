import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: ['es2015', 'safari12']
  },
  server: {
    port: 3000,
    host: true
  }
});
