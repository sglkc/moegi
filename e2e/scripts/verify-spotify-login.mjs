/**
 * Verify Spotify login for Moegi live e2e.
 *
 * Prefer a live MoegiE2E Chrome on CDP (session cookies + page UI).
 * Disk Cookies DB is a weak fallback: sp_dc is usually session-only and
 * often missing from SQLite while Chrome is running or after Exit.
 *
 * Usage: pnpm e2e:verify-login
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const USER_DATA = process.env.MOEGI_CHROME_USER_DATA
  ?? path.join(ROOT, 'e2e', '.chrome-user-data')
const COOKIES_DB = path.join(USER_DATA, 'Default', 'Cookies')
const CDP = process.env.MOEGI_CDP_URL
  ?? `http://127.0.0.1:${process.env.MOEGI_CDP_PORT ?? '9222'}`
const DEFAULT_EXT_ID = 'npfkbpalllbfopbmbocghbmkmmkephlf'
const EXT_ID = process.env.MOEGI_EXT_ID ?? DEFAULT_EXT_ID

function log(msg) { console.log(msg) }

async function cdpReachable() {
  try {
    const res = await fetch(`${CDP}/json/version`, { signal: AbortSignal.timeout(2000) })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Live check via Playwright CDP attach (same path as test:e2e).
 * @returns {{ ok: boolean, detail: string }}
 */
async function verifyViaCdp() {
  const version = await cdpReachable()
  if (!version) {
    return { ok: false, detail: `CDP not reachable at ${CDP}` }
  }

  log(`CDP: ${version.Browser || 'Chrome'} @ ${CDP}`)

  /** @type {import('playwright').Browser} */
  let browser
  try {
    browser = await chromium.connectOverCDP(CDP)
  } catch (e) {
    return { ok: false, detail: `connectOverCDP failed: ${e?.message || e}` }
  }

  try {
    const ctx = browser.contexts()[0]
    if (!ctx) return { ok: false, detail: 'No browser context on CDP' }

    // Auth cookies from the live browser (includes session cookies)
    const cookies = await ctx.cookies([
      'https://open.spotify.com',
      'https://accounts.spotify.com',
    ])
    const auth = cookies.filter((c) => c.name === 'sp_dc' || c.name === 'sp_key')
    log(`CDP cookies: total=${cookies.length} auth=${auth.map((c) => c.name).join(',') || 'none'}`)

    // Prefer an open Spotify tab
    let page = ctx.pages().find((p) => /^https:\/\/open\.spotify\.com\//.test(p.url()))
    if (!page) {
      page = await ctx.newPage()
      await page.goto('https://open.spotify.com/', {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      }).catch(() => {})
    }

    let widget = false
    try {
      await page.locator(
        '[data-testid="user-widget-link"], [data-testid="user-widget-avatar"]',
      ).first().waitFor({ state: 'attached', timeout: 20_000 })
      widget = true
    } catch {
      widget = false
    }

    // Moegi production extension (service worker / popup)
    let moegi = false
    try {
      const popup = await ctx.newPage()
      const res = await popup.goto(`chrome-extension://${EXT_ID}/popup.html`, {
        waitUntil: 'domcontentloaded',
        timeout: 10_000,
      })
      moegi = !!res && res.ok()
      await popup.close().catch(() => {})
    } catch {
      moegi = false
    }

    log(`UI: user-widget=${widget} moegi(prod ${EXT_ID.slice(0, 8)}…)=${moegi}`)

    if (widget && auth.length > 0) {
      return {
        ok: true,
        detail: `logged in (widget + ${auth.map((c) => c.name).join('/')})${moegi ? '; Moegi loaded' : '; WARN: Moegi not loadable — Load unpacked .output/chrome-mv3'}`,
      }
    }
    if (widget) {
      // Widget is enough for e2e (matches spotify-album.e2e.mjs)
      return {
        ok: true,
        detail: `logged in (user widget; auth cookies ${auth.length ? 'present' : 'not visible to CDP'})${moegi ? '; Moegi loaded' : '; WARN: Load unpacked Moegi from .output/chrome-mv3'}`,
      }
    }
    if (auth.length > 0) {
      return {
        ok: false,
        detail: 'auth cookies present but user widget not found — finish login / dismiss overlays',
      }
    }
    return {
      ok: false,
      detail: 'not logged in on CDP Chrome (no widget, no sp_dc/sp_key)',
    }
  } finally {
    await browser.close().catch(() => {})
  }
}

function verifyViaDiskDb() {
  const py = `
import os, sqlite3, shutil, tempfile, sys
src = ${JSON.stringify(COOKIES_DB)}
if not os.path.exists(src):
    print("ERR no_db"); sys.exit(0)
tmp = tempfile.mktemp(suffix=".db")
shutil.copy2(src, tmp)
for ext in ("-wal", "-shm"):
    p = src + ext
    if os.path.exists(p):
        try: shutil.copy2(p, tmp + ext)
        except: pass
con = sqlite3.connect(tmp)
rows = con.execute(
    "select host_key, name, is_persistent from cookies "
    "where host_key like '%spotify%' order by name"
).fetchall()
auth = [r for r in rows if r[1] in ("sp_dc", "sp_key")]
session_auth = [r for r in auth if r[2] == 0]
print("COUNT", len(rows))
print("AUTH", len(auth))
print("SESSION_AUTH", len(session_auth))
for r in rows:
    print("COOKIE", r[0], r[1], "persistent="+str(r[2]))
for ext in ("", "-wal", "-shm"):
    p = tmp + ext
    if os.path.exists(p):
        os.unlink(p)
`
  try {
    return execFileSync('python3', ['-c', py], { encoding: 'utf8' })
  } catch (e) {
    return `ERR ${e.stderr || e.message}`
  }
}

async function main() {
  log('Moegi Spotify login check')
  log(`  profile: ${USER_DATA}`)
  log(`  cdp    : ${CDP}`)
  log('')

  const cdp = await verifyViaCdp()
  if (cdp.ok) {
    log(`PASS: ${cdp.detail}`)
    log('')
    log('Leave MoegiE2E Chrome open, then: pnpm test:e2e')
    process.exit(0)
  }

  if (!cdp.detail.includes('not reachable')) {
    // CDP was up but login incomplete
    log(`FAIL: ${cdp.detail}`)
    log('')
    log('In the MoegiE2E window:')
    log('  1. Log in until avatar is top-right')
    log('  2. chrome://extensions → Load unpacked → .output/chrome-mv3')
    log('  3. Leave Chrome open → pnpm e2e:verify-login && pnpm test:e2e')
    process.exit(1)
  }

  log(`NOTE: ${cdp.detail}`)
  log('Falling back to on-disk Cookies DB (often misses session sp_dc)…')
  log('')

  const locked = fs.existsSync(path.join(USER_DATA, 'SingletonLock'))
  if (locked) {
    log('NOTE: Profile SingletonLock present but CDP down — start with:')
    log('  pnpm e2e:chrome')
    log('')
  }

  const out = verifyViaDiskDb()
  log(out.trimEnd())
  log('')

  const hasAuth = /AUTH [1-9]/.test(out) || /\bsp_dc\b/.test(out)
  if (hasAuth) {
    log('PASS (disk only): auth cookie found — still prefer CDP for e2e:')
    log('  pnpm e2e:chrome  # leave open after login')
    log('  pnpm e2e:verify-login && pnpm test:e2e')
    process.exit(0)
  }

  log('FAIL: No Spotify session via CDP or disk.')
  log('')
  log('  1. pnpm build && pnpm e2e:chrome')
  log('  2. Log in (avatar top-right); Load unpacked .output/chrome-mv3')
  log('  3. Leave Chrome open')
  log('  4. pnpm e2e:verify-login && pnpm test:e2e')
  process.exit(1)
}

main().catch((err) => {
  console.error(err?.stack || err)
  process.exit(1)
})
