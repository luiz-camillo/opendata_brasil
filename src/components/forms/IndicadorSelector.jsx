import { useState } from 'react'
import { INDICADORES_IBGE } from '../../config/indicators'
import styles from './IndicadorSelector.module.css'

/**
 * Checkbox list of available indicators, sourced from
 * `config/indicators.js`, with select-all / deselect-all support and a
 * description tooltip on hover.
 *
 * @param {{ selected: string[], onChange: (ids: string[]) => void, label?: string }} props
 */
function IndicadorSelector({ selected = [], onChange, label = 'Indicadores' }) {
  const [hovered, setHovered] = useState(null)

  const allSelected = selected.length === INDICADORES_IBGE.length

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange?.(selected.filter((existing) => existing !== id))
    } else {
      onChange?.([...selected, id])
    }
  }

  const toggleAll = () => {
    onChange?.(allSelected ? [] : INDICADORES_IBGE.map((indicador) => indicador.id))
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <button type="button" className={styles.toggleAll} onClick={toggleAll}>
          {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
        </button>
      </div>

      <div className={styles.list}>
        {INDICADORES_IBGE.map((indicador) => (
          <label
            key={indicador.id}
            className={styles.item}
            onMouseEnter={() => setHovered(indicador.id)}
            onMouseLeave={() => setHovered(null)}
            title={`${indicador.nome} (${indicador.unidade})`}
          >
            <input
              type="checkbox"
              checked={selected.includes(indicador.id)}
              onChange={() => toggle(indicador.id)}
            />
            <span>{indicador.nome}</span>
            {hovered === indicador.id && (
              <span className={styles.unit}>{indicador.unidade}</span>
            )}
          </label>
        ))}
      </div>
    </div>
  )
}

export default IndicadorSelector
