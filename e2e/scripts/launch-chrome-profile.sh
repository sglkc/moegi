#!/usr/bin/env bash
# Launch a project-local Google Chrome profile for Moegi Spotify e2e.
#
# Modes:
#   login   — clean profile for manual Spotify sign-in (NO remote debugging)
#   default — alias for login
#   ext     — login profile + load unpacked Moegi (still no CDP)
#   debug   — same profile WITH remote debugging (use only AFTER login works)
#   e2e     — profile + extension + CDP (for attach/automation)
#
# Spotify will not keep sp_dc if you only ever open this profile with heavy
# automation flags, or if a second Chrome steals a temporary copy of the profile.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
USER_DATA_DIR="${MOEGI_CHROME_USER_DATA:-$ROOT/e2e/.chrome-user-data}"
CHROME_BIN="${MOEGI_CHROME_BIN:-/usr/bin/google-chrome-stable}"
CDP_PORT="${MOEGI_CDP_PORT:-9222}"
PROFILE_DIR="Default"
MODE="${1:-login}"

if [[ ! -x "$CHROME_BIN" ]]; then
  echo "Chrome not found at: $CHROME_BIN" >&2
  echo "Set MOEGI_CHROME_BIN to your google-chrome binary." >&2
  exit 1
fi

mkdir -p "$USER_DATA_DIR"

# Refuse to start if this profile is already running (avoids throwaway temp profiles)
if [[ -e "$USER_DATA_DIR/SingletonLock" ]] || [[ -e "$USER_DATA_DIR/SingletonSocket" ]]; then
  echo "ERROR: Chrome profile appears locked (already running):" >&2
  echo "  $USER_DATA_DIR" >&2
  echo "Close that Chrome window fully, then retry. Logging into a *second*" >&2
  echo "instance often uses a temporary profile that discards cookies on exit." >&2
  exit 1
fi

ARGS=(
  --user-data-dir="$USER_DATA_DIR"
  --profile-directory="$PROFILE_DIR"
  --no-first-run
  --no-default-browser-check
  # Distinct WM class so you can tell this window apart from daily Chrome
  --class=MoegiE2E
  --name=MoegiE2E
)

# Optional CDP — NOT enabled for plain login (Spotify/session reliability)
with_cdp=0
with_ext=0
start_url="https://open.spotify.com"

case "$MODE" in
  login|default)
    # Cleanest path for credential persistence
    ;;
  ext|extension)
    with_ext=1
    ;;
  debug)
    with_cdp=1
    start_url="about:blank"
    ;;
  e2e)
    with_ext=1
    with_cdp=1
    start_url="${MOEGI_E2E_ALBUM:-https://open.spotify.com/album/0mYyY7YPeYMBWKms7lsO3C}"
    ;;
  *)
    echo "Usage: $0 [login|ext|debug|e2e]" >&2
    exit 1
    ;;
esac

if [[ "$with_ext" -eq 1 ]]; then
  EXT_DIR="$ROOT/.output/chrome-mv3"
  if [[ ! -d "$EXT_DIR" ]]; then
    echo "Extension build missing: $EXT_DIR" >&2
    echo "Run: pnpm build" >&2
    exit 1
  fi
  ARGS+=(--disable-extensions-except="$EXT_DIR")
  ARGS+=(--load-extension="$EXT_DIR")
fi

if [[ "$with_cdp" -eq 1 ]]; then
  ARGS+=(--remote-debugging-port="$CDP_PORT")
  ARGS+=(--remote-debugging-address=127.0.0.1)
fi

ARGS+=("$start_url")

echo "Chrome binary : $CHROME_BIN"
echo "User data dir : $USER_DATA_DIR"
echo "Mode          : $MODE"
if [[ "$with_cdp" -eq 1 ]]; then
  echo "CDP endpoint  : http://127.0.0.1:$CDP_PORT"
else
  echo "CDP           : off (good for first-time Spotify login)"
fi
echo ""
echo "Look for window class/name MoegiE2E. Top-right must show your avatar, not Log in."
echo "When finished logging in: quit Chrome completely (Ctrl+Shift+Q or menu → Exit)."
echo "Then run:  pnpm e2e:verify-login"
echo ""

exec "$CHROME_BIN" "${ARGS[@]}"
