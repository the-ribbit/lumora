import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 自定义域名根路径部署：https://enterlumora.top/
  // 旧地址 https://the-ribbit.github.io/lumora/ 会由 GitHub Pages 自动 301 到自定义域名
  base: '/',
})
