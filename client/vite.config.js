import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    // 定义 global 变量，使其指向 window
    global: 'window',
  },
});
