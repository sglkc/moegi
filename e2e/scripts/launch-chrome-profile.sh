#!/usr/bin/env bash
# Launch project-local Chrome for Moegi Spotify e2e.
#
# IMPORTANT: Spotify sp_dc / sp_key are usually *session* cookies.
# They are removed when Chrome exits. For automation, log in with CDP
# enabled and LEAVE THE WINDOW OPEN, then run pnpm test:e2e (CDP attach).
#
# Modes:
#   login — clean login, no CDP (manual browsing; cookies may die on Exit)
#   e2e   — extension + CDP :9222 (use this for login + leave open + test:e2e)
#   ext   — extension, no CDP
#   debug — CDP only, about:blank
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
USER_DATA_DIR="${MOEGI_CHROME_USER_DATA:-$ROOT/e2e/.chrome-user-data}"
CHROME_BIN="${MOEGI_CHROME_BIN:-/usr/bin/google-chrome-stable}"
CDP_PORT="${MOEGI_CDP_PORT:-9222}"
PROFILE_DIR="Default"
MODE="${1:-e2e}"

if [[ ! -x "$CHROME_BIN" ]]; then
  echo "Chrome not found at: $CHROME_BIN" >&2
  exit 1
fi

mkdir -p "$USER_DATA_DIR"

if [[ -e "$USER_DATA_DIR/SingletonLock" ]] || [[ -e "$USER_DATA_DIR/SingletonSocket" ]]; then
  echo "ERROR: Profile is already in use: $USER_DATA_DIR" >&2
  echo "If that is your logged-in MoegiE2E window, leave it open and run:" >&2
  echo "  pnpm test:e2e" >&2
  echo "Otherwise close it fully and retry." >&2
  exit 1
fi

ARGS=(
  --user-data-dir="$USER_DATA_DIR"
  --profile-directory="$PROFILE_DIR"
  --no-first-run
  --no-default-browser-check
  --class=MoegiE2E
  --name=MoegiE2E
  --window-size=1280,720
)

with_cdp=0
with_ext=0
start_url="https://open.spotify.com"

case "$MODE" in
  login|default)
    start_url="https://open.spotify.com"
    ;;
  ext|extension)
    with_ext=1
    ;;
  debug)
    with_cdp=1
    start_url="about:blank"
    ;;
  e2e)
    # Preferred: login here, leave open, pnpm test:e2e attaches
    with_ext=1
    with_cdp=1
    start_url="${MOEGI_E2E_ALBUM:-https://open.spotify.com/album/0mYyY7YPeYMBWKms7lsO3C}"
    ;;
  *)
    echo "Usage: $0 [login|e2e|ext|debug]" >&2
    exit 1
    ;;
esac

if [[ "$with_ext" -eq 1 ]]; then
  EXT_DIR="$ROOT/.output/chrome-mv3"
  if [[ ! -d "$EXT_DIR" ]]; then
    echo "Extension missing: $EXT_DIR — run pnpm build" >&2
    exit 1
  fi
  # Branded Chrome 137+ ignores --load-extension. Worse: pairing it with
  # --disable-extensions-except hides *every* extension (including Load
  # unpacked) when CLI load fails — empty chrome://extensions.
  # Do not pass either flag on branded Chrome. Load once via:
  #   chrome://extensions → Developer mode → Load unpacked → EXT_DIR
  # That registration persists in this profile across restarts.
  echo "NOTE: Moegi must be Load unpacked (persists in this profile):"
  echo "      $EXT_DIR"
  echo "      Do not use --disable-extensions-except (it blanks the list)."
fi

if [[ "$with_cdp" -eq 1 ]]; then
  ARGS+=(--remote-debugging-port="$CDP_PORT")
  ARGS+=(--remote-debugging-address=127.0.0.1)
fi

ARGS+=("$start_url")

echo "Chrome binary : $CHROME_BIN"
echo "User data dir : $USER_DATA_DIR"
echo "Mode          : $MODE"
echo "Viewport hint : 1280x720"
if [[ "$with_cdp" -eq 1 ]]; then
  echo "CDP endpoint  : http://127.0.0.1:$CDP_PORT"
  echo ""
  echo ">>> Log into Spotify in this MoegiE2E window (avatar top-right)."
  echo ">>> Load unpacked once if needed: chrome://extensions → .output/chrome-mv3"
  echo ">>> Leave this window OPEN, then in another terminal:"
  echo "      pnpm e2e:verify-login   # CDP check (not disk cookies)"
  echo "      pnpm test:e2e           # smoke + option toggles"
  echo ">>> Do NOT Exit Chrome before test:e2e (session cookies die on exit)."
else
  echo "CDP           : off"
  echo ""
  echo "Session cookies often vanish after Exit. Prefer: pnpm e2e:chrome"
fi
echo ""

exec "$CHROME_BIN" "${ARGS[@]}"
