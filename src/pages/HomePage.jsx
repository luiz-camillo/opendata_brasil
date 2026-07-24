import { Link } from 'react-router-dom'
import { API_SOURCES } from '../config/apiSources'
import { INDICADORES_IBGE } from '../config/indicators'
import styles from './HomePage.module.css'

const steps = [
  { icon: '🔍', title: 'Buscar', text: 'Encontre municípios brasileiros pelo nome.' },
  { icon: '✅', title: 'Selecionar', text: 'Escolha os indicadores públicos de interesse.' },
  { icon: '📊', title: 'Visualizar', text: 'Explore gráficos, tabelas e mapas interativos.' },
  { icon: '⬇️', title: 'Exportar', text: 'Baixe os dados em CSV ou JSON quando quiser.' },
]

const features = [
  {
    to: '/dashboard',
    icon: '📊',
    title: 'Dashboard',
    text: 'Visualize indicadores públicos em gráficos e painéis interativos.',
  },
  {
    to: '/explorer',
    icon: '🔍',
    title: 'Data Explorer',
    text: 'Explore conjuntos de dados abertos com filtros e tabelas dinâmicas.',
  },
  {
    to: '/comparacao',
    icon: '⚖️',
    title: 'Comparação',
    text: 'Compare dados entre estados, municípios e períodos.',
  },
  {
    to: '/api-info',
    icon: '🧩',
    title: 'API Info',
    text: 'Consulte a documentação e os endpoints disponíveis.',
  },
]

/**
 * HomePage is the landing page: hero, "how it works" steps, quick stats
 * and quick-access cards to the main features.
 */
function HomePage() {
  return (
    <div>
      <section className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">
          🇧🇷
        </span>
        <h1 className={styles.title}>OpenData Brasil</h1>
        <p className={styles.subtitle}>
          Uma plataforma para explorar, visualizar e comparar dados públicos
          brasileiros de forma simples, rápida e acessível.
        </p>
        <Link to="/dashboard" className={styles.cta}>
          Ir para o Dashboard
        </Link>
      </section>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>5.570+</span>
          <span className={styles.statLabel}>Municípios disponíveis</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{INDICADORES_IBGE.length}</span>
          <span className={styles.statLabel}>Indicadores mapeados</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{API_SOURCES.length}</span>
          <span className={styles.statLabel}>Fontes de dados</span>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Como funciona</h2>
        <div className={styles.stepsGrid}>
          {steps.map((step, index) => (
            <div key={step.title} className={styles.stepCard}>
              <span className={styles.stepNumber}>{index + 1}</span>
              <div className={styles.stepIcon} aria-hidden="true">
                {step.icon}
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Explore a plataforma</h2>
        <div className={styles.grid}>
          {features.map((feature) => (
            <Link key={feature.to} to={feature.to} className={styles.card}>
              <div className={styles.cardIcon} aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardText}>{feature.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
