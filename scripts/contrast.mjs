// Text contrast audit: axe-core's color-contrast rule (WCAG AA) on every route.
// Scrolls each page first so scroll-triggered reveals reach their final colours.
// Usage: node scripts/contrast.mjs   (WIDTHS=1440,390  ONLY=/admin  BASE=http://localhost:5173)
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'
import { ROUTES } from './routes.mjs'

const require = createRequire(import.meta.url)
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const executablePath =
  process.env.CHROME ??
  '/home/aliya/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell'
const base = process.env.BASE ?? 'http://localhost:5173'
const only = process.env.ONLY
const widths = (process.env.WIDTHS ?? '1440').split(',').map(Number)
const browser = await chromium.launch({ executablePath })
let total = 0
for (const width of widths) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    httpCredentials: { username: 'admin', password: 'Potential' },
    reducedMotion: 'reduce',
  })
  for (const [path, persona] of ROUTES) {
    if (only && !path.startsWith(only)) continue
    const page = await ctx.newPage()
    const url = `${base}${path}${persona ? `${path.includes('?') ? '&' : '?'}demo-as=${persona}` : ''}`
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 120))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(900)
      await page.addScriptTag({ content: axeSource })
      const violations = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          runOnly: { type: 'rule', values: ['color-contrast'] },
        })
        return r.violations.flatMap((v) =>
          v.nodes.map((n) => {
            const d = n.any[0]?.data ?? {}
            return {
              target: n.target.join(' '),
              text: (document.querySelector(n.target[0])?.textContent ?? '').trim().slice(0, 50),
              ratio: d.contrastRatio,
              need: d.expectedContrastRatio,
              fg: d.fgColor,
              bg: d.bgColor,
            }
          }),
        )
      })
      if (violations.length) {
        total += violations.length
        console.log(`\n${width} ${path} [${persona ?? '-'}] ${violations.length} issue(s)`)
        for (const v of violations.slice(0, 12))
          console.log(
            `  ${v.ratio}:1 (need ${v.need}) ${v.fg} on ${v.bg} "${v.text}" ← ${v.target.slice(0, 110)}`,
          )
        if (violations.length > 12) console.log(`  …and ${violations.length - 12} more`)
      }
    } catch (e) {
      console.log(`${width} ${path} -> FAILED ${e.message.slice(0, 120)}`)
    }
    await page.close()
  }
  await ctx.close()
}
console.log(`\ndone, ${total} contrast issue(s)`)
await browser.close()
