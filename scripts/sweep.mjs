// Route sweep: every route as a suitable persona at 1440 and 390. Reports console errors,
// horizontal overflow, placeholders, access notices and error screens.
import { chromium } from 'playwright'
import { ROUTES } from './routes.mjs'

const executablePath =
  process.env.CHROME ??
  '/home/aliya/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell'
const base = process.env.BASE ?? 'http://localhost:5173'
const R = ROUTES
const browser = await chromium.launch({ executablePath })
const widths = (process.env.WIDTHS ?? '1440,390').split(',').map(Number)
let issues = 0
for (const width of widths) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    httpCredentials: { username: 'admin', password: 'Potential' },
  })
  for (const [path, persona] of R) {
    const page = await ctx.newPage()
    const errs = []
    page.on('pageerror', (e) => errs.push(e.message))
    page.on(
      'console',
      (m) =>
        m.type() === 'error' && !/favicon|Download the React/.test(m.text()) && errs.push(m.text()),
    )
    const url = `${base}${path}${persona ? `${path.includes('?') ? '&' : '?'}demo-as=${persona}` : ''}`
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
      await page.waitForTimeout(700)
      const r = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        text: document.body.innerText.slice(0, 4000),
      }))
      const flags = []
      if (r.overflow > 2) flags.push(`overflow+${r.overflow}px`)
      if (/Coming together shortly/.test(r.text)) flags.push('PLACEHOLDER')
      if (/Something went wrong/.test(r.text)) flags.push('ERROR-SCREEN')
      if (/don’t have access to this page/.test(r.text)) flags.push('access-denied')
      if (/Page not found/.test(r.text)) flags.push('404')
      if (errs.length) flags.push(`console: ${errs[0].slice(0, 160)}`)
      if (flags.length) {
        issues++
        console.log(`${width} ${path} [${persona ?? '-'}] -> ${flags.join(' | ')}`)
      }
    } catch (e) {
      issues++
      console.log(`${width} ${path} [${persona ?? '-'}] -> FAILED ${e.message.slice(0, 120)}`)
    }
    await page.close()
  }
  await ctx.close()
}
console.log(`done, ${issues} flagged`)
await browser.close()
