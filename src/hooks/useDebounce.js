import { useEffect, useState } from 'react'

/**
 * Debounces a value: the returned value only updates after `delay`
 * milliseconds have passed without `value` changing again.
 * @template T
 * @param {T} value
 * @param {number} [delay]
 * @returns {T}
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
