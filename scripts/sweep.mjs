// Route sweep: every route as a suitable persona at 1440 and 390. Reports console errors,
// horizontal overflow, placeholders, access notices and error screens.
import { chromium } from 'playwright'

const executablePath =
  process.env.CHROME ??
  '/home/aliya/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell'
const base = process.env.BASE ?? 'http://localhost:5173'
const R = [
  ['/', null],
  ['/about', null],
  ['/resources', null],
  ['/clinics', null],
  ['/directory', null],
  ['/join', null],
  ['/application-status', null],
  ['/sign-in', null],
  ['/forgot-password', null],
  ['/invite/ast-15-sato', null],
  ['/portal', 'u-leila'],
  ['/portal', 'u-nora'],
  ['/portal', 'u-maya'],
  ['/portal/company', 'u-leila'],
  ['/portal/company/details', 'u-nora'],
  ['/portal/company/team', 'u-nora'],
  ['/portal/company/permissions', 'u-leila'],
  ['/portal/company/activity', 'u-nora'],
  ['/portal/assessment', 'u-nora'],
  ['/portal/assessment/take', 'u-nora'],
  ['/portal/assessment/results', 'u-leila'],
  ['/portal/action-plan', 'u-nora'],
  ['/portal/action-plan', 'u-elena'],
  ['/portal/action-plan/act-1', 'u-leila'],
  ['/portal/learn', 'u-maya'],
  ['/portal/learn/catalogue', 'u-maya'],
  ['/portal/learn/crs-inclusive-recruitment', 'u-maya'],
  ['/portal/learn/crs-inclusive-recruitment/crs-inclusive-recruitment-l4', 'u-maya'],
  ['/portal/learn/crs-inclusive-recruitment/crs-inclusive-recruitment-quiz', 'u-maya'],
  ['/portal/resources', 'u-maya'],
  ['/portal/resources/res-transparency-roadmap', 'u-maya'],
  ['/portal/clinics', 'u-maya'],
  ['/portal/clinics/evt-inclusive-recruitment-clinic', 'u-maya'],
  ['/portal/clinics/evt-supplier-diversity-clinic', 'u-omar'],
  ['/portal/mentorship', 'u-omar'],
  ['/portal/mentorship/u-sofia', 'u-omar'],
  ['/portal/mentorship/book/u-sofia', 'u-omar'],
  ['/portal/mentorship/bookings', 'u-omar'],
  ['/portal/concierge', 'u-maya'],
  ['/portal/certification', 'u-leila'],
  ['/portal/certification/cert-leadership', 'u-leila'],
  ['/portal/certification/exam/cp-workplace', 'u-nora'],
  ['/portal/certification/credential/cp-business', 'u-leila'],
  ['/portal/certification', 'u-maya'],
  ['/portal/community', 'u-maya'],
  ['/portal/community/circle', 'u-maya'],
  ['/portal/community/circle', 'u-sofia'],
  ['/portal/community/marketplace', 'u-maya'],
  ['/portal/community/marketplace/submit', 'u-nora'],
  ['/portal/community/marketplace/mine', 'u-nora'],
  ['/portal/reports', 'u-nora'],
  ['/portal/reports/2026', 'u-nora'],
  ['/portal/reports/2025', 'u-leila'],
  ['/portal/points', 'u-omar'],
  ['/portal/notifications', 'u-maya'],
  ['/portal/profile', 'u-maya'],
  ['/expert', 'u-sofia'],
  ['/expert/calendar', 'u-sofia'],
  ['/expert/sessions/evt-inclusive-recruitment-clinic', 'u-sofia'],
  ['/expert/sessions/bk-3', 'u-sofia'],
  ['/expert/profile', 'u-sofia'],
  ['/expert/availability', 'u-sofia'],
  ['/admin/reporting', 'u-admin'],
  ['/admin/reporting/analytics', 'u-admin'],
  ['/admin/reporting/companies', 'u-admin'],
  ['/admin/reporting/companies/c-harbour', 'u-admin'],
  ['/admin/reporting/signatories', 'u-admin'],
  ['/admin/reporting/users', 'u-admin'],
  ['/admin/reporting/learning', 'u-admin'],
  ['/admin/reporting/mentorship', 'u-admin'],
  ['/admin/reporting/assessments', 'u-admin'],
  ['/admin/reporting/annual-reports', 'u-admin'],
  ['/admin/reporting/annual-reports/rep-harbour-2026', 'u-admin'],
  ['/admin/reporting/community', 'u-admin'],
  ['/admin/reporting/certification', 'u-admin'],
  ['/admin/reporting/report-builder', 'u-admin'],
  ['/admin/manage/applications', 'u-admin'],
  ['/admin/manage/applications/app-cedar', 'u-admin'],
  ['/admin/manage/companies', 'u-admin'],
  ['/admin/manage/users', 'u-admin'],
  ['/admin/manage/courses', 'u-admin'],
  ['/admin/manage/courses/crs-inclusive-recruitment', 'u-admin'],
  ['/admin/manage/resources', 'u-admin'],
  ['/admin/manage/events', 'u-admin'],
  ['/admin/manage/mentorship', 'u-admin'],
  ['/admin/manage/assessments', 'u-admin'],
  ['/admin/manage/reporting', 'u-admin'],
  ['/admin/manage/certifications', 'u-admin'],
  ['/admin/manage/community', 'u-admin'],
  ['/admin/manage/gamification', 'u-admin'],
  ['/admin/manage/communications', 'u-admin'],
  ['/admin/manage/ai', 'u-admin'],
  ['/admin/manage/settings', 'u-admin'],
  ['/admin/manage/audit', 'u-admin'],
  ['/portal', 'u-cedar-applicant'],
  ['/admin/reporting', 'u-maya'],
  ['/portal/company/permissions', 'u-maya'],
  ['/does-not-exist', null],
]
const browser = await chromium.launch({ executablePath })
const widths = (process.env.WIDTHS ?? '1440,390').split(',').map(Number)
let issues = 0
for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } })
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
