/**
 * Structured error thrown by data source services whenever a request
 * fails. Carries enough context (status code, source, endpoint) to allow
 * callers to decide whether the failure is retryable or should be
 * surfaced to the user.
 */
export class ApiError extends Error {
  /**
   * @param {{ message: string, statusCode?: number|null, source: string, endpoint: string, retryable?: boolean }} params
   */
  constructor({ message, statusCode = null, source, endpoint, retryable = false }) {
    super(message)
    this.name = 'ApiError'
    /** @type {number|null} */
    this.statusCode = statusCode
    /** @type {string} */
    this.source = source
    /** @type {string} */
    this.endpoint = endpoint
    /** @type {boolean} */
    this.retryable = retryable
  }
}

export default ApiError
