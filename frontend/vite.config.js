import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Helper to proxy API requests to Spring Boot while letting browser page navigation load index.html
const createApiProxy = () => ({
  target: 'http://localhost:8080',
  changeOrigin: true,
  bypass(req) {
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return '/index.html';
    }
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Required for some stompjs/sockjs-client builds in browser
    global: 'window',
  },
  server: {
    port: 5173,
    proxy: {
      '/login': createApiProxy(),
      '/register': createApiProxy(),
      '/test': createApiProxy(),
      '/auction': createApiProxy(),
      '/bid': createApiProxy(),
      '/dashboard': createApiProxy(),
      '/notification': createApiProxy(),
      '/watchlist': createApiProxy(),
      '/user': createApiProxy(),
      '/admin': createApiProxy(),
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
