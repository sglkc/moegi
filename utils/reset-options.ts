import { moegiDefaultOptions, MoegiOptions } from './options'

export interface OptionsPersister {
  setValue: (value: MoegiOptions) => void | Promise<void>
}

/**
 * Reset reactive options object to factory defaults and persist.
 * Nested objects are deep-cloned so target and storage do not share references.
 */
export async function resetOptionsToDefaults(
  target: MoegiOptions,
  persister: OptionsPersister,
): Promise<MoegiOptions> {
  const defaults = structuredClone(moegiDefaultOptions) as MoegiOptions

  for (const key of Object.keys(defaults) as (keyof MoegiOptions)[]) {
    // Deep clone each section onto the live options object
    Object.assign(target, { [key]: structuredClone(defaults[key]) })
  }

  const toPersist = structuredClone(defaults)
  await persister.setValue(toPersist)
  return toPersist
}
