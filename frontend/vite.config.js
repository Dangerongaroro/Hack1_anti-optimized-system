import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React関連
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // Three.js関連（大きなライブラリ）
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          // Supabase関連
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // Lucide React アイコン（大量のアイコン）
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // その他のnode_modules
          if (id.includes('node_modules')) {
            return 'vendor-other';
          }
          // アプリケーションコード
          if (id.includes('src/components/ExperienceStrings')) {
            return 'app-experience-strings';
          }
          if (id.includes('src/screens')) {
            return 'app-screens';
          }
          if (id.includes('src/services')) {
            return 'app-services';
          }
        },
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
