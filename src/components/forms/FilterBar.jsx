import MunicipioSelector from './MunicipioSelector'
import IndicadorSelector from './IndicadorSelector'
import PeriodoSelector from './PeriodoSelector'
import styles from './FilterBar.module.css'

/**
 * Combines MunicipioSelector + IndicadorSelector + a "Consultar" action
 * button, laid out horizontally on desktop and stacked on mobile.
 *
 * @param {{
 *   municipioSuggestions: import('../../models/Municipio').Municipio[],
 *   municipioLoading?: boolean,
 *   onSearchMunicipio: (query: string) => void,
 *   selectedMunicipios: import('../../models/Municipio').Municipio[],
 *   onAddMunicipio: (municipio: import('../../models/Municipio').Municipio) => void,
 *   onRemoveMunicipio: (id: number) => void,
 *   onClearMunicipios?: () => void,
 *   municipioMax?: number,
 *   singleMunicipio?: boolean,
 *   hideIndicadores?: boolean,
 *   selectedIndicadores: string[],
 *   onChangeIndicadores: (ids: string[]) => void,
 *   periodo?: string|null,
 *   onChangePeriodo?: (periodo: string|null) => void,
 *   onSubmit: () => void,
 *   submitting?: boolean,
 *   submitLabel?: string,
 * }} props
 */
function FilterBar({
  municipioSuggestions,
  municipioLoading = false,
  onSearchMunicipio,
  selectedMunicipios,
  onAddMunicipio,
  onRemoveMunicipio,
  onClearMunicipios,
  municipioMax = 2,
  singleMunicipio = false,
  hideIndicadores = false,
  selectedIndicadores,
  onChangeIndicadores,
  periodo,
  onChangePeriodo,
  onSubmit,
  submitting = false,
  submitLabel = 'Consultar',
}) {
  const disabled = hideIndicadores
    ? selectedMunicipios.length === 0
    : selectedMunicipios.length === 0 || selectedIndicadores.length === 0

  return (
    <div className={styles.bar}>
      <MunicipioSelector
        suggestions={municipioSuggestions}
        loading={municipioLoading}
        onSearch={onSearchMunicipio}
        selected={selectedMunicipios}
        onAdd={onAddMunicipio}
        onRemove={onRemoveMunicipio}
        onClear={onClearMunicipios}
        max={municipioMax}
        single={singleMunicipio}
      />

      {!hideIndicadores && (
        <IndicadorSelector selected={selectedIndicadores} onChange={onChangeIndicadores} />
      )}

      {!hideIndicadores && (
        <PeriodoSelector
          value={periodo}
          onChange={onChangePeriodo}
          selectedIndicadores={selectedIndicadores}
        />
      )}

      <button
        type="button"
        className={styles.submitButton}
        onClick={onSubmit}
        disabled={disabled || submitting}
      >
        {submitting ? 'Consultando...' : submitLabel}
      </button>
    </div>
  )
}

export default FilterBar
