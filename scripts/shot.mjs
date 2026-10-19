// Usage: node scripts/shot.mjs <url-path> <out.png> [width] [persona-userId]
import { chromium } from 'playwright'
const [, , path = '/', out = 'shot.png', width = '1440', persona] = process.argv
const executablePath = process.env.CHROME ?? '/home/aliya/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell'
const browser = await chromium.launch({ executablePath })
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const base = process.env.BASE ?? 'http://localhost:5173'
const sep = path.includes('?') ? '&' : '?'
const target = persona ? `${path}${sep}demo-as=${persona}` : path
await page.goto(`${base}${target}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.screenshot({ path: out, fullPage: process.env.FULL === '1' })
if (errors.length) console.log('ERRORS:', errors.slice(0, 5).join('\n'))
await browser.close()
