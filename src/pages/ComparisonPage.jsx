import { useCallback, useEffect, useMemo, useState } from 'react'
import useConsulta from '../hooks/useConsulta'
import useComparacao from '../hooks/useComparacao'
import SearchAutocomplete from '../components/common/SearchAutocomplete'
import IndicadorSelector from '../components/forms/IndicadorSelector'
import PeriodoSelector from '../components/forms/PeriodoSelector'
import IndicadorCard from '../components/cards/IndicadorCard'
import ChartContainer from '../components/charts/ChartContainer'
import RadarChart from '../components/charts/RadarChart'
import EmptyState from '../components/common/EmptyState'
import ErrorBoundary from '../components/common/ErrorBoundary'
import styles from './ComparisonPage.module.css'

/**
 * ComparisonPage: two municipality selector columns, an indicator
 * selector and a "Comparar" button, wired to `useComparacao`. Shows
 * side-by-side indicator cards, a radar chart and a difference table.
 */
function ComparisonPage() {
  const { municipios, loading: buscaLoading, buscarMunicipios } = useConsulta()
  const {
    municipioA,
    municipioB,
    resultado,
    loading,
    error,
    setMunicipioA,
    setMunicipioB,
    comparar,
  } = useComparacao()

  const [municipioObjA, setMunicipioObjA] = useState(null)
  const [municipioObjB, setMunicipioObjB] = useState(null)
  const [indicadores, setIndicadores] = useState([])
  const [periodo, setPeriodo] = useState(null)

  const handleSelectA = useCallback(
    (municipio) => {
      setMunicipioObjA(municipio)
      setMunicipioA(municipio.id)
    },
    [setMunicipioA]
  )

  const handleSelectB = useCallback(
    (municipio) => {
      setMunicipioObjB(municipio)
      setMunicipioB(municipio.id)
    },
    [setMunicipioB]
  )

  const handleComparar = useCallback(() => {
    comparar(indicadores, periodo)
  }, [comparar, indicadores, periodo])

  useEffect(() => {
    if (municipioA != null && municipioB != null) {
      comparar(indicadores, periodo)
    }
  }, [municipioA, municipioB, indicadores, periodo, comparar])

  const podeComparar = municipioA != null && municipioB != null

  const radarData = useMemo(() => {
    if (!resultado || resultado.length === 0) return { labels: [], datasets: [] }
    return {
      labels: resultado.map((item) => item.indicador),
      datasets: [
        {
          label: municipioObjA?.nomeCompleto ?? 'Município A',
          data: resultado.map((item) => item.valorA ?? 0),
          borderColor: '#0d6b4f',
          backgroundColor: 'rgba(13, 107, 79, 0.2)',
        },
        {
          label: municipioObjB?.nomeCompleto ?? 'Município B',
          data: resultado.map((item) => item.valorB ?? 0),
          borderColor: '#f0a500',
          backgroundColor: 'rgba(240, 165, 0, 0.2)',
        },
      ],
    }
  }, [resultado, municipioObjA, municipioObjB])

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Comparação</h1>
      <p className={styles.subtitle}>
        Selecione dois municípios. A comparação dos indicadores principais será feita
        automaticamente; você pode adicionar indicadores extras abaixo.
      </p>

      <div className={styles.columns}>
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>Município A</h2>
          <SearchAutocomplete
            label=""
            placeholder="Buscar município A..."
            suggestions={municipios}
            loading={buscaLoading}
            onSearch={buscarMunicipios}
            onSelect={handleSelectA}
          />
          {municipioObjA && <p className={styles.selectedName}>{municipioObjA.nomeCompleto}</p>}
        </div>

        <div className={styles.column}>
          <h2 className={styles.columnTitle}>Município B</h2>
          <SearchAutocomplete
            label=""
            placeholder="Buscar município B..."
            suggestions={municipios}
            loading={buscaLoading}
            onSearch={buscarMunicipios}
            onSelect={handleSelectB}
          />
          {municipioObjB && <p className={styles.selectedName}>{municipioObjB.nomeCompleto}</p>}
        </div>
      </div>

      <div className={styles.extras}>
        <IndicadorSelector
          label="Indicadores extras (opcional)"
          selected={indicadores}
          onChange={setIndicadores}
        />
        <PeriodoSelector
          value={periodo}
          onChange={setPeriodo}
          selectedIndicadores={indicadores}
        />
      </div>

      <button
        type="button"
        className={styles.compareButton}
        onClick={handleComparar}
        disabled={!podeComparar || loading}
      >
        {loading ? 'Comparando...' : 'Comparar novamente'}
      </button>

      {error && <p className={styles.error}>{error}</p>}

      {!resultado && !loading && (
        <EmptyState icon="⚖️" title="Selecione dois municípios para comparar" />
      )}

      {resultado && resultado.length > 0 && (
        <>
          <ErrorBoundary
            fallback={(_err, reset) => (
              <EmptyState
                icon="⚠️"
                title="Seção indisponível"
                description="Não foi possível carregar os cartões de comparação."
                actionLabel="Tentar novamente"
                onAction={reset}
              />
            )}
          >
            <div className={styles.comparisonGrid}>
              <div className={styles.comparisonColumn}>
                <h3 className={styles.comparisonColumnTitle}>{municipioObjA?.nomeCompleto}</h3>
                {resultado.map((item) => (
                  <IndicadorCard
                    key={`a-${item.indicador}`}
                    nome={item.indicador}
                    valor={item.valorA}
                    unidade=""
                  />
                ))}
              </div>
              <div className={styles.comparisonColumn}>
                <h3 className={styles.comparisonColumnTitle}>{municipioObjB?.nomeCompleto}</h3>
                {resultado.map((item) => (
                  <IndicadorCard
                    key={`b-${item.indicador}`}
                    nome={item.indicador}
                    valor={item.valorB}
                    unidade=""
                  />
                ))}
              </div>
            </div>
          </ErrorBoundary>

          <ErrorBoundary
            fallback={(_err, reset) => (
              <EmptyState
                icon="⚠️"
                title="Seção indisponível"
                description="Não foi possível carregar o gráfico."
                actionLabel="Tentar novamente"
                onAction={reset}
              />
            )}
          >
            <ChartContainer title="Comparação multidimensional">
              <RadarChart data={radarData} />
            </ChartContainer>
          </ErrorBoundary>

          <section className={styles.diffTableSection}>
            <h2 className={styles.sectionTitle}>Diferenças</h2>
            <table className={styles.diffTable}>
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>{municipioObjA?.nomeCompleto ?? 'A'}</th>
                  <th>{municipioObjB?.nomeCompleto ?? 'B'}</th>
                  <th>Diferença</th>
                  <th>% Diferença</th>
                </tr>
              </thead>
              <tbody>
                {resultado.map((item) => {
                  const positivo = item.diferenca != null && item.diferenca > 0
                  const negativo = item.diferenca != null && item.diferenca < 0
                  return (
                    <tr key={item.indicador}>
                      <td>{item.indicador}</td>
                      <td>{item.valorA != null ? item.valorA.toLocaleString('pt-BR') : '—'}</td>
                      <td>{item.valorB != null ? item.valorB.toLocaleString('pt-BR') : '—'}</td>
                      <td className={positivo ? styles.positive : negativo ? styles.negative : ''}>
                        {item.diferenca != null ? item.diferenca.toLocaleString('pt-BR') : '—'}
                      </td>
                      <td className={positivo ? styles.positive : negativo ? styles.negative : ''}>
                        {item.diferencaPercentual != null
                          ? `${item.diferencaPercentual.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  )
}

export default ComparisonPage
