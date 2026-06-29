import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 部署到 GitHub Pages (/deploy/),所以 base 用环境变量 PUBLIC_URL (CRA 兼容)
// 本地 dev 默认 '/'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.PUBLIC_URL || '/deploy/';

  return {
    base,
    plugins: [
      react({
        // CRA 习惯: 都是 .js 写 JSX
        include: '**/*.{js,jsx,ts,tsx}',
      }),
    ],
    server: {
      port: 3000,
      host: '127.0.0.1',
    },
    build: {
      outDir: 'build',
      // GitHub Pages 用,文件名带 hash
      assetsDir: 'static',
      sourcemap: false,
    },
    optimizeDeps: {
      // pre-bundle 这些以加速冷启动
      include: ['react', 'react-dom', 'wagmi', 'viem', '@rainbow-me/rainbowkit', 'antd', '@tanstack/react-query'],
    },
  };
});
