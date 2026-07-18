#!/usr/bin/env bash
# Launch a project-local Google Chrome profile for Moegi Spotify e2e.
# You log into Spotify in this window; session stays under e2e/.chrome-user-data (gitignored).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
USER_DATA_DIR="${MOEGI_CHROME_USER_DATA:-$ROOT/e2e/.chrome-user-data}"
CHROME_BIN="${MOEGI_CHROME_BIN:-/usr/bin/google-chrome-stable}"
CDP_PORT="${MOEGI_CDP_PORT:-9222}"
PROFILE_DIR="Default"

# Modes: default | ext | debug
MODE="${1:-default}"

if [[ ! -x "$CHROME_BIN" ]]; then
  echo "Chrome not found at: $CHROME_BIN" >&2
  echo "Set MOEGI_CHROME_BIN to your google-chrome binary." >&2
  exit 1
fi

mkdir -p "$USER_DATA_DIR"

ARGS=(
  --user-data-dir="$USER_DATA_DIR"
  --profile-directory="$PROFILE_DIR"
  --no-first-run
  --no-default-browser-check
  --disable-sync
  --remote-debugging-port="$CDP_PORT"
  # Isolate from any other Chrome using the default singleton lock
  --remote-debugging-address=127.0.0.1
)

case "$MODE" in
  default|login)
    ARGS+=("https://open.spotify.com")
    ;;
  ext|extension)
    EXT_DIR="$ROOT/.output/chrome-mv3"
    if [[ ! -d "$EXT_DIR" ]]; then
      echo "Extension build missing: $EXT_DIR" >&2
      echo "Run: pnpm build" >&2
      exit 1
    fi
    ARGS+=(--disable-extensions-except="$EXT_DIR")
    ARGS+=(--load-extension="$EXT_DIR")
    ARGS+=("https://open.spotify.com")
    ;;
  debug)
    # Profile only; no forced URL (you navigate). CDP still on.
    ARGS+=("about:blank")
    ;;
  *)
    echo "Usage: $0 [default|ext|debug]" >&2
    exit 1
    ;;
esac

echo "Chrome binary : $CHROME_BIN"
echo "User data dir : $USER_DATA_DIR"
echo "CDP endpoint  : http://127.0.0.1:$CDP_PORT"
echo "Mode          : $MODE"
echo ""
echo "Log into Spotify in this window if needed, then leave the profile as-is for e2e."
echo ""

exec "$CHROME_BIN" "${ARGS[@]}"
