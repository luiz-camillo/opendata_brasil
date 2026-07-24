import { useEffect, useState } from 'react'
import { API_SOURCES } from '../config/apiSources'
import { IbgeService } from '../services/api/IbgeService'
import StatusBadge from '../components/common/StatusBadge'
import styles from './ApiInfoPage.module.css'

const SERVICES_BY_ID = {
  ibge: () => new IbgeService(),
}

/**
 * ApiInfoPage lists all registered data sources (from
 * `config/apiSources.js`) and auto-checks each one's live health status
 * via its `checkHealth()` method on mount.
 */
function ApiInfoPage() {
  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(API_SOURCES.map((source) => [source.id, 'checking']))
  )

  useEffect(() => {
    let ativo = true

    API_SOURCES.forEach(async (source) => {
      const criarServico = SERVICES_BY_ID[source.id]
      if (!criarServico) return

      const servico = criarServico()
      try {
        const ok = await servico.checkHealth()
        if (ativo) {
          setStatuses((atual) => ({ ...atual, [source.id]: ok ? 'online' : 'offline' }))
        }
      } catch {
        if (ativo) {
          setStatuses((atual) => ({ ...atual, [source.id]: 'offline' }))
        }
      }
    })

    return () => {
      ativo = false
    }
  }, [])

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Fontes de Dados</h1>
      <p className={styles.subtitle}>
        Origem, documentação e status ao vivo de cada fonte de dados públicos utilizada pela plataforma.
      </p>

      <div className={styles.list}>
        {API_SOURCES.map((source) => (
          <article key={source.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{source.nome}</h2>
              <StatusBadge status={statuses[source.id] ?? 'checking'} />
            </div>

            <p className={styles.cardDescription}>{source.descricao}</p>

            <dl className={styles.details}>
              <div className={styles.detailItem}>
                <dt>Órgão responsável</dt>
                <dd>{source.orgao}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Frequência de atualização</dt>
                <dd>{source.frequencia}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Formato</dt>
                <dd>{source.formato}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Suporte a CORS</dt>
                <dd>{source.cors ? 'Sim' : 'Não'}</dd>
              </div>
            </dl>

            <a
              className={styles.docLink}
              href={source.documentacao}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver documentação oficial ↗
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ApiInfoPage
