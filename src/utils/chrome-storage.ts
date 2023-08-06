type ChromeStorageType = 'local' | 'session' | 'sync'

class ChromeStorage {
  private storage: chrome.storage.StorageArea
  onChanged: chrome.storage.StorageArea['onChanged']

  constructor(type: ChromeStorageType) {
    this.storage = chrome.storage[type]
    this.onChanged = this.storage.onChanged
  }

  async get<T>(key: string): Promise<T> {
    return this.storage.get(key).then((result) => result[key])
  }

  async set<T>(obj: { [key: string]: T }) {
    return this.storage.set(obj)
  }

  async remove(key: string) {
    return this.storage.remove(key)
  }

  async clear() {
    return this.storage.clear()
  }
}

export default ChromeStorage;
