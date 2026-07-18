/**
 * Sanitize values before interpolating into injected <style> CSS.
 * Reject anything that could break out of a property value context.
 */

const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const RGB = /^rgba?\(\s*[\d.]+%?(?:\s*,\s*[\d.]+%?){2,3}\s*\)$/
const HSL = /^hsla?\(\s*[\d.]+(?:\s*,\s*[\d.]+%){2}(?:\s*,\s*[\d.]+%?)?\s*\)$/
const KEYWORDS = new Set([
  'inherit',
  'transparent',
  'currentcolor',
  'initial',
  'unset',
])

/** Safe CSS color for property values, or fallback when invalid/empty. */
export function safeCssColor(value: string | undefined | null, fallback = 'inherit'): string {
  if (value == null) return fallback
  const trimmed = value.trim()
  if (!trimmed) return fallback

  const lower = trimmed.toLowerCase()
  if (KEYWORDS.has(lower)) return lower
  if (HEX.test(trimmed)) return trimmed
  if (RGB.test(trimmed) || HSL.test(trimmed)) return trimmed

  return fallback
}

const ALIGN = new Set(['left', 'center', 'right'])

export function safeTextAlign(value: string | undefined | null, fallback: 'left' | 'center' | 'right' = 'left'): 'left' | 'center' | 'right' {
  if (value && ALIGN.has(value)) return value as 'left' | 'center' | 'right'
  return fallback
}

/** Finite number suitable for CSS length components (no units). */
export function safeCssNumber(value: number | undefined | null, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return value
}
