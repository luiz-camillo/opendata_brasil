/**
 * Generic wrapper for successful responses returned by any data source
 * service. Keeps track of where the data came from, when it was fetched,
 * and whether it was served from cache.
 */
export class ApiResponse {
  /**
   * @param {{ data: any, source: string, timestamp?: Date, cached?: boolean }} params
   */
  constructor({ data, source, timestamp = new Date(), cached = false }) {
    /** @type {any} */
    this.data = data
    /** @type {string} */
    this.source = source
    /** @type {Date} */
    this.timestamp = timestamp
    /** @type {boolean} */
    this.cached = cached
  }
}

export default ApiResponse
