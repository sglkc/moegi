export const optionsStorage = storage.defineItem('sync:moegiOptions', {
  init: () => moegiDefaultOptions,
  version: 1,
})
