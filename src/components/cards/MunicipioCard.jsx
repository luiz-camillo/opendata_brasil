import styles from './MunicipioCard.module.css'

/**
 * Summary card for a municipality: name, state, region, population, area
 * and density. Clickable for selection/navigation.
 *
 * @param {{
 *   municipio: import('../../models/Municipio').Municipio,
 *   onClick?: (municipio: import('../../models/Municipio').Municipio) => void,
 *   selected?: boolean,
 * }} props
 */
function MunicipioCard({ municipio, onClick, selected = false }) {
  const { nome, estado, regiao, populacao, area, densidadeDemografica } = municipio

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={() => onClick?.(municipio)}
    >
      <div className={styles.header}>
        <h3 className={styles.nome}>{nome}</h3>
        <span className={styles.uf}>{estado?.sigla}</span>
      </div>
      <p className={styles.regiao}>{regiao?.nome}</p>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>População</dt>
          <dd>{populacao != null ? populacao.toLocaleString('pt-BR') : '—'}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Área</dt>
          <dd>{area != null ? `${area.toLocaleString('pt-BR')} km²` : '—'}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Densidade</dt>
          <dd>
            {densidadeDemografica != null
              ? `${densidadeDemografica.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} hab/km²`
              : '—'}
          </dd>
        </div>
      </dl>
    </button>
  )
}

export default MunicipioCard
