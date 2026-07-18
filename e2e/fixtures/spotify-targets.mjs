/**
 * Hard-coded Spotify targets for reproducible live e2e.
 * Album: kobasolo — Collection 2
 * Track: Futari Goto feat.Harutya (always has JP lyrics)
 */
export const VIEWPORT = { width: 1280, height: 720 }

export const ALBUM_ID = '0mYyY7YPeYMBWKms7lsO3C'
export const TRACK_ID = '19zAFabO8MYfjtkLFbgBIX'

export const ALBUM_URL = `https://open.spotify.com/album/${ALBUM_ID}`
export const TRACK_URL = `https://open.spotify.com/track/${TRACK_ID}`
/** Direct lyrics route once something is in the player */
export const LYRICS_URL = 'https://open.spotify.com/lyrics'

/** 0-based index among non-empty Moegi original-lyric slots */
export const ANCHOR_LINE_INDEX = 0

/**
 * Expected original lyric text at ANCHOR_LINE_INDEX for TRACK_ID.
 * Update if Spotify edits licensed lyric text.
 */
export const ANCHOR_ORIGINAL_TEXT = '今からお前に何話そうかな'

/** Loose romaji check after enabling romanization (Hepburn-ish) */
export const ANCHOR_ROMANIZED_RE = /ima|omae|hanas|nan/i

/** Unpacked extension ID is path-derived and stable for this machine path */
export const DEFAULT_EXTENSION_ID = 'npfkbpalllbfopbmbocghbmkmmkephlf'
