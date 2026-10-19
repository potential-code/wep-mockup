import { timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

/**
 * HTTP Basic Auth for the dev and preview servers. One realm for every path, so the browser
 * asks once and reuses the credentials across the whole site (every dashboard).
 * Override with BASIC_AUTH_USER / BASIC_AUTH_PASS; BASIC_AUTH=off disables it.
 */
function basicAuth(): Plugin {
  const user = process.env.BASIC_AUTH_USER ?? 'admin'
  const pass = process.env.BASIC_AUTH_PASS ?? 'Potential'
  const expected = Buffer.from(`Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`)
  const middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const given = Buffer.from(req.headers.authorization ?? '')
    if (given.length === expected.length && timingSafeEqual(given, expected)) return next()
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="WEPs portal mockup", charset="UTF-8"')
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Authentication required')
  }
  return {
    name: 'basic-auth',
    apply: () => process.env.BASIC_AUTH !== 'off',
    configureServer: (server) => {
      server.middlewares.use(middleware)
    },
    configurePreviewServer: (server) => {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [
    basicAuth(),
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
