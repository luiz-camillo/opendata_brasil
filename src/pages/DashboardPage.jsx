import styles from './DashboardPage.module.css'

/**
 * DashboardPage will host charts and summary widgets built from open data.
 * Currently a placeholder pending data integration.
 */
function DashboardPage() {
  return (
    <div className={styles.placeholder}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>
        Painéis e gráficos de indicadores públicos em breve.
      </p>
    </div>
  )
}

export default DashboardPage
