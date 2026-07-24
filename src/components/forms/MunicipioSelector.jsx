import SearchAutocomplete from '../common/SearchAutocomplete'
import styles from './MunicipioSelector.module.css'

/**
 * Allows selecting up to `max` municipalities via `SearchAutocomplete`,
 * displaying the current selection as removable chips.
 *
 * @param {{
 *   suggestions: import('../../models/Municipio').Municipio[],
 *   loading?: boolean,
 *   onSearch: (query: string) => void,
 *   selected: import('../../models/Municipio').Municipio[],
 *   onAdd: (municipio: import('../../models/Municipio').Municipio) => void,
 *   onRemove: (id: number) => void,
 *   onClear?: () => void,
 *   max?: number,
 *   label?: string,
 * }} props
 */
function MunicipioSelector({
  suggestions,
  loading = false,
  onSearch,
  selected = [],
  onAdd,
  onRemove,
  onClear,
  max = 2,
  label = 'Municípios',
}) {
  const limitReached = selected.length >= max

  return (
    <div className={styles.container}>
      <div className={styles.searchRow}>
        <SearchAutocomplete
          label={label}
          placeholder={
            limitReached
              ? `Máximo de ${max} municípios selecionados`
              : 'Digite o nome do município...'
          }
          suggestions={suggestions}
          loading={loading}
          onSearch={onSearch}
          onSelect={(municipio) => {
            if (!limitReached && !selected.some((m) => m.id === municipio.id)) {
              onAdd?.(municipio)
            }
          }}
        />
      </div>

      {selected.length > 0 && (
        <div className={styles.chips}>
          {selected.map((municipio) => (
            <span key={municipio.id} className={styles.chip}>
              {municipio.nomeCompleto ?? `${municipio.nome} - ${municipio.estado?.sigla ?? ''}`}
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => onRemove?.(municipio.id)}
                aria-label={`Remover ${municipio.nome}`}
              >
                ✕
              </button>
            </span>
          ))}
          {onClear && (
            <button type="button" className={styles.clearAll} onClick={onClear}>
              Limpar tudo
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default MunicipioSelector
