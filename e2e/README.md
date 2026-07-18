# Moegi e2e (real Spotify)

Offline Vitest covers pipeline logic. Real Spotify e2e is a **separate, fragile** layer: it needs your login, network, and Spotify’s live DOM.

## Preferred live target

| Setting | Value |
|---------|--------|
| **Album** | [Collection 2 — kobasolo](https://open.spotify.com/album/0mYyY7YPeYMBWKms7lsO3C) (`0mYyY7YPeYMBWKms7lsO3C`) |
| **Viewport** | **1280×720** (16:9; common laptop ratio) |
| **Command** | `pnpm test:e2e` |

Override album: `MOEGI_E2E_ALBUM=https://open.spotify.com/album/... pnpm test:e2e`

## Chrome profile for this project

A dedicated Google Chrome user-data directory lives at:

```text
e2e/.chrome-user-data/
```

It is **gitignored**. Use it only for Moegi e2e so Spotify login/cookies stay out of your daily browser profile.

### 1. Create / open the profile (you log in)

**Important:** log in with the script below — not your normal Chrome window.  
If the top-right still shows **Log in** / **Sign up**, the e2e runner will abort.

```sh
# from repo root — close other windows using this profile first
pnpm e2e:chrome
```

Or:

```sh
./e2e/scripts/launch-chrome-profile.sh
```

What it does:

- Uses `/usr/bin/google-chrome-stable`
- `--user-data-dir=$REPO/e2e/.chrome-user-data`
- Opens `https://open.spotify.com`
- Remote debugging on **9222**

**You:** sign into Spotify in **that** window until your avatar replaces Log in. Close Chrome completely when done (so Playwright can open the same profile).
### 2. Run automated live e2e

```sh
pnpm test:e2e
```

This builds Moegi, launches the project Chrome profile at **1280×720**, opens the kobasolo album, plays a track, opens lyrics, and asserts Moegi slots (`.original-lyric`, `.romanized-lyric`, `.translated-lyric`).

Screenshots land in `e2e/artifacts/` (gitignored).

### 3. Optional: manual Chrome with extension

```sh
pnpm build
pnpm e2e:chrome:ext
```

Loads `.output/chrome-mv3` as an unpacked extension in the same profile.

### 4. Attach automation later (CDP)

With Chrome already running via the script (debug port 9222):

- Playwright: `chromium.connectOverCDP('http://127.0.0.1:9222')`
- Or Playwright MCP / Chrome DevTools MCP against that CDP endpoint

Do **not** force-attach to a Chrome that was started without `--remote-debugging-port`.

---

## How real-Spotify e2e should work (recommended design)

### Goals

Prove, against live open.spotify.com:

1. Content script injects on the player
2. Opening lyrics yields processed slots (original / romanized / translated)
3. Toggling options (via popup or messaging) updates the page
4. Song change re-inits without a stuck state

### What not to assert

- Exact Spotify class names as the only contract (they change)
- Full visual screenshots as the sole gate
- Rate-limited Google Translate every CI run (mock or skip translation e2e in CI)

### Suggested layers

| Layer | Runner | Spotify? | When |
|-------|--------|----------|------|
| Unit / feature | Vitest + happy-dom | No | Every PR |
| Extension smoke | Playwright + local fixture HTML | No | Every PR / nightly |
| Live Spotify | Playwright + **this Chrome profile** + CDP | Yes | Manual / optional nightly |

### Live flow (when you add tests later)

1. Ensure profile is logged in (`pnpm e2e:chrome` once).
2. `pnpm build` so the extension zip/dir is current.
3. Launch Chrome with profile + load extension + CDP (or connect to already running instance).
4. `page.goto('https://open.spotify.com')` — reuse cookies.
5. Start playback / open lyrics (selectors will need maintenance).
6. Assert **Moegi-owned** markers, e.g. `.original-lyric`, `.romanized-lyric`, `#moegi-style`, toasts — not Spotify internals alone.
7. Prefer soft checks: “at least N processed lines” after lyrics open, not exact copy of every lyric.

### Stability tips

- Pin a **playlist / track URL** known to have lyrics.
- Long timeouts for first paint and lyrics network.
- Retry once on “lyrics container not found”.
- Keep live e2e **out of required CI** until selectors are fixture-backed or very stable.
- Never commit `e2e/.chrome-user-data` (secrets/session).

### Profile hygiene

```sh
# wipe login and start over
rm -rf e2e/.chrome-user-data
pnpm e2e:chrome
```

---

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm e2e:chrome` | Open project Chrome profile → Spotify (login here) |
| `pnpm e2e:chrome:ext` | Same + load built Moegi extension |
| `pnpm e2e:chrome:debug` | Profile + Spotify + remote debugging only (no auto-nav required) |

Default debug port: `9222` (override with `MOEGI_CDP_PORT`).
