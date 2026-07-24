import { openDB } from 'idb'

const DB_NAME = 'opendata-brasil'
const DB_VERSION = 1
const STORE_NAME = 'cache'
const PREFERENCES_PREFIX = 'opendata-brasil:pref:'
const LAST_CONSULTA_KEY = 'opendata-brasil:ultima-consulta'

export const TTL_MINUTES = {
  CENSO: 1440,
  PADRAO: 360,
}

/**
 * @returns {Promise<import('idb').IDBPDatabase>}
 */
function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    },
  })
}

/**
 * Abstracts persistence for the application: user preferences live in
 * `localStorage`, while heavier, TTL-bound dataset cache lives in
 * IndexedDB (via the `idb` library).
 */
export class StorageService {
  /**
   * Reads a user preference from localStorage.
   * @param {string} key
   * @param {any} [defaultValue]
   * @returns {any}
   */
  getPreference(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(PREFERENCES_PREFIX + key)
      return raw != null ? JSON.parse(raw) : defaultValue
    } catch {
      return defaultValue
    }
  }

  /**
   * Persists a user preference to localStorage.
   * @param {string} key
   * @param {any} value
   * @returns {void}
   */
  setPreference(key, value) {
    localStorage.setItem(PREFERENCES_PREFIX + key, JSON.stringify(value))
  }

  /**
   * Removes a user preference from localStorage.
   * @param {string} key
   * @returns {void}
   */
  removePreference(key) {
    localStorage.removeItem(PREFERENCES_PREFIX + key)
  }

  /**
   * Reads a cached entry from IndexedDB, returning null when missing or
   * expired (expired entries are also removed as a side effect).
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async getCachedData(key) {
    const db = await getDb()
    const entrada = await db.get(STORE_NAME, key)

    if (!entrada) return null

    if (entrada.expiresAt < Date.now()) {
      await db.delete(STORE_NAME, key)
      return null
    }

    return entrada.data
  }

  /**
   * Stores a value in IndexedDB with a time-to-live.
   * @param {string} key
   * @param {any} data
   * @param {number} [ttlMinutes]
   * @returns {Promise<void>}
   */
  async setCachedData(key, data, ttlMinutes = TTL_MINUTES.PADRAO) {
    const db = await getDb()
    await db.put(STORE_NAME, {
      key,
      data,
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    })
  }

  /**
   * Removes all expired entries from the IndexedDB cache.
   * @returns {Promise<void>}
   */
  async clearExpired() {
    const db = await getDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const agora = Date.now()

    let cursor = await tx.store.openCursor()
    while (cursor) {
      if (cursor.value.expiresAt < agora) {
        await cursor.delete()
      }
      cursor = await cursor.continue()
    }

    await tx.done
  }

  /**
   * Clears the entire IndexedDB cache store.
   * @returns {Promise<void>}
   */
  async clearAll() {
    const db = await getDb()
    await db.clear(STORE_NAME)
  }

  /**
   * Saves the last query performed by the user.
   * @param {import('../../models/Consulta').Consulta} consulta
   * @returns {Promise<void>}
   */
  async salvarUltimaConsulta(consulta) {
    localStorage.setItem(LAST_CONSULTA_KEY, JSON.stringify(consulta.toJSON()))
  }

  /**
   * Restores the last query performed by the user, or null when none
   * was saved yet.
   * @returns {Promise<{ municipios: number[], indicadores: string[], periodo: string|null, dataInicio: string|null, dataFim: string|null }|null>}
   */
  async recuperarUltimaConsulta() {
    try {
      const raw = localStorage.getItem(LAST_CONSULTA_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }
}

export default StorageService
