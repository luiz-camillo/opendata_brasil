import { memo } from 'react'
import SearchAutocomplete from '../common/SearchAutocomplete'
import { X } from 'lucide-react'
import styles from './MunicipioSelector.module.css'

/**
 * Allows selecting municipalities via `SearchAutocomplete`, displaying the
 * current selection as removable chips. When `single` is true only one
 * municipality is kept (the previous one is replaced).
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
 *   single?: boolean,
 *   label?: string,
 * }} props
 */
function MunicipioSelectorInner({
  suggestions,
  loading = false,
  onSearch,
  selected = [],
  onAdd,
  onRemove,
  onClear,
  max = 2,
  single = false,
  label = 'Municípios',
}) {
  const limitReached = single ? selected.length >= 1 : selected.length >= max

  const handleAdd = (municipio) => {
    if (selected.some((m) => m.id === municipio.id)) return
    onAdd?.(municipio)
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchRow}>
        <SearchAutocomplete
          label={label}
          placeholder={
            limitReached
              ? single
                ? 'Município já selecionado'
                : `Máximo de ${max} municípios selecionados`
              : 'Digite o nome do município...'
          }
          suggestions={suggestions}
          loading={loading}
          onSearch={onSearch}
          onSelect={(municipio) => {
            if (!limitReached) {
              handleAdd(municipio)
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
                <X size={14} strokeWidth={2} />
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

const MunicipioSelector = memo(MunicipioSelectorInner)

export default MunicipioSelector
