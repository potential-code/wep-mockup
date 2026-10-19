import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    // Must run before the React plugin so generated route files are transformed.
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: path.resolve(root, 'src/routes'),
      generatedRouteTree: path.resolve(root, 'src/routeTree.gen.ts'),
      quoteStyle: 'single',
      semicolons: false,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
      '@shared': path.resolve(root, 'shared'),
    },
  },
  server: { port: 5173 },
  preview: { port: 5000 },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /\/node_modules\/(react|react-dom|scheduler)\//, priority: 4 },
            { name: 'tanstack', test: /\/node_modules\/@tanstack\//, priority: 3 },
            {
              name: 'motion',
              test: /\/node_modules\/(motion|framer-motion|gsap|lenis)\//,
              priority: 2,
            },
            { name: 'charts', test: /\/node_modules\/(recharts|d3-.*)\//, priority: 1 },
          ],
        },
      },
    },
  },
})
