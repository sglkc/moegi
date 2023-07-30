async function get<T>(key: string): Promise<T> {
  return chrome.storage.sync.get(key).then((result) => result[key])
}

async function set<T>(obj: { [key: string]: T }) {
  return chrome.storage.sync.set(obj)
}

async function remove(key: string) {
  return chrome.storage.sync.remove(key)
}

async function clear() {
  return chrome.storage.sync.clear()
}

const syncStorage = { get, set, remove, clear }

export default syncStorage
