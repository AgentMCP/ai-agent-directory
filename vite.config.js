import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'vendor': [
            'react', 
            'react-dom',
            'zod',
            '@hookform/resolvers',
            'react-hook-form'
          ]
        }
      }
    }
  },
  server: {
    port: 8080,
    host: true
  }
});
