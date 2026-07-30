import { memo, useCallback, useEffect, useId, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'
import styles from './SearchAutocomplete.module.css'

const MAX_SUGESTOES = 10

/**
 * Text input with debounced, keyboard-navigable autocomplete suggestions
 * for Brazilian municipalities. The search loading state is kept internal
 * so typing does not re-render parent layouts (e.g. footer flicker).
 *
 * @param {{
 *   onSelect: (municipio: import('../../models/Municipio').Municipio) => void,
 *   onSearch: (query: string) => Promise<void>|void,
 *   suggestions?: import('../../models/Municipio').Municipio[],
 *   loading?: boolean,
 *   placeholder?: string,
 *   label?: string,
 * }} props
 */
function SearchAutocompleteInner({
  onSelect,
  onSearch,
  suggestions = [],
  loading: externalLoading = false,
  placeholder = 'Buscar município...',
  label = 'Município',
}) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [internalLoading, setInternalLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const inputId = useId()
  const justSelectedRef = useRef(false)

  const loading = externalLoading || internalLoading
  const visibleSuggestions = suggestions.slice(0, MAX_SUGESTOES)

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false
      return
    }
    if (debouncedQuery.trim().length >= 2 && typeof onSearch === 'function') {
      setInternalLoading(true)
      Promise.resolve(onSearch(debouncedQuery.trim())).finally(() => {
        setInternalLoading(false)
      })
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
    setActiveIndex(-1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback(
    (municipio) => {
      justSelectedRef.current = true
      onSelect?.(municipio)
      setQuery('')
      setIsOpen(false)
      setActiveIndex(-1)
      inputRef.current?.focus()
    },
    [onSelect]
  )

  const handleKeyDown = useCallback(
    (event) => {
      if (!isOpen || visibleSuggestions.length === 0) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((current) => (current + 1) % visibleSuggestions.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((current) =>
          current <= 0 ? visibleSuggestions.length - 1 : current - 1
        )
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const escolhido = visibleSuggestions[activeIndex] ?? visibleSuggestions[0]
        if (escolhido) handleSelect(escolhido)
      } else if (event.key === 'Escape') {
        setIsOpen(false)
      }
    },
    [isOpen, visibleSuggestions, activeIndex, handleSelect]
  )

  const handleClear = useCallback(() => {
    setQuery('')
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }, [])

  return (
    <div className={styles.container} ref={containerRef}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <span className={styles.inputIcon} aria-hidden="true">
          <Search size={16} strokeWidth={2} />
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (visibleSuggestions.length > 0) setIsOpen(true)
          }}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${inputId}-listbox`}
          autoComplete="off"
        />
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        {!loading && query && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Limpar busca"
          >
            <X size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {isOpen && (
        <ul className={styles.suggestions} id={`${inputId}-listbox`} role="listbox">
          {visibleSuggestions.length === 0 && !loading && (
            <li className={styles.noResults}>Nenhum município encontrado</li>
          )}
          {visibleSuggestions.map((municipio, index) => (
            <li
              key={municipio.id}
              role="option"
              aria-selected={index === activeIndex}
              className={
                index === activeIndex
                  ? `${styles.suggestion} ${styles.suggestionActive}`
                  : styles.suggestion
              }
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(municipio)}
            >
              {municipio.nomeCompleto ?? `${municipio.nome} - ${municipio.estado?.sigla ?? ''}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const SearchAutocomplete = memo(SearchAutocompleteInner)

export default SearchAutocomplete
