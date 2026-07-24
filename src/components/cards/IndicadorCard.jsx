import styles from './IndicadorCard.module.css'

const TREND_ICON = {
  up: '▲',
  down: '▼',
  stable: '▬',
}

const TREND_CLASS = {
  up: 'trendUp',
  down: 'trendDown',
  stable: 'trendStable',
}

/**
 * Displays a single indicator value: name, formatted value, unit, period
 * and source. Optionally shows a trend icon and supports a loading
 * skeleton state.
 *
 * @param {{
 *   nome: string,
 *   valor: number|null,
 *   unidade: string,
 *   periodo?: string,
 *   fonte?: string,
 *   trend?: 'up'|'down'|'stable',
 *   loading?: boolean,
 * }} props
 */
function IndicadorCard({ nome, valor, unidade, periodo, fonte, trend, loading = false }) {
  if (loading) {
    return (
      <div className={`${styles.card} ${styles.skeleton}`} aria-busy="true">
        <div className={styles.skeletonLine} style={{ width: '60%' }} />
        <div className={styles.skeletonLine} style={{ width: '40%', height: 28 }} />
        <div className={styles.skeletonLine} style={{ width: '80%' }} />
      </div>
    )
  }

  const valorFormatado = valor != null ? valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '—'

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.nome}>{nome}</span>
        {trend && (
          <span className={`${styles.trend} ${styles[TREND_CLASS[trend]]}`} title={`Tendência: ${trend}`}>
            {TREND_ICON[trend]}
          </span>
        )}
      </div>
      <div className={styles.valor}>
        {valorFormatado}
        {unidade && <span className={styles.unidade}>{unidade}</span>}
      </div>
      <div className={styles.footer}>
        {periodo && <span>{periodo}</span>}
        {fonte && <span className={styles.fonte}>{fonte.toUpperCase()}</span>}
      </div>
    </div>
  )
}

export default IndicadorCard
