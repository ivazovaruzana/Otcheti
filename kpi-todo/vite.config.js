import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/' для локальной разработки (npm run dev на localhost:5173),
// и путь внутри репозитория для сборки под GitHub Pages — сайт
// раздаётся из ветки main целиком, поэтому путь совпадает с
// расположением собранных файлов: kpi-todo/dist/.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Otcheti/kpi-todo/dist/' : '/',
  server: { port: 5173 },
}))
