import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署在 https://the-ribbit.github.io/lumora/ 子路径
  base: '/lumora/',
})
