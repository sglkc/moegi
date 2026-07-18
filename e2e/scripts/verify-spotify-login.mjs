/**
 * Check whether the project Chrome profile has a real Spotify session.
 * Looks for auth cookies (sp_dc / sp_key) and optionally opens the album once.
 *
 * Usage: node e2e/scripts/verify-spotify-login.mjs
 *        pnpm e2e:verify-login
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
print("COUNT", len(rows))
print("AUTH", len(auth))
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

if (fs.existsSync(path.join(USER_DATA, 'SingletonLock'))) {
  console.log('NOTE: Chrome may still be running with this profile.')
  console.log('      Quit it fully so cookie files are flushed to disk.\n')
}

const out = readViaPython()
console.log(out)

const hasAuth = /AUTH [1-9]/.test(out) || /\bsp_dc\b/.test(out) || /\bsp_key\b/.test(out)

if (hasAuth) {
  console.log('PASS: Spotify auth cookie (sp_dc / sp_key) found — session should persist.')
  process.exit(0)
}

console.log('FAIL: No Spotify auth cookie (sp_dc / sp_key).')
console.log('')
console.log('Fix:')
console.log('  1. Quit ALL Chrome windows that use the Moegi e2e profile.')
console.log('  2. pnpm e2e:chrome          # clean login mode (no CDP)')
console.log('  3. In the MoegiE2E window: Log in until avatar shows (not Log in).')
console.log('  4. Quit Chrome completely (menu → Exit).')
console.log('  5. pnpm e2e:verify-login    # this script')
console.log('')
console.log('If login still does not stick, wipe and retry:')
console.log('  rm -rf e2e/.chrome-user-data && pnpm e2e:chrome')
process.exit(1)
