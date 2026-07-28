import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite always injects <script type="module"> for the entry, even when the
// bundle itself is built in iife format. A type="module" script is still
// blocked by CORS under file://, so strip the attributes for the static build.
function stripModuleScript() {
  return {
    name: 'strip-module-script',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace('<script type="module" crossorigin src=', '<script defer src=')
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), stripModuleScript()],
  server: {
    open: true,
  },
  resolve: {
    // lucide-react ships CJS + ESM without an "exports" map, so Vite could
    // otherwise hand it a second copy of React and every hook call would throw.
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'],
  },
  // Relative asset paths + a non-module (iife) bundle so dist/index.html can
  // be opened directly via file:// (double-click) without a local server.
  // ES module scripts are blocked by CORS under file://; a classic script isn't.
  // Dev keeps the default root base — absolute paths there resolve correctly
  // no matter which client-side route is active.
  base: command === 'build' ? './' : '/',
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'assets/[name].js',
      },
    },
  },
}))
