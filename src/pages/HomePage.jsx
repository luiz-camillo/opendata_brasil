import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

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
 * HomePage is the landing page: a brief introduction to the app plus
 * quick-access cards to the main features.
 */
function HomePage() {
  return (
    <div>
      <section className={styles.hero}>
        <h1 className={styles.title}>OpenData Brasil</h1>
        <p className={styles.subtitle}>
          Uma plataforma para explorar, visualizar e comparar dados públicos
          brasileiros de forma simples, rápida e acessível.
        </p>
      </section>

      <div className={styles.grid}>
        {features.map((feature) => (
          <Link key={feature.to} to={feature.to} className={styles.card}>
            <div className={styles.cardIcon} aria-hidden="true">
              {feature.icon}
            </div>
            <h2 className={styles.cardTitle}>{feature.title}</h2>
            <p className={styles.cardText}>{feature.text}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage
