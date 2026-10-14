
export class TTLCache {
  constructor(ttlMs, maxEntries = 500) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key); 
      return undefined;
    }
    return entry.value;
  }

  set(key, value) {
    this.store.delete(key);
    if (this.store.size >= this.maxEntries) {
      this.store.delete(this.store.keys().next().value);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
