/**
 * Live Spotify e2e (CDP attach only — keep MoegiE2E Chrome open & logged in).
 *
 * Default path does NOT enable features for you — options stay as the user set them
 * (product defaults are all off). Smoke-checks Moegi injection + fixed track lyric.
 *
 * Optional explicit toggles (simulates user flipping switches, then restores off):
 *   MOEGI_E2E_OPTIONS=1 pnpm test:e2e
 *
 * Usage:
 *   pnpm e2e:chrome   # leave open after login + Load unpacked Moegi
 *   pnpm test:e2e
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import {
  ALBUM_URL,
  ANCHOR_LINE_INDEX,
  ANCHOR_ORIGINAL_TEXT,
  ANCHOR_ROMANIZED_RE,
  DEFAULT_EXTENSION_ID,
  LYRICS_URL,
  TRACK_ID,
  TRACK_URL,
  VIEWPORT,
} from './fixtures/spotify-targets.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ARTIFACTS = path.join(__dirname, 'artifacts')
const USER_DATA = process.env.MOEGI_CHROME_USER_DATA
  ?? path.join(__dirname, '.chrome-user-data')
const EXT_DIR = path.join(ROOT, '.output', 'chrome-mv3')
const CDP = process.env.MOEGI_CDP_URL
  ?? `http://127.0.0.1:${process.env.MOEGI_CDP_PORT ?? '9222'}`
const EXT_ID = process.env.MOEGI_EXT_ID ?? DEFAULT_EXTENSION_ID
/** When set, e2e explicitly toggles romanization/fonts/translation then restores defaults (all off). */
const TEST_OPTIONS = process.env.MOEGI_E2E_OPTIONS === '1'

fs.mkdirSync(ARTIFACTS, { recursive: true })

function log(msg) { console.log(msg) }
function ok(msg) { console.log(`OK: ${msg}`) }
function fail(msg) {
  console.error(`FAIL: ${msg}`)
  process.exitCode = 1
}

async function shot(page, name) {
  const file = path.join(ARTIFACTS, name)
  await page.screenshot({ path: file, scale: 'css' }).catch(() => {})
  log(`screenshot: ${file}`)
}

async function dismissOverlays(page) {
  for (const name of [/Accept all/i, /^Accept$/i, /Agree/i, /^OK$/i]) {
    const btn = page.getByRole('button', { name })
    if (await btn.count() && await btn.first().isVisible().catch(() => false)) {
      await btn.first().click({ timeout: 3000 }).catch(() => {})
    }
  }
  const langModal = page.locator('[data-testid="language-selection-modal"]')
  if (await langModal.isVisible().catch(() => false)) {
    for (const id of ['language-option-en', 'language-option-ja']) {
      const opt = page.locator(`[data-testid="${id}"]`)
      if (await opt.count()) {
        await opt.first().click().catch(() => {})
        break
      }
    }
    await page.keyboard.press('Escape').catch(() => {})
  }
}

async function ensureLoggedIn(page) {
  // Prefer waiting for the account control rather than a single evaluate snapshot
  try {
    await page.locator('[data-testid="user-widget-link"], [data-testid="user-widget-avatar"]')
      .first()
      .waitFor({ state: 'attached', timeout: 30_000 })
    ok('logged in (user widget present)')
    return true
  } catch {
    const state = await page.evaluate(() => ({
      login: !!document.querySelector('[data-testid="login-button"]'),
      preview: /Preview of Spotify/i.test(document.body?.innerText || ''),
      href: location.href,
      title: document.title,
    }))
    fail(`Not logged in on CDP Chrome (href=${state.href}, login=${state.login}, preview=${state.preview})`)
    await shot(page, 'not-logged-in.png')
    return false
  }
}

/**
 * Resolve Moegi extension id. Prefer env / default (path-stable unpacked id),
 * then CDP targets that expose our popup.html.
 */
async function resolveExtensionId(browser) {
  if (EXT_ID && EXT_ID !== 'auto') return EXT_ID
  try {
    const session = await browser.newBrowserCDPSession()
    const { targetInfos } = await session.send('Target.getTargets')
    for (const t of targetInfos) {
      const url = t.url || ''
      if (!url.startsWith('chrome-extension://')) continue
      // Prefer explicit Moegi popup/background, never other extensions
      if (url.includes('/popup.html') || url.includes('background')) {
        const id = url.split('/')[2]
        // sanity: only accept if popup loads our title later; prefer known default
        if (id === DEFAULT_EXTENSION_ID) return id
      }
    }
  } catch { /* fall through */ }
  return DEFAULT_EXTENSION_ID
}

/**
 * Merge patch into chrome.storage.sync moegiOptions (WXT shape).
 * Content script picks this up on lyrics re-init (reload / re-open lyrics).
 */
async function setMoegiOptions(browser, ctx, partial) {
  const id = await resolveExtensionId(browser)
  const popup = await ctx.newPage()
  await popup.goto(`chrome-extension://${id}/popup.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 15_000,
  })
  const result = await popup.evaluate(async (patch) => {
    function deepMerge(a, b) {
      const out = { ...(a || {}) }
      for (const [k, val] of Object.entries(b || {})) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          out[k] = deepMerge(out[k], val)
        } else {
          out[k] = val
        }
      }
      return out
    }
    const all = await chrome.storage.sync.get(null)
    const current = all.moegiOptions || {}
    const next = deepMerge(current, patch)
    // Preserve WXT version meta key if present
    const payload = { moegiOptions: next }
    if (all['moegiOptions$']) payload['moegiOptions$'] = all['moegiOptions$']
    await chrome.storage.sync.set(payload)
    return { enabledRomanization: next.romanization?.enabled, enabledTranslation: next.translation?.enabled, fonts: next.fonts?.enabled }
  }, partial)
  await popup.close().catch(() => {})
  ok(`options updated (${JSON.stringify(result)})`)
  return id
}

/** Reload lyrics so lyricsInit re-reads storage and re-applies features */
async function reinitLyrics(page) {
  await page.goto(LYRICS_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.waitForTimeout(2500)
  await page.locator('[data-testid="lyrics-line"]').first()
    .waitFor({ state: 'attached', timeout: 60_000 })
  await page.waitForTimeout(2000)
  await waitForMoegiSlots(page)
}

async function ensurePlaying(page) {
  const bar = page.locator('[data-testid="control-button-playpause"]')
  await bar.waitFor({ state: 'attached', timeout: 20_000 }).catch(() => {})
  const label = await bar.getAttribute('aria-label').catch(() => '')
  // aria-label is "Play" when paused, "Pause" when playing
  if (label && /^play$/i.test(label.trim())) {
    await bar.click()
    ok('started playback (was paused)')
  } else {
    ok(`playback control: ${label || 'unknown'}`)
  }
}

async function openLyrics(page) {
  // Prefer dedicated lyrics route after play is primed
  const lyricsBtn = page.locator('[data-testid="lyrics-button"]').first()
  if (await lyricsBtn.count() && await lyricsBtn.isVisible().catch(() => false)) {
    await lyricsBtn.click({ timeout: 10_000 })
    ok('clicked lyrics-button')
  } else {
    await page.goto(LYRICS_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    ok('navigated to /lyrics')
  }
  await page.waitForTimeout(2000)
  await page.locator('[data-testid="lyrics-line"]').first()
    .waitFor({ state: 'attached', timeout: 60_000 })
  ok('lyrics-line nodes attached')
}

async function waitForMoegiSlots(page) {
  const original = page.locator('.original-lyric')
  await original.first().waitFor({ state: 'attached', timeout: 45_000 })
  const counts = await page.evaluate(() => ({
    original: document.querySelectorAll('.original-lyric').length,
    romanized: document.querySelectorAll('.romanized-lyric').length,
    translated: document.querySelectorAll('.translated-lyric').length,
    style: !!document.querySelector('#moegi-style'),
  }))
  ok(`Moegi slots original=${counts.original} romanized=${counts.romanized} translated=${counts.translated} style=${counts.style}`)
  if (counts.original < 1 || counts.romanized < 1 || counts.translated < 1 || !counts.style) {
    throw new Error('Moegi slots incomplete')
  }
  return counts
}

async function readAnchorLine(page) {
  return page.evaluate((idx) => {
    const originals = [...document.querySelectorAll('.original-lyric')]
      .filter((el) => el.textContent?.trim())
    const el = originals[idx]
    if (!el) return null
    const parent = el.closest('[data-testid="lyrics-line"]') || el.parentElement
    return {
      original: el.textContent?.trim() || '',
      romanized: parent?.querySelector('.romanized-lyric')?.textContent?.trim()
        || parent?.querySelector('.romanized-lyric')?.innerHTML?.trim() || '',
      translated: parent?.querySelector('.translated-lyric')?.textContent?.trim() || '',
      totalOriginals: originals.length,
    }
  }, ANCHOR_LINE_INDEX)
}

async function waitForAnchor(page, predicate, label, timeoutMs = 45_000) {
  const start = Date.now()
  let last = null
  while (Date.now() - start < timeoutMs) {
    last = await readAnchorLine(page)
    if (last && predicate(last)) return last
    await page.waitForTimeout(1000)
  }
  throw new Error(`${label} — last=${JSON.stringify(last)}`)
}

async function main() {
  log('Moegi Spotify e2e (reproducible targets)')
  log(`  album  : ${ALBUM_URL}`)
  log(`  track  : ${TRACK_ID}`)
  log(`  anchor : line[${ANCHOR_LINE_INDEX}] ≈ ${ANCHOR_ORIGINAL_TEXT}`)
  log(`  cdp    : ${CDP}`)
  log(`  viewport: ${VIEWPORT.width}x${VIEWPORT.height}`)

  if (!fs.existsSync(EXT_DIR)) {
    fail(`Missing extension build ${EXT_DIR} — run pnpm build`)
    return
  }

  /** @type {import('playwright').Browser} */
  let browser
  try {
    browser = await chromium.connectOverCDP(CDP)
    ok(`attached CDP ${CDP}`)
  } catch {
    fail(
      `Cannot attach to ${CDP}. Keep MoegiE2E Chrome open (pnpm e2e:chrome), logged in, Moegi Load unpacked.`,
    )
    return
  }

  const ctx = browser.contexts()[0]
  if (!ctx) {
    fail('No browser context on CDP')
    return
  }

  const allPages = ctx.pages()
  log(`CDP pages (${allPages.length}): ${allPages.map((p) => p.url()).join(' | ')}`)

  // Prefer an open Spotify tab (never use extension:// pages as the main page)
  let page = allPages.find((p) => /^https:\/\/open\.spotify\.com\//.test(p.url()))
  if (!page) page = await ctx.newPage()
  await page.setViewportSize(VIEWPORT).catch(() => {})
  await page.bringToFront().catch(() => {})

  try {
    // --- fixed track ---
    await page.goto(TRACK_URL, { waitUntil: 'domcontentloaded', timeout: 90_000 })
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
    await page.waitForTimeout(2000)
    await dismissOverlays(page)
    if (!(await ensureLoggedIn(page))) return
    ok(`on track page ${page.url()}`)

    await ensurePlaying(page)
    await page.waitForTimeout(2000)
    await openLyrics(page)

    // Wait for Moegi init (debounced observer ~1s+)
    await page.waitForTimeout(2500)
    await waitForMoegiSlots(page)

    // --- assert fixed lyric line (search all slots; virtualization reorders) ---
    const findAnchor = async () => page.evaluate((text) => {
      const rows = [...document.querySelectorAll('[data-testid="lyrics-line"]')]
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const o = row.querySelector('.original-lyric')?.textContent?.trim()
          || row.textContent?.trim() || ''
        if (o.includes(text)) {
          return {
            index: i,
            original: o,
            romanized: row.querySelector('.romanized-lyric')?.textContent?.trim()
              || row.querySelector('.romanized-lyric')?.innerHTML?.trim() || '',
            translated: row.querySelector('.translated-lyric')?.textContent?.trim() || '',
          }
        }
      }
      // sample first few originals for debugging
      const samples = [...document.querySelectorAll('.original-lyric')]
        .map((el) => el.textContent?.trim())
        .filter(Boolean)
        .slice(0, 5)
      return { index: -1, samples }
    }, ANCHOR_ORIGINAL_TEXT)

    let anchorHit = null
    for (let i = 0; i < 20; i++) {
      anchorHit = await findAnchor()
      if (anchorHit.index >= 0) break
      // Scroll lyrics panel to load virtualized lines
      await page.evaluate(() => {
        const root = document.querySelector('[data-testid="lyrics-line"]')?.parentElement
        if (root) root.scrollTop = 0
        window.scrollTo(0, 0)
      }).catch(() => {})
      await page.waitForTimeout(500)
    }
    if (!anchorHit || anchorHit.index < 0) {
      fail(`Expected lyric "${ANCHOR_ORIGINAL_TEXT}" not in DOM. samples=${JSON.stringify(anchorHit?.samples)}`)
      await shot(page, 'wrong-lyric-text.png')
      return
    }
    ok(`anchor original @ lyrics-line[${anchorHit.index}]: ${anchorHit.original.slice(0, 40)}`)

    // With product defaults (all features off), romanized/translated stay empty unless user enabled them
    const emptyExtras = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('[data-testid="lyrics-line"]')].slice(0, 10)
      let romanNonEmpty = 0
      let transNonEmpty = 0
      for (const row of rows) {
        if (row.querySelector('.romanized-lyric')?.textContent?.trim()) romanNonEmpty++
        if (row.querySelector('.translated-lyric')?.textContent?.trim()) transNonEmpty++
      }
      return { romanNonEmpty, transNonEmpty }
    })
    ok(`user options: romanized non-empty in sample=${emptyExtras.romanNonEmpty}, translated=${emptyExtras.transNonEmpty}`)

    if (TEST_OPTIONS) {
      // Explicit user-like toggles (not product defaults); restore all-off at end
      await setMoegiOptions(browser, ctx, { romanization: { enabled: true } })
      await reinitLyrics(page)

      let romanized = null
      const romanDeadline = Date.now() + 90_000
      while (Date.now() < romanDeadline) {
        const any = await page.evaluate(() => {
          for (const row of document.querySelectorAll('[data-testid="lyrics-line"]')) {
            const o = row.querySelector('.original-lyric')?.textContent || ''
            const r = row.querySelector('.romanized-lyric')?.textContent
              || row.querySelector('.romanized-lyric')?.innerHTML || ''
            if (/[\u3040-\u30ff\u4e00-\u9fff]/.test(o) && r.trim().length > 2) {
              return { original: o.trim(), romanized: r.trim() }
            }
          }
          return null
        })
        if (any) {
          romanized = any
          break
        }
        await page.waitForTimeout(1500)
      }
      if (!romanized) {
        fail('romanization never filled after explicit enable')
        await shot(page, 'no-romanization.png')
        return
      }
      ok(`romanization (user toggle): "${romanized.romanized.slice(0, 60)}"`)

      await setMoegiOptions(browser, ctx, {
        fonts: { enabled: true, size: 1.2, align: 'center' },
      })
      await reinitLyrics(page)
      const styleText = await page.locator('#moegi-style').textContent()
      if (!styleText?.includes('font-size')) {
        fail('#moegi-style missing font-size after fonts.enabled')
        return
      }
      ok('fonts option reflected in #moegi-style')

      await setMoegiOptions(browser, ctx, {
        translation: { enabled: true, target: 'en' },
      })
      await reinitLyrics(page)
      await page.waitForTimeout(8000)
      const translated = await page.evaluate(() => {
        for (const row of document.querySelectorAll('[data-testid="lyrics-line"]')) {
          const t = row.querySelector('.translated-lyric')?.textContent?.trim()
          if (t) return t
        }
        return ''
      })
      if (translated) ok(`translation (user toggle): ${translated.slice(0, 60)}`)
      else log('WARN: translation empty — non-fatal')

      // Restore product defaults (all features off) so we don't leave toggles on
      await setMoegiOptions(browser, ctx, {
        romanization: { enabled: false },
        translation: { enabled: false },
        fonts: { enabled: false, size: 1, align: 'left' },
      })
      ok('restored options to defaults (features off)')
    }

    // --- fullscreen (optional UI control) ---
    const fsBtn = page.locator('[data-testid="fullscreen-mode-button"], button[aria-label*="Full screen"]')
    if (await fsBtn.count() && await fsBtn.first().isVisible().catch(() => false)) {
      await fsBtn.first().click().catch(() => {})
      await page.waitForTimeout(1000)
      ok('entered fullscreen mode')
    }

    await page.setViewportSize(VIEWPORT).catch(() => {})
    ok(`viewport ${JSON.stringify(page.viewportSize())}`)

    await shot(page, 'spotify-e2e-pass.png')
    log(`\nPASS: Spotify e2e smoke (slots + anchor${TEST_OPTIONS ? ' + option toggles' : ''})`)
  } catch (err) {
    fail(err?.stack || String(err))
    await shot(page, 'spotify-e2e-error.png')
  } finally {
    await browser.close().catch(() => {})
    log('disconnected CDP (Chrome left running)')
  }
}

main()
