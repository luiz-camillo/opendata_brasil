import { AlertTriangle, BarChart3 } from 'lucide-react'
import styles from './ChartContainer.module.css'
import Loading from '../common/Loading'
import EmptyState from '../common/EmptyState'

/**
 * Wraps any chart component, uniformly handling loading, error and
 * empty states around it.
 *
 * @param {{
 *   loading?: boolean,
 *   error?: string|null,
 *   empty?: boolean,
 *   title?: string,
 *   children: import('react').ReactNode,
 * }} props
 */
function ChartContainer({ loading = false, error = null, empty = false, title, children }) {
  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.body}>
        {loading && <Loading message="Carregando gráfico..." />}
        {!loading && error && (
          <EmptyState
            icon={<AlertTriangle size={48} strokeWidth={1.5} />}
            title="Erro ao carregar gráfico"
            description={error}
          />
        )}
        {!loading && !error && empty && (
          <EmptyState
            icon={<BarChart3 size={48} strokeWidth={1.5} />}
            title="Sem dados"
            description="Nenhum dado disponível para exibir."
          />
        )}
        {!loading && !error && !empty && children}
      </div>
    </div>
  )
}

export default ChartContainer
