import { updatedDiff } from 'deep-object-diff'
import { DeepKeys, getDeepKeys } from './deep-keys'
import { MoegiOptions } from './options'

/** Sections content scripts need on a full re-apply (SW cold start / first message). */
export const FULL_OPTION_CHANGE_KEYS = [
  'fonts',
  'colors',
  'translation',
  'romanization',
  'translation.enabled',
  'translation.size',
  'translation.target',
  'romanization.enabled',
  'romanization.size',
  'romanization.chinese',
  'romanization.cyrillic',
  'romanization.japanese',
  'romanization.korean',
] as DeepKeys<MoegiOptions>[]

/**
 * Diff previous options against next. First call (no baseline) returns a full
 * change set so the first popup notify after SW wake is not dropped.
 */
export function diffOptionChanges(
  previous: MoegiOptions | undefined,
  next: MoegiOptions,
): DeepKeys<MoegiOptions>[] {
  if (!previous) return [...FULL_OPTION_CHANGE_KEYS]
  const updates = updatedDiff(previous, next) as Record<string, unknown>
  if (!updates || Object.keys(updates).length === 0) return []
  return getDeepKeys(updates) as DeepKeys<MoegiOptions>[]
}
