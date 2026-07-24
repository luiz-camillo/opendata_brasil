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

const officialSources = [
  { name: 'IBGE', acronym: 'IBGE', description: 'Instituto Brasileiro de Geografia e Estatística', url: 'https://www.ibge.gov.br' },
  { name: 'IPEA', acronym: 'IPEA', description: 'Instituto de Pesquisa Econômica Aplicada', url: 'https://www.ipea.gov.br' },
  { name: 'DATASUS', acronym: 'DATASUS', description: 'Departamento de Informática do SUS', url: 'https://datasus.saude.gov.br' },
  { name: 'INEP', acronym: 'INEP', description: 'Instituto Nacional de Estudos e Pesquisas Educacionais', url: 'https://www.gov.br/inep' },
  { name: 'Tesouro Nacional', acronym: 'STN', description: 'Secretaria do Tesouro Nacional', url: 'https://www.tesourotransparente.gov.br' },
  { name: 'Portal da Transparência', acronym: 'CGU', description: 'Controladoria-Geral da União', url: 'https://www.portaltransparencia.gov.br' },
]

/**
 * HomePage is the institutional landing page for OpenData Brasil.
 * Hero, quick stats, how it works, feature cards, and official data sources.
 */
function HomePage() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroIcon} aria-hidden="true">
            🇧🇷
          </span>
          <h2 className={styles.heroBrand}>OpenData BRASIL</h2>
          <h1 className={styles.title}>Dados públicos do Brasil, ao seu alcance</h1>
          <p className={styles.subtitle}>
            Explore, compare e exporte informações oficiais sobre municípios,
            indicadores sociais, econômicos e territoriais em uma única plataforma.
          </p>
          <div className={styles.heroActions}>
            <Link to="/dashboard" className={styles.ctaPrimary}>
              Acessar o Dashboard
            </Link>
            <Link to="/explorer" className={styles.ctaSecondary}>
              Explorar dados
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.stats} aria-label="Estatísticas da plataforma">
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

      <section className={styles.section}>
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

      <section className={styles.section}>
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Fontes oficiais</h2>
        <p className={styles.sectionLead}>
          Dados integrados a partir de APIs públicas federais, garantindo transparência e confiabilidade.
        </p>
        <div className={styles.sourcesGrid}>
          {officialSources.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sourceCard}
              aria-label={`${source.name} - ${source.description} (abre em nova aba)`}
            >
              <span className={styles.sourceAcronym}>{source.acronym}</span>
              <span className={styles.sourceName}>{source.name}</span>
              <span className={styles.sourceDescription}>{source.description}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
