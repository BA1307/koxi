import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        courses: path.resolve(__dirname, 'courses.html'),
        chemistry: path.resolve(__dirname, 'chemistry.html'),
        biology: path.resolve(__dirname, 'biology.html'),
        cbc: path.resolve(__dirname, 'cbc.html'),
        about: path.resolve(__dirname, 'about.html'),
        design: path.resolve(__dirname, 'design.html'),
        contact: path.resolve(__dirname, 'contact.html'),
        ai: path.resolve(__dirname, 'ai.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
