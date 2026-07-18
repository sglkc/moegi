/**
 * Real Spotify e2e against a fixed album (lyrics present).
 * Reuses e2e/.chrome-user-data (logged-in profile) and loads unpacked Moegi.
 *
 * Usage: pnpm test:e2e
 * Default album: kobasolo Collection 2 (user preference)
 * Viewport: 1280x720
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ARTIFACTS = path.join(__dirname, 'artifacts')

const ALBUM_URL =
  process.env.MOEGI_E2E_ALBUM
  ?? 'https://open.spotify.com/album/0mYyY7YPeYMBWKms7lsO3C'

const USER_DATA = process.env.MOEGI_CHROME_USER_DATA
  ?? path.join(__dirname, '.chrome-user-data')

const EXT_DIR = path.join(ROOT, '.output', 'chrome-mv3')
const CHROME_BIN = process.env.MOEGI_CHROME_BIN ?? '/usr/bin/google-chrome-stable'
const VIEWPORT = { width: 1280, height: 720 }
const HEADED = process.env.MOEGI_E2E_HEADED !== '0'

fs.mkdirSync(ARTIFACTS, { recursive: true })

function log(msg) {
  console.log(msg)
}

function ok(msg) {
  console.log(`OK: ${msg}`)
}

function fail(msg) {
  console.error(`FAIL: ${msg}`)
  process.exitCode = 1
}

async function shot(page, name) {
  const file = path.join(ARTIFACTS, name)
  await page.screenshot({ path: file, fullPage: false }).catch(() => {})
  log(`screenshot: ${file}`)
}

async function dismissOverlays(page) {
  // Cookie / consent
  for (const name of [/Accept all/i, /^Accept$/i, /Agree/i, /^OK$/i]) {
    const btn = page.getByRole('button', { name })
    if (await btn.count() && await btn.first().isVisible().catch(() => false)) {
      await btn.first().click({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(500)
    }
  }

  // Language picker modal (often blocks the album)
  const langModal = page.locator('[data-testid="language-selection-modal"]')
  if (await langModal.isVisible().catch(() => false)) {
    // Prefer Japanese or English if listed, else close / click outside
    for (const testid of ['language-option-en', 'language-option-ja', 'language-option-en-GB']) {
      const opt = page.locator(`[data-testid="${testid}"]`)
      if (await opt.count()) {
        await opt.first().click({ timeout: 3000 }).catch(() => {})
        await page.waitForTimeout(800)
        break
      }
    }
    // Escape if still open
    if (await langModal.isVisible().catch(() => false)) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    ok('dismissed language selection modal (if present)')
  }

  // Close buttons in dialogs
  const close = page.locator('[data-testid="close-button"]')
  if (await close.count() && await close.first().isVisible().catch(() => false)) {
    await close.first().click().catch(() => {})
  }
}

async function ensureLoggedIn(page) {
  const signup = page.locator('[data-testid="signup-bar"], [data-testid="login-button"]')
  const preview = page.getByText(/Preview of Spotify/i)
  if (await signup.first().isVisible().catch(() => false)
    || await preview.isVisible().catch(() => false)) {
    fail(
      'Spotify session looks logged-out or free-preview only. '
      + 'Close other Chrome windows using this profile, run `pnpm e2e:chrome`, '
      + 'sign in fully, then re-run `pnpm test:e2e`.',
    )
    await shot(page, 'not-logged-in.png')
    return false
  }
  return true
}

async function playFirstTrack(page) {
  // Primary: big album Play in the action bar
  const albumPlay = page.locator('[data-testid="action-bar"] [data-testid="play-button"]')
    .or(page.locator('[data-testid="action-bar-row"] [data-testid="play-button"]'))
    .or(page.locator('[data-testid="album-page"] [data-testid="play-button"]').first())

  if (await albumPlay.count()) {
    await albumPlay.first().click({ timeout: 15_000 })
    ok('clicked album action-bar play')
    return true
  }

  // Track row: hover then play
  const row = page.locator('[data-testid="tracklist-row"]').first()
  if (await row.count()) {
    await row.hover({ timeout: 10_000 })
    const rowPlay = row.locator('[data-testid="play-button"], button[aria-label*="Play"]')
    if (await rowPlay.count()) {
      await rowPlay.first().click({ timeout: 10_000 })
      ok('clicked first tracklist-row play')
      return true
    }
    // Double-click track title
    const link = row.locator('[data-testid="internal-track-link"]')
    if (await link.count()) {
      await link.first().dblclick({ timeout: 10_000 })
      ok('double-clicked first track link')
      return true
    }
  }

  // Now-playing bar play/pause
  const barPlay = page.locator('[data-testid="control-button-playpause"]')
  if (await barPlay.count()) {
    const label = await barPlay.getAttribute('aria-label')
    if (label && /play/i.test(label)) {
      await barPlay.click()
      ok('clicked now-playing play')
      return true
    }
    ok(`now-playing already active (aria-label=${label})`)
    return true
  }

  return false
}

async function openLyrics(page) {
  // Common controls
  const candidates = [
    page.locator('[data-testid="lyrics-button"]'),
    page.locator('button[aria-label="Lyrics"]'),
    page.locator('button[aria-label*="yrics"]'),
    page.locator('[data-testid="control-button-npv"]'), // now playing view, then lyrics inside
  ]

  for (const loc of candidates) {
    if (await loc.count() && await loc.first().isVisible().catch(() => false)) {
      await loc.first().click({ timeout: 10_000 })
      await page.waitForTimeout(1500)
      // If we opened NPV, try lyrics inside
      const lyricsInNpv = page.locator('[data-testid="lyrics-button"], button[aria-label*="yrics"]')
      if (await lyricsInNpv.count() && await lyricsInNpv.first().isVisible().catch(() => false)) {
        const still = page.locator('[data-testid="lyrics-line"]')
        if (!(await still.count())) {
          await lyricsInNpv.first().click().catch(() => {})
        }
      }
      ok('clicked lyrics / now-playing view control')
      return true
    }
  }
  return false
}

async function main() {
  log('Moegi Spotify e2e')
  log(`  album     : ${ALBUM_URL}`)
  log(`  profile   : ${USER_DATA}`)
  log(`  extension : ${EXT_DIR}`)
  log(`  viewport  : ${VIEWPORT.width}x${VIEWPORT.height}`)
  log(`  headed    : ${HEADED}`)

  if (!fs.existsSync(EXT_DIR)) {
    fail(`Extension missing at ${EXT_DIR} — run pnpm build`)
    return
  }

  // Prefer connecting to an already-running Moegi profile (pnpm e2e:chrome:e2e)
  // so Playwright does not re-spawn Chrome with automation-ish flags that can
  // drop Spotify's sp_dc session.
  const cdp = process.env.MOEGI_CDP_URL ?? `http://127.0.0.1:${process.env.MOEGI_CDP_PORT ?? '9222'}`
  /** @type {import('playwright').Browser} */
  let browser

  try {
    browser = await chromium.connectOverCDP(cdp)
    ok(`attached over CDP ${cdp}`)
  } catch {
    fail(
      `Cannot attach to Chrome at ${cdp}.\n`
      + '  Spotify session cookies die when Chrome exits, so e2e must attach to a\n'
      + '  live window — do not rely on relaunching the profile.\n\n'
      + '  1. pnpm build && pnpm e2e:chrome\n'
      + '  2. Log in (avatar top-right), leave the window open\n'
      + '  3. pnpm e2e:verify-login && pnpm test:e2e',
    )
    return
  }

  const ctx = browser.contexts()[0] ?? await browser.newContext({ viewport: VIEWPORT })
  const page = ctx.pages()[0] ?? await ctx.newPage()
  await page.setViewportSize(VIEWPORT).catch(() => {})

  try {
    await page.goto(ALBUM_URL, { waitUntil: 'domcontentloaded', timeout: 90_000 })
    await page.waitForTimeout(2500)
    await dismissOverlays(page)
    await page.waitForTimeout(1000)

    const url = page.url()
    if (/\/login|accounts\.spotify/i.test(url)) {
      fail('Redirected to login — re-auth with pnpm e2e:chrome')
      await shot(page, 'login-redirect.png')
      return
    }
    ok(`opened album (${url})`)

    if (!(await ensureLoggedIn(page))) return

    await page.locator('[data-testid="album-page"], [data-testid="track-list"]').first()
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => {})

    if (!(await playFirstTrack(page))) {
      fail('Could not start playback on the album')
      await shot(page, 'no-play.png')
      return
    }

    await page.waitForTimeout(5000)

    if (!(await openLyrics(page))) {
      fail('Could not open lyrics UI')
      await shot(page, 'no-lyrics-btn.png')
      return
    }

    const lyricLines = page.locator('[data-testid="lyrics-line"]')
    await lyricLines.first().waitFor({ state: 'visible', timeout: 60_000 })
    const lineCount = await lyricLines.count()
    ok(`Spotify lyrics lines visible: ${lineCount}`)

    // Moegi processed slots (debounced init ~1s + work)
    const original = page.locator('.original-lyric')
    try {
      await original.first().waitFor({ state: 'attached', timeout: 45_000 })
    } catch {
      fail('Moegi .original-lyric never appeared — extension may not be loaded')
      await shot(page, 'no-moegi.png')
      const sw = typeof ctx.serviceWorkers === 'function' ? ctx.serviceWorkers() : []
      const bg = typeof ctx.backgroundPages === 'function' ? ctx.backgroundPages() : []
      log(`serviceWorkers: ${sw.map((w) => w.url()).join(', ') || '(none)'}`)
      log(`backgroundPages: ${bg.map((p) => p.url()).join(', ') || '(none)'}`)
      return
    }

    const processed = await original.count()
    const romanized = await page.locator('.romanized-lyric').count()
    const translated = await page.locator('.translated-lyric').count()
    ok(`Moegi slots — original: ${processed}, romanized: ${romanized}, translated: ${translated}`)

    if (processed < 1 || romanized < 1 || translated < 1) {
      fail('Expected Moegi original/romanized/translated slots')
      await shot(page, 'incomplete-moegi.png')
      return
    }

    const vp = page.viewportSize()
    if (!vp || vp.width < 1280 || vp.height < 720) {
      fail(`Viewport too small: ${JSON.stringify(vp)}`)
      return
    }
    ok(`viewport ${vp.width}x${vp.height}`)

    await shot(page, 'spotify-lyrics-ok.png')
    log('\nPASS: Spotify album lyrics e2e (Moegi slots present @ 1280x720)')
  } catch (err) {
    fail(err?.stack || String(err))
    await shot(page, 'spotify-error.png')
  } finally {
    // Never browser.close() — that would kill the user's session Chrome
    await browser.close().catch(() => {})
    // Playwright's browser.close() on CDP disconnects without killing Chrome
    log('disconnected from CDP (Chrome left running)')
  }
}

main()
