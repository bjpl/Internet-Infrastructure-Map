import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Internet-Infrastructure-Map/',

  // Development server configuration
  server: {
    port: 5173,
    open: true,

    // CORS proxy for API calls (development only)
    // Handles cross-origin requests to external APIs
    proxy: {
      // PeeringDB API proxy
      '/api/peeringdb': {
        target: 'https://api.peeringdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/peeringdb/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('PeeringDB proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying PeeringDB:', req.method, req.url);
          });
        }
      },

      // Cloudflare Radar API proxy
      '/api/cloudflare': {
        target: 'https://api.cloudflare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cloudflare/, '/client/v4/radar'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Cloudflare proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying Cloudflare:', req.method, req.url);
          });
        }
      },

      // TeleGeography submarine cable map proxy
      '/api/telegeography': {
        target: 'https://raw.githubusercontent.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/telegeography/, '/telegeography/www.submarinecablemap.com/master/web/public/api/v3'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('TeleGeography proxy error', err);
          });
        }
      }
    }
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,

    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-d3': ['d3'],
          'vendor-globe': ['globe.gl']
        }
      }
    }
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['three', 'globe.gl', 'd3']
  },

  // Environment variable prefix
  envPrefix: 'VITE_',

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});