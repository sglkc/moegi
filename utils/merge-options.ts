import { moegiDefaultOptions, MoegiOptions } from './options'

/** Merge stored sections into a live options object without replacing whole sections. */
export function mergeStoredOptions(
  target: MoegiOptions,
  stored: Partial<MoegiOptions> | null | undefined,
): void {
  if (!stored) return
  for (const key of Object.keys(moegiDefaultOptions) as (keyof MoegiOptions)[]) {
    const section = stored[key]
    if (section && typeof section === 'object') {
      Object.assign(target[key] as object, section)
    }
  }
}
