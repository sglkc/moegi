/**
 * Check whether the project Chrome profile has a real Spotify session.
 *
 * Usage: pnpm e2e:verify-login
 *
 * Note: sp_dc / sp_key are usually *session* cookies (is_persistent=0).
 * They disappear when Chrome fully exits. For e2e, keep Chrome open and
 * attach via CDP (pnpm e2e:chrome:e2e → pnpm test:e2e).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const USER_DATA = process.env.MOEGI_CHROME_USER_DATA
  ?? path.join(ROOT, 'e2e/.chrome-user-data')
const COOKIES = path.join(USER_DATA, 'Default', 'Cookies')

function readViaPython() {
  const py = `
import os, sqlite3, shutil, tempfile, sys
src = ${JSON.stringify(COOKIES)}
if not os.path.exists(src):
    print("ERR no_db"); sys.exit(1)
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

console.log('Moegi Spotify login check')
console.log(`  profile: ${USER_DATA}`)
console.log('')

const locked = fs.existsSync(path.join(USER_DATA, 'SingletonLock'))
if (locked) {
  console.log('NOTE: Chrome is running with this profile (good for CDP e2e).\n')
} else {
  console.log('NOTE: Chrome is not running. Session cookies (sp_dc) are often')
  console.log('      deleted on Exit — verify may FAIL even after a good login.\n')
}

const out = readViaPython()
console.log(out)

const hasAuth = /AUTH [1-9]/.test(out) || /\bsp_dc\b/.test(out) || /\bsp_key\b/.test(out)
const sessionOnly = /SESSION_AUTH [1-9]/.test(out)

if (hasAuth) {
  console.log('PASS: Spotify auth cookie (sp_dc / sp_key) found.')
  if (sessionOnly) {
    console.log('')
    console.log('WARNING: auth cookies are session-only (persistent=0).')
    console.log('  They usually vanish when Chrome exits completely.')
    console.log('  For e2e, do NOT quit Chrome after login:')
    console.log('    pnpm e2e:chrome:e2e   # log in, leave window open')
    console.log('    pnpm test:e2e         # attaches over CDP :9222')
  }
  process.exit(0)
}

console.log('FAIL: No Spotify auth cookie (sp_dc / sp_key).')
console.log('')
console.log('Recommended e2e login (keep browser open):')
console.log('  1. pnpm build && pnpm e2e:chrome:e2e')
console.log('  2. Log in until avatar shows (window MoegiE2E)')
console.log('  3. Leave Chrome open')
console.log('  4. pnpm e2e:verify-login && pnpm test:e2e')
console.log('')
console.log('If cookies never appear even while Chrome is open:')
console.log('  pnpm e2e:reset-profile && pnpm e2e:chrome:e2e')
process.exit(1)
