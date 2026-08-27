import { defineConfig } from 'vite';

// 验收真正的静态制品，不加载Vinext的SSR预览中间件。
export default defineConfig({
  build: { outDir: 'dist/client' },
  preview: { host: '127.0.0.1', port: 3000, strictPort: true },
});
