import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/duffel': {
          target: 'https://api.duffel.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/duffel/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.VITE_DUFFEL_ACCESS_TOKEN}`)
              proxyReq.setHeader('Duffel-Version', 'v2')
              proxyReq.setHeader('Accept', 'application/json')
            })
          },
        },
      },
    },
  }
})
