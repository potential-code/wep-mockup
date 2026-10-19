// End-to-end run of the 8 required clickable walkthroughs (brief §27) plus the §26 number checks.
// Usage: node scripts/walkthroughs.mjs            (all)
//        ONLY=1,3 node scripts/walkthroughs.mjs  (subset; storage is still cleared first)
// One browser context for everything, so state carries across role switches like a presenter.
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:5173'
const OUT =
  process.env.OUT ??
  '/tmp/claude-1000/-home-aliya-Projects-wep-mockup/abb1935d-33d2-4d29-9fee-78727760f248/scratchpad/e2e'
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath:
    '/home/aliya/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell',
})
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
  httpCredentials: { username: 'admin', password: 'Potential' },
})
const page = await context.newPage()
page.setDefaultTimeout(8000)

/* --------------------------------------------------------------------- logging -- */
const consoleErrors = []
let currentWt = 'setup'
page.on('pageerror', (e) => consoleErrors.push(`[${currentWt}] pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error')
    consoleErrors.push(`[${currentWt}] console: ${m.text()} @ ${m.location()?.url ?? ''}`)
})
page.on('requestfailed', (r) => {
  if (!r.url().startsWith(BASE)) return
  consoleErrors.push(`[${currentWt}] requestfailed: ${r.url()} ${r.failure()?.errorText}`)
})

const results = [] // { wt, step, ok, reason }
let shotN = 0
const shot = async (name) => {
  const file = `${OUT}/${String(++shotN).padStart(2, '0')}-${currentWt}-${name}.png`
  await page.screenshot({ path: file }).catch(() => {})
  return file
}
class StepFail extends Error {}
const record = (step, ok, reason = '') => {
  results.push({ wt: currentWt, step, ok, reason })
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${step}${reason ? ` — ${reason}` : ''}`)
}
/** Run a step; a thrown error marks it FAIL and aborts the rest of the walkthrough. */
async function step(name, fn) {
  try {
    const reason = await fn()
    record(name, true, typeof reason === 'string' ? reason : '')
  } catch (e) {
    record(name, false, (e?.message ?? String(e)).split('\n')[0].slice(0, 220))
    await shot(`FAIL-${name.replace(/[^a-z0-9]+/gi, '_').slice(0, 40)}`)
    throw new StepFail(name)
  }
}
/** Soft assertion: records FAIL but lets the walkthrough continue. */
async function check(name, fn) {
  try {
    const reason = await fn()
    record(name, true, typeof reason === 'string' ? reason : '')
  } catch (e) {
    record(name, false, (e?.message ?? String(e)).split('\n')[0].slice(0, 220))
  }
}
const expectVisible = async (locator, what, timeout = 8000) => {
  try {
    await locator.first().waitFor({ state: 'visible', timeout })
  } catch {
    throw new Error(`not visible: ${what}`)
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg)
}

/* --------------------------------------------------------------------- helpers -- */
const settle = () => page.waitForTimeout(350) // mock db commit is debounced 50 ms
async function go(path, persona) {
  await settle()
  const sep = path.includes('?') ? '&' : '?'
  await page.goto(`${BASE}${path}${persona ? `${sep}demo-as=${persona}` : ''}`, {
    waitUntil: 'networkidle',
  })
  await page.waitForTimeout(400)
}
const main = () => page.locator('main main').first()
const btn = (name, opts = {}) => page.getByRole('button', { name, ...opts })
const link = (name, opts = {}) => page.getByRole('link', { name, ...opts })
const dialog = () => page.locator('[role=dialog],[role=alertdialog]').first()
const toastText = (re) => page.locator('[data-sonner-toast]').filter({ hasText: re })
async function pickOption(comboName, optionText, scope = page) {
  await scope.getByRole('combobox', { name: comboName }).click()
  await page.getByRole('option', { name: optionText }).first().click()
  await page
    .getByRole('listbox')
    .waitFor({ state: 'hidden' })
    .catch(() => {})
}
async function signOutViaMenu() {
  if (!(await page.getByRole('button', { name: /^Account menu for/ }).count())) return
  await page.getByRole('button', { name: /^Account menu for/ }).click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await page.waitForURL(/sign-in/)
  await settle()
}

async function walkthrough(n, title, fn) {
  if (ONLY && !ONLY.includes(n)) return
  currentWt = `W${n}`
  console.log(`\n=== Walkthrough ${n}: ${title}`)
  try {
    await fn()
  } catch (e) {
    if (!(e instanceof StepFail)) record('unexpected error', false, e.message.split('\n')[0])
    console.log('  (remaining steps of this walkthrough skipped)')
  }
}

/* ======================================================================= start == */
currentWt = 'W0'
console.log('=== Setup: clear storage')
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
record('localStorage cleared', (await page.evaluate(() => localStorage.length)) <= 1)

/* --------------------------------------------------------------- §26 numbers --- */
await walkthrough(0, 'Numbers on a fresh db (§26)', async () => {
  await go('/admin/reporting', 'u-admin')
  await check('Admin: 8 approved signatories', () =>
    expectVisible(link('Approved signatories: 8. Open records'), 'Approved signatories: 8'),
  )
  await check('Admin: 96 of 120 activated', async () => {
    await expectVisible(link('Activated users: 96. Open records'), 'Activated users: 96')
    await expectVisible(main().getByText('96 of 120 invited users'), '96 of 120 text')
  })
  await check('Admin: reporting completion 62.5% (5 of 8)', async () => {
    await expectVisible(link('Annual reporting completion: 62.5%. Open records'), '62.5%')
    await expectVisible(main().getByText('5 of 8 required 2026 reports accepted'), '5 of 8')
  })
  await shot('admin-exec-dashboard')
  await go('/portal', 'u-leila')
  await check('Leila: 18 of 24 activated', async () => {
    await expectVisible(link('Employees activated: 18. Open records'), 'Employees activated: 18')
    await expectVisible(main().getByText('of 24 invited · 75%'), 'of 24 invited · 75%')
  })
  await check('Leila: 12 of 18 completed path (67%)', async () => {
    await expectVisible(main().getByText(/12 of 18 activated employees/), '12 of 18')
    await expectVisible(link('Company learning completion: 67%. Open records'), '67%')
  })
  await shot('leila-dashboard')
})

/* ------------------------------------------------------------- 1 Application --- */
let appUrl = ''
let appRef = ''
await walkthrough(1, 'Application and clarification', async () => {
  await step('Visitor signs out and opens /join', async () => {
    await signOutViaMenu()
    await go('/join')
    await expectVisible(page.getByRole('heading', { name: /Commit your company/ }), 'join hero')
  })
  await step('Fill with sample company → review step', async () => {
    await btn(/Fill with sample company/)
      .first()
      .click()
    await expectVisible(btn(/Submit application/), 'Submit application button')
    await shot('join-review')
  })
  await step('Submit → reference shown', async () => {
    await btn(/Submit application/).click()
    const ref = page.getByText(/WEPS-2026-\d{4}/).first()
    await expectVisible(ref, 'application reference', 10000)
    appRef = (await ref.textContent()).match(/WEPS-2026-\d{4}/)[0]
    await shot('join-submitted')
    return appRef
  })
  await step('Admin opens the application', async () => {
    await go('/admin/manage/applications', 'u-admin')
    await page.getByRole('row', { name: new RegExp(appRef) }).click()
    await page.waitForURL(/\/admin\/manage\/applications\/app-/)
    appUrl = new URL(page.url()).pathname
    await expectVisible(page.getByRole('heading', { name: /Saffron Hospitality/ }), 'heading')
    return appUrl
  })
  await step('Admin requests a document', async () => {
    await btn('Request information').click()
    const d = dialog()
    await d.getByLabel('Missing item').fill('Current legal registration document')
    await d
      .getByLabel('Message to the applicant')
      .fill('The registration certificate you uploaded has expired. Please upload the current one.')
    await d.getByRole('button', { name: 'Send request' }).click()
    await expectVisible(d.getByText(/Action needed on your WEPs application/), 'email preview')
    await shot('admin-info-requested')
    await d.getByRole('button', { name: 'Done' }).click()
    await expectVisible(main().getByText('Information requested').first(), 'status badge')
  })
  await step('Visitor (signed out) sees the request on /application-status', async () => {
    await signOutViaMenu()
    await go('/application-status')
    await expectVisible(page.getByText('Current legal registration document').first(), 'request')
    await expectVisible(btn('Replace document and resubmit'), 'resubmit button')
    await shot('visitor-status-info-requested')
  })
  await step('Visitor replaces the document and resubmits', async () => {
    await btn('Use sample file').first().click()
    await expectVisible(page.getByText('Commercial_Registration_2026_current.pdf'), 'file chosen')
    await btn('Replace document and resubmit').click()
    await expectVisible(toastText(/Resubmitted/), 'Resubmitted toast')
    await shot('visitor-resubmitted')
  })
  await step('Admin approves and activates', async () => {
    await go(appUrl, 'u-admin')
    await expectVisible(main().getByText('Resubmitted').first(), 'Resubmitted status')
    await btn(/^Approve$/).click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Approve and activate' })
      .click()
    await page.waitForTimeout(2500)
    const err = await page.locator('[data-sonner-toast]').allTextContents()
    await page
      .getByRole('alertdialog')
      .waitFor({ state: 'hidden', timeout: 4000 })
      .catch(() => {
        throw new Error(
          `confirm dialog still open after 6.5s; toasts: ${err.join(' | ') || 'none'}`,
        )
      })
    await expectVisible(main().getByText('Approved', { exact: true }).first(), 'Approved status')
    await shot('admin-approved')
  })
  await check('Approved company appears in the applications list as Approved', async () => {
    await go('/admin/manage/applications', 'u-admin')
    const row = page.getByRole('row', { name: new RegExp(appRef) })
    await expectVisible(row, 'row')
    assert(/Approved/.test(await row.textContent()), `row says: ${await row.textContent()}`)
  })
})

/* -------------------------------------------------------------- 2 Delegation --- */
await walkthrough(2, 'Delegation and invitations', async () => {
  const stamp = Date.now().toString(36)
  const email = `priya.${stamp}@asteria-demo.com`
  await step('CEO appoints Elena as administrator with chosen permissions', async () => {
    await go('/portal/company/permissions', 'u-leila')
    await pickOption('Colleague', /Elena Martin/)
    const switches = main().getByRole('switch')
    const count = await switches.count()
    assert(count > 0, 'no permission switches')
    // turn on one more right than the default to show an explicit adjustment
    for (let i = 0; i < count; i++) {
      const s = switches.nth(i)
      if ((await s.getAttribute('aria-checked')) === 'false') {
        await s.click()
        break
      }
    }
    const summary = await main()
      .getByText(/rights selected/)
      .textContent()
    await btn('Review and grant').click()
    await dialog().getByRole('button', { name: 'Grant permissions' }).click()
    await expectVisible(toastText(/Elena Martin now holds/), 'grant toast')
    await shot('ceo-granted')
    return summary
  })
  await check('Elena is listed as an administrator', async () => {
    await expectVisible(
      page
        .getByRole('complementary')
        .getByText('Elena Martin')
        .or(main().getByText('Elena Martin')),
      'Elena in admin list',
    )
  })
  let inviteHref = ''
  await step('Nora invites an employee with a department', async () => {
    await go('/portal/company/team', 'u-nora')
    await btn('Invite user').click()
    const d = dialog()
    await d.getByLabel('First name').fill('Priya')
    await d.getByLabel('Last name').fill('Shah')
    await d.getByLabel('Work email').fill(email)
    await d.getByRole('combobox', { name: /Department/ }).click()
    await page.getByRole('option', { name: /Procurement/ }).click()
    await d.getByRole('button', { name: 'Send invitation' }).click()
    const open = d.getByRole('link', { name: /Open invitation/ })
    await expectVisible(open, 'Open invitation link')
    inviteHref = await open.getAttribute('href')
    await shot('nora-invited')
    return inviteHref
  })
  await step('Open the demo invitation link and accept', async () => {
    await dialog()
      .getByRole('link', { name: /Open invitation/ })
      .click()
    await page.waitForURL(/\/invite\//)
    await expectVisible(page.getByText(/Procurement/).first(), 'department shown on invitation')
    await page.getByLabel('Job title').fill('Category Manager')
    await shot('invitation')
    await btn('Accept invitation').click()
    await page.waitForURL((u) => u.pathname === '/portal', { timeout: 10000 })
  })
  await step('Lands on the employee dashboard as Priya', async () => {
    await page.waitForLoadState('networkidle')
    await expectVisible(
      page.getByRole('button', { name: 'Account menu for Priya Shah' }),
      'Priya signed in',
    )
    await expectVisible(page.getByRole('heading', { level: 1 }), 'dashboard heading')
    const h1 = await page.getByRole('heading', { level: 1 }).first().textContent()
    await shot('priya-dashboard')
    return `h1: ${h1}`
  })
})

/* ---------------------------------------------------------- 3 Learning unlock --- */
await walkthrough(3, 'Learning unlock', async () => {
  const lesson = '/portal/learn/crs-inclusive-recruitment/crs-inclusive-recruitment-l4'
  await step('Clinic is Locked before the lesson', async () => {
    await go('/portal/clinics/evt-inclusive-recruitment-clinic', 'u-maya')
    await expectVisible(main().getByText('Locked').first(), 'Locked badge')
    const elig = await page.getByRole('region', { name: 'Clinic eligibility' }).textContent()
    assert(/175\s*of\s*200/.test(elig), `eligibility panel: ${elig.slice(0, 160)}`)
  })
  let before = ''
  await step('Maya completes Lesson 4 → +25 points', async () => {
    await go(lesson, 'u-maya')
    before = await page.getByRole('link', { name: /redeemable points/ }).getAttribute('aria-label')
    await main()
      .getByRole('textbox')
      .first()
      .fill(
        'Senior buyer vacancy: shorten essential requirements and add the pay range. Track shortlist by gender.',
      )
    await btn('Mark complete (+25 pts)').click()
    await expectVisible(toastText(/25/), '+25 toast')
    await shot('lesson-complete')
    return `toast: ${(await toastText(/25/).first().textContent()).trim()}`
  })
  await step('Points ledger updates (620 → 645 redeemable)', async () => {
    await page.keyboard.press('Escape')
    await go('/portal/points', 'u-maya')
    const after = await page
      .getByRole('link', { name: /redeemable points/ })
      .getAttribute('aria-label')
    assert(/645/.test(after), `before "${before}", after "${after}"`)
    await expectVisible(
      main()
        .getByText('200 / 200')
        .or(main().getByText(/200\s*\/\s*200/)),
      'qualifying 200/200',
    )
    await page.getByRole('tab', { name: 'Points history' }).click()
    await expectVisible(
      main()
        .getByText(/Applying it to your next vacancy/)
        .first(),
      'ledger row',
    )
    await shot('points-ledger')
    return `${before} → ${after}`
  })
  await step('Clinic becomes Eligible → register', async () => {
    await go('/portal/clinics/evt-inclusive-recruitment-clinic', 'u-maya')
    await expectVisible(main().getByText('Eligible').first(), 'Eligible badge')
    await shot('clinic-eligible')
    await btn('Register for the clinic').click()
    await expectVisible(main().getByText('You are registered'), 'registered card')
    await shot('clinic-registered')
  })
  await check('Registration appears on the employee dashboard', async () => {
    await go('/portal', 'u-maya')
    await expectVisible(
      main()
        .getByText(/Inclusive Recruitment Clinic/)
        .first(),
      'clinic on dashboard',
    )
    await shot('maya-dashboard')
  })
  await check("Maya appears in Sofia's trainer roster", async () => {
    await go('/expert/sessions/evt-inclusive-recruitment-clinic', 'u-sofia')
    await expectVisible(main().getByText('Maya Chen'), 'Maya in roster')
    const summary = await main()
      .getByText(/registered ·/)
      .textContent()
    await shot('sofia-roster')
    return summary
  })
})

/* ---------------------------------------------------------------- 4 Mentoring --- */
await walkthrough(4, 'Mentoring redemption', async () => {
  let when = ''
  await step('Omar starts with 620 redeemable / 620 lifetime', async () => {
    await go('/portal/mentorship', 'u-omar')
    const region = page.getByRole('region', { name: 'Your points for mentoring' })
    await expectVisible(region.getByText('620', { exact: true }), '620 redeemable')
    await expectVisible(region.getByText('620 earned in total'), '620 lifetime')
  })
  await step('Choose Sofia, a slot (>24h away), purpose and confirm', async () => {
    await go('/portal/mentorship/book/u-sofia', 'u-omar')
    const days = main().getByRole('button', { name: /times available$/ })
    await expectVisible(days, 'day strip')
    const enabled = []
    for (let i = 0; i < (await days.count()); i++) {
      if (await days.nth(i).isEnabled()) enabled.push(days.nth(i))
    }
    assert(enabled.length >= 2, `only ${enabled.length} days with slots`)
    await enabled[1].click()
    const times = main()
      .locator('button[aria-pressed]')
      .filter({ hasText: /^\s*\d{1,2}:\d{2}/ })
    await times.first().click()
    when = `${await enabled[1].getAttribute('aria-label')} ${await times.first().textContent()}`
    await btn(/^Continue/).click()
    await page
      .getByLabel('Purpose of the session')
      .fill('Advice on baselining supplier ownership data for our tender process.')
    await btn(/^Continue/).click()
    await btn(/^Continue/).click()
    await shot('booking-confirm-step')
    await btn('Confirm and use 500 points').click()
    await expectVisible(
      page.getByRole('heading', { name: 'Booking confirmed' }),
      'Booking confirmed',
    )
    await shot('booking-confirmed')
    return when
  })
  await step('Balance 620 → 120 redeemable, lifetime stays 620', async () => {
    await go('/portal/mentorship', 'u-omar')
    const region = page.getByRole('region', { name: 'Your points for mentoring' })
    await expectVisible(region.getByText('120', { exact: true }), '120 redeemable')
    await expectVisible(region.getByText('620 earned in total'), '620 lifetime')
  })
  await check("Booking visible on Sofia's /expert/calendar", async () => {
    await go('/expert/calendar', 'u-sofia')
    const omar = main().getByText(/Omar Reed/)
    for (let i = 0; i < 4 && !(await omar.count()); i++) {
      const next = main().getByRole('button', { name: /Next/ })
      if (!(await next.count())) break
      await next.first().click()
      await page.waitForTimeout(300)
    }
    await expectVisible(omar, 'Omar Reed booking on calendar')
    await shot('sofia-calendar')
  })
  await step('Cancel shows the restoration rule and restores points', async () => {
    await go('/portal/mentorship/bookings', 'u-omar')
    await btn('Cancel booking').first().click()
    const d = page.getByRole('alertdialog').or(dialog())
    const rule = d.getByText(/points will (not )?be restored/)
    await expectVisible(rule, 'restoration rule text')
    const ruleText = await d.textContent()
    await shot('cancel-rule')
    await d.getByRole('button', { name: 'Cancel booking' }).click()
    await expectVisible(toastText(/Booking cancelled/), 'cancel toast')
    return ruleText.replace(/\s+/g, ' ').slice(0, 160)
  })
  await check('Points restored to 620 after cancellation', async () => {
    await go('/portal/mentorship', 'u-omar')
    const region = page.getByRole('region', { name: 'Your points for mentoring' })
    await expectVisible(region.getByText('620', { exact: true }), '620 redeemable')
  })
})

/* ------------------------------------------------------------ 5 Certification --- */
async function sitExam(answerIndex) {
  for (let q = 0; q < 30; q++) {
    const radios = main().getByRole('radio')
    await radios.nth(answerIndex).check()
    if (await btn('Review answers').count()) {
      await btn('Review answers').click()
      break
    }
    await btn(/^Next/).click()
  }
  await btn('Submit exam').click()
}
await walkthrough(5, 'Certification', async () => {
  await step(
    'Leila opens "Company Leadership and Accountability" ($1,200) and purchases',
    async () => {
      await go('/portal/certification', 'u-leila')
      await main()
        .getByRole('article')
        .filter({ hasText: 'Company Leadership and Accountability' })
        .getByRole('link', { name: 'View details' })
        .click()
      await expectVisible(main().getByText('$1,200').first(), '$1,200')
      await btn('Purchase for company').click()
      await page.waitForURL(/checkout/)
      await expectVisible(btn(/^Pay \$1,200/), 'Pay button')
    },
  )
  await step('Demo cancelled checkout → nothing charged', async () => {
    await btn('Cancel checkout').click()
    await expectVisible(page.getByRole('heading', { name: 'Checkout cancelled' }), 'cancelled')
    await shot('checkout-cancelled')
    await btn('Try payment again').click()
  })
  await step('Demo checkout succeeds', async () => {
    await btn(/^Pay \$1,200/).click()
    await expectVisible(
      page.getByRole('heading', { name: 'Payment confirmed (demo)' }),
      'confirmed',
      10000,
    )
    await shot('checkout-success')
    await btn('Start exam').click()
    await page.waitForURL(/\/exam\//)
  })
  await step('Exam (option index 1 each time) → passed', async () => {
    await sitExam(1)
    await expectVisible(page.getByRole('heading', { name: 'You passed' }), 'You passed', 10000)
    await shot('exam-passed')
  })
  await step('Credential issued', async () => {
    await link('View credential').click()
    await page.waitForURL(/\/credential\//)
    await expectVisible(
      main()
        .getByText(/Company Leadership and Accountability/)
        .first(),
      'credential',
    )
    await shot('credential')
  })
  await step('Failed exam on another offering (Inclusive Workplace Practices)', async () => {
    await go('/portal/certification/cert-workplace', 'u-leila')
    await link(/Start exam|Continue exam|Retry exam/).click()
    await page.waitForURL(/\/exam\//)
    await sitExam(0)
    await expectVisible(
      page.getByRole('heading', { name: 'Not passed yet' }),
      'Not passed yet',
      10000,
    )
    await expectVisible(btn('Retry exam'), 'Retry exam')
    await shot('exam-failed')
  })
})

/* ------------------------------------------------------ 6 Community & listing --- */
await walkthrough(6, 'Community and listing', async () => {
  const listingTitle = `Inclusive Interview Panel Training ${Date.now().toString(36)}`
  await step('Maya posts a question in Discussions', async () => {
    await go('/portal/community', 'u-maya')
    await btn('Create post').click()
    const d = dialog()
    await d
      .getByLabel('Title')
      .fill('How do we structure a fair shortlist for a senior hiring round?')
    await d
      .getByLabel('Details')
      .fill(
        'We are hiring a senior buyer next month. What is a good way to set criteria before we see CVs?',
      )
    await d.getByRole('button', { name: 'Publish post' }).click()
    await expectVisible(page.getByRole('region', { name: 'Your new post' }), 'post confirmation')
  })
  await step('AI reply appears', async () => {
    const region = page.getByRole('region', { name: 'Your new post' })
    await expectVisible(
      region.getByText(/Structured, criteria-based shortlisting/),
      'AI reply',
      8000,
    )
    await shot('ai-reply')
  })
  await step('Sofia: Signatory Circle is restricted', async () => {
    await go('/portal/community/circle', 'u-sofia')
    await expectVisible(main().getByText('Signatory Circle is restricted'), 'restricted notice')
    await shot('circle-restricted')
  })
  await step('Nora submits a service listing', async () => {
    await go('/portal/community/marketplace/submit', 'u-nora')
    await page.getByLabel('Title', { exact: true }).fill(listingTitle)
    await page
      .getByLabel('Description')
      .fill(
        'Half-day workshop that trains interview panels to use structured, criteria-based scoring.',
      )
    await page
      .getByLabel('Proposed value')
      .fill('Panels apply consistent criteria; shortlist balance is tracked.')
    await page.getByLabel('Provider purchase URL').fill('https://asteria-demo.example.com/training')
    await shot('listing-form')
    await btn('Submit for review').click()
    await page.waitForURL(/marketplace\/mine/)
    await expectVisible(main().getByText(listingTitle), 'listing in My listings')
  })
  await step('Admin approves it in /admin/manage/community', async () => {
    await go('/admin/manage/community', 'u-admin')
    const tab = page.getByRole('tab', { name: /Listings review/ })
    if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click()
    const queue = page.getByRole('table', { name: 'Review queue' })
    await queue
      .getByRole('row', { name: new RegExp(listingTitle) })
      .getByRole('button', { name: 'Review' })
      .click()
    await btn('Approve and publish').click()
    await expectVisible(toastText(/Approved and published/), 'approve toast')
    await shot('listing-approved')
  })
  await step('Listing appears in marketplace with "Visit provider" link', async () => {
    await go('/portal/community/marketplace', 'u-maya')
    await main()
      .getByRole('link', { name: new RegExp(listingTitle) })
      .first()
      .click()
    await page.waitForURL(/marketplace\/(?!mine|submit)/)
    const visit = btn(/Visit provider/)
    await expectVisible(visit, 'Visit provider button')
    await shot('listing-detail')
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 5000 }),
      visit.click(),
    ])
    await popup.waitForURL(/^http/, { timeout: 5000 }).catch(() => {})
    await popup.waitForURL(/^http/, { timeout: 5000 }).catch(() => {})
    const url = popup.url()
    await popup.close().catch(() => {})
    return `popup → ${url}`
  })
})

/* ----------------------------------------------------------- 7 Annual report --- */
async function completeSection(navName, text) {
  await main()
    .getByRole('complementary', { name: 'Report sections' })
    .getByRole('button', { name: navName })
    .click()
  const box = main().getByRole('textbox').first()
  await box.fill(text)
  const sw = main().getByRole('switch', { name: /Mark section complete/ })
  if ((await sw.getAttribute('aria-checked')) !== 'true') await sw.click()
  await page.waitForTimeout(600)
}
await walkthrough(7, 'Annual report', async () => {
  await step('Nora completes sections 5–7 incl. indicators and evidence', async () => {
    await go('/portal/reports/2026', 'u-nora')
    await completeSection(
      /5\. Principle-related progress/,
      'Progress across Principles 2, 4 and 5 is summarised with links to evidence.',
    )
    // Indicators and evidence
    await main()
      .getByRole('complementary', { name: 'Report sections' })
      .getByRole('button', { name: /6\. Indicators and evidence/ })
      .click()
    await main()
      .getByLabel('Method notes and context (optional)')
      .fill('Headcount at 30 Sept 2026; spend FY2025.')
    const save = btn('Save indicators')
    if (await save.isEnabled()) await save.click()
    await main().getByRole('button', { name: 'Use sample file' }).click()
    await expectVisible(toastText(/attached/), 'evidence attached toast')
    const sw = main().getByRole('switch', { name: /Mark section complete/ })
    if ((await sw.getAttribute('aria-checked')) !== 'true') await sw.click()
    await page.waitForTimeout(600)
    await completeSection(
      /7\. Challenges and next-year priorities/,
      'Supplier data quality remains the main challenge; 2027 priority is verification.',
    )
    await shot('report-sections-done')
    await expectVisible(
      main().getByText(/7 of 8 complete|8 of 8 complete/),
      'sections complete count',
    )
  })
  await step('Nora requests CEO approval', async () => {
    await btn('Request CEO approval').click()
    await expectVisible(toastText(/Sent to the CEO/), 'approval toast')
  })
  await step('Leila submits (version 1)', async () => {
    await go('/portal/reports/2026', 'u-leila')
    await btn('Review and submit').click()
    await dialog()
      .getByLabel(/I confirm the declaration/)
      .click()
    await dialog().getByRole('button', { name: 'Submit version 1' }).click()
    await expectVisible(main().getByText('Version 1 submitted'), 'Version 1 submitted')
    await shot('report-v1-submitted')
  })
  await step('Admin starts review and requests a change', async () => {
    await go('/admin/reporting/annual-reports/rep-asteria-2026', 'u-admin')
    if (await btn('Start review').count()) await btn('Start review').click()
    await btn('Request changes').click()
    const d = dialog()
    await d.getByLabel('Executive narrative').click()
    await d
      .getByPlaceholder('What should the company change or add?')
      .fill('Please add the 2026 board composition change and its effect.')
    await d.getByRole('button', { name: 'Send change request' }).click()
    await expectVisible(toastText(/Changes requested/), 'changes toast')
    await shot('admin-changes-requested')
  })
  await step('Nora fixes the flagged section', async () => {
    await go('/portal/reports/2026', 'u-nora')
    await expectVisible(main().getByText(/UN Women requested changes to 1 section/), 'change alert')
    await completeSection(
      /2\. Executive narrative/,
      'In 2026 the board appointed a second woman director, raising women on the board to 2 of 7. This strengthened oversight of our action plan.',
    )
    await shot('nora-fixed')
  })
  await step('Leila resubmits → version 2, history kept', async () => {
    await go('/portal/reports/2026', 'u-leila')
    await btn('Review and submit').click()
    await dialog()
      .getByLabel(/I confirm the declaration/)
      .click()
    await dialog().getByRole('button', { name: 'Submit version 2' }).click()
    await expectVisible(main().getByText('Version 2 submitted'), 'Version 2 submitted')
    await page.waitForTimeout(500)
    const versions = await main()
      .getByText(/Version [12]\b/)
      .allTextContents()
    assert(
      versions.some((t) => /Version 1/.test(t)),
      `version history: ${versions.join(' | ')}`,
    )
    await shot('report-v2-history')
    return versions.slice(0, 4).join(' | ')
  })
  await check('Admin review page shows Resubmitted with 2 versions', async () => {
    await go('/admin/reporting/annual-reports/rep-asteria-2026', 'u-admin')
    await expectVisible(
      main()
        .getByText(/Resubmitted/)
        .first(),
      'Resubmitted',
    )
    await expectVisible(
      main()
        .getByText(/Version 2|v2/)
        .first(),
      'v2',
    )
  })
})

/* -------------------------------------------------------------- 8 Portfolio --- */
await walkthrough(8, 'Portfolio reporting', async () => {
  await step('Admin filters 2026 + Kenya', async () => {
    await go('/admin/reporting', 'u-admin')
    await pickOption('Reporting year', '2026')
    await pickOption('Country', 'Kenya')
    await page.waitForTimeout(500)
    await expectVisible(main().getByText(/Country: Kenya/), 'scope line with Kenya')
    await shot('exec-kenya')
    const sum = await main()
      .getByRole('paragraph')
      .filter({ hasText: /approved signator/ })
      .first()
      .textContent()
    return sum
  })
  let reportUrl = ''
  await step('Drill into Harbour Services (overdue)', async () => {
    await main()
      .getByRole('link', { name: /Harbour Services/ })
      .first()
      .click()
    await page.waitForURL(/\/admin\/reporting\/companies\/c-harbour/)
    await expectVisible(page.getByRole('heading', { name: /Harbour Services/ }), 'Harbour heading')
    await shot('harbour-detail')
  })
  await step('Open its 2026 report', async () => {
    await main()
      .getByRole('link', { name: /2026 report/ })
      .click()
    await page.waitForURL(/annual-reports\/rep-/)
    reportUrl = new URL(page.url()).pathname
    await expectVisible(
      main()
        .getByText(/Harbour Services/)
        .first(),
      'report for Harbour',
    )
    await shot('harbour-report')
    return reportUrl
  })
  await step('Export the filtered view as CSV (download event)', async () => {
    await page.goBack()
    await page.goBack()
    await page.waitForLoadState('networkidle')
    await expectVisible(main().getByText(/Country: Kenya/), 'filters kept after back')
    await page.getByRole('link', { name: 'Companies', exact: true }).first().click()
    await page.waitForURL(/\/admin\/reporting\/companies/)
    await page.waitForLoadState('networkidle')
    const [dl] = await Promise.all([
      page.waitForEvent('download', { timeout: 6000 }),
      main().getByRole('button', { name: 'Export CSV' }).first().click(),
    ])
    const file = `${OUT}/${dl.suggestedFilename()}`
    await dl.saveAs(file)
    const csv = readFileSync(file, 'utf8')
    const lines = csv
      .trim()
      .split('\n')
      .filter((l) => !l.startsWith('#'))
    assert(/Harbour/.test(csv), 'CSV has no Harbour row')
    const nonKenya = lines.slice(1).filter((l) => !/Kenya/.test(l))
    assert(
      nonKenya.length === 0,
      `CSV not filtered to Kenya: ${nonKenya.length} other rows (url ${page.url()})`,
    )
    return `${dl.suggestedFilename()} · ${lines.length - 1} rows`
  })
  await step('Ask AI for an evidence-linked summary', async () => {
    await go('/admin/reporting?country=Kenya', 'u-admin')
    await link('Ask AI for an evidence-linked summary').click()
    await page.waitForURL(/concierge/)
    await page.waitForLoadState('networkidle')
    await expectVisible(page.getByRole('heading', { name: 'AI Concierge' }), 'concierge heading')
    const u = new URL(page.url())
    return `${u.pathname}${u.search || ' (no prompt/filter context passed)'}`
  })
  await step('Concierge returns an evidence-linked portfolio summary', async () => {
    const chip = btn(/portfolio summary/i)
    await expectVisible(chip, 'portfolio summary suggestion')
    const linksBefore = await main().getByRole('link').count()
    await chip.first().click()
    await page.waitForTimeout(3500)
    const linksAfter = await main().getByRole('link').count()
    await shot('concierge-summary')
    const body = await main().innerText()
    assert(linksAfter > linksBefore, 'no source links added with the answer')
    return `+${linksAfter - linksBefore} links; mentions Kenya/Harbour: ${/Kenya|Harbour/.test(body)}`
  })
})

/* ---------------------------------------------------------------------- report -- */
console.log('\n=== Summary')
const byWt = {}
for (const r of results) {
  byWt[r.wt] ??= { pass: 0, fail: 0 }
  byWt[r.wt][r.ok ? 'pass' : 'fail']++
}
for (const [wt, s] of Object.entries(byWt)) {
  console.log(`${wt}: ${s.fail ? 'FAIL' : 'PASS'} (${s.pass} passed, ${s.fail} failed)`)
}
const uniq = [...new Set(consoleErrors)]
console.log(`\n=== Console/page errors (${uniq.length} unique)`)
for (const e of uniq.slice(0, 40)) console.log(`  ${e.slice(0, 300)}`)
await browser.close()
process.exit(results.some((r) => !r.ok) ? 1 : 0)
