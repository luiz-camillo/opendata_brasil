import { INDICADORES_IBGE } from '../../config/indicators'
import styles from './PeriodoSelector.module.css'

const ANO_MINIMO = 2000
const ANO_MAXIMO = new Date().getFullYear()

function gerarAnos() {
  const anos = []
  for (let ano = ANO_MAXIMO; ano >= ANO_MINIMO; ano -= 1) {
    anos.push(String(ano))
  }
  return anos
}

/**
 * Year selector shown only when at least one selected indicator supports
 * period selection.
 *
 * @param {{ value: string|null, onChange: (ano: string|null) => void, selectedIndicadores: string[] }} props
 */
function PeriodoSelector({ value, onChange, selectedIndicadores }) {
  const suportaPeriodo = selectedIndicadores.some((id) =>
    INDICADORES_IBGE.find((i) => i.id === id)?.suportaPeriodo
  )

  if (!suportaPeriodo) {
    return null
  }

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="periodo">Ano</label>
      <select
        id="periodo"
        className={styles.select}
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value || null)}
      >
        <option value="">Último disponível</option>
        {gerarAnos().map((ano) => (
          <option key={ano} value={ano}>
            {ano}
          </option>
        ))}
      </select>
    </div>
  )
}

export default PeriodoSelector
