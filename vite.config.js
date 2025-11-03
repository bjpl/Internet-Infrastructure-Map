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
        timeout: 30000, // 30 second timeout
        rewrite: (path) => path.replace(/^\/api\/peeringdb/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            // Only log detailed errors in development
            if (process.env.NODE_ENV === 'development') {
              console.error('PeeringDB proxy error:', err.message);
            }
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy error occurred' }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Security: Remove sensitive headers
            proxyReq.removeHeader('cookie');

            // Only log in development
            if (process.env.NODE_ENV === 'development') {
              console.log('Proxying PeeringDB:', req.method, req.url);
            }
          });
        }
      },

      // Cloudflare Radar API proxy
      '/api/cloudflare': {
        target: 'https://api.cloudflare.com',
        changeOrigin: true,
        timeout: 30000,
        rewrite: (path) => path.replace(/^\/api\/cloudflare/, '/client/v4/radar'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            if (process.env.NODE_ENV === 'development') {
              console.error('Cloudflare proxy error:', err.message);
            }
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy error occurred' }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.removeHeader('cookie');

            if (process.env.NODE_ENV === 'development') {
              console.log('Proxying Cloudflare:', req.method, req.url);
            }
          });
        }
      },

      // TeleGeography submarine cable map proxy
      '/api/telegeography': {
        target: 'https://raw.githubusercontent.com',
        changeOrigin: true,
        timeout: 30000,
        rewrite: (path) => path.replace(/^\/api\/telegeography/, '/telegeography/www.submarinecablemap.com/master/web/public/api/v3'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            if (process.env.NODE_ENV === 'development') {
              console.error('TeleGeography proxy error:', err.message);
            }
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy error occurred' }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.removeHeader('cookie');

            if (process.env.NODE_ENV === 'development') {
              console.log('Proxying TeleGeography:', req.method, req.url);
            }
          });
        }
      }
    }
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Security: Disable source maps in production to protect source code
    // For error tracking, use 'hidden' source maps with services like Sentry
    sourcemap: process.env.NODE_ENV !== 'production',

    // Minification configuration
    minify: 'terser',
    terserOptions: {
      compress: {
        // Security: Remove console statements in production
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      },
      format: {
        // Remove comments in production build
        comments: false
      }
    },

    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-d3': ['d3'],
          'vendor-globe': ['globe.gl']
        },
        // Use content hashes for cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
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