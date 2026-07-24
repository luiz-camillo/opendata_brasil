import { useCallback, useEffect, useMemo, useState } from 'react'
import useConsulta from '../hooks/useConsulta'
import FilterBar from '../components/forms/FilterBar'
import IndicadorCard from '../components/cards/IndicadorCard'
import ChartContainer from '../components/charts/ChartContainer'
import BarChart from '../components/charts/BarChart'
import LineChart from '../components/charts/LineChart'
import BrazilMap from '../components/map/BrazilMap'
import EmptyState from '../components/common/EmptyState'
import ErrorBoundary from '../components/common/ErrorBoundary'
import styles from './DashboardPage.module.css'

const CORES = ['#0d6b4f', '#f0a500', '#2f6fed', '#d64545', '#7a3fd6']

/**
 * Builds Chart.js "Bar" data comparing every selected indicator across
 * the selected municipalities.
 * @param {import('../models/Dataset').Dataset|null} dataset
 * @returns {object}
 */
function buildBarData(dataset) {
  if (!dataset) return { labels: [], datasets: [] }
  const nomes = dataset.nomesIndicadores

  return {
    labels: nomes,
    datasets: dataset.municipios.map((municipio, index) => {
      const indicadores = dataset.filtrarPorMunicipio(municipio.id)
      return {
        label: municipio.nomeCompleto,
        data: nomes.map((nome) => indicadores.find((i) => i.nome === nome)?.valor ?? null),
        backgroundColor: CORES[index % CORES.length],
      }
    }),
  }
}

/**
 * Builds Chart.js "Line" data: one line per municipio/indicador pair,
 * plotted across the distinct periods present in the dataset.
 * @param {import('../models/Dataset').Dataset|null} dataset
 * @returns {object}
 */
function buildLineData(dataset) {
  if (!dataset) return { labels: [], datasets: [] }
  const periodos = [...new Set(dataset.indicadores.map((i) => i.periodo))].sort()

  const datasets = []
  let colorIndex = 0
  for (const municipio of dataset.municipios) {
    for (const nome of dataset.nomesIndicadores) {
      const indicadores = dataset
        .filtrarPorMunicipio(municipio.id)
        .filter((i) => i.nome === nome)
      datasets.push({
        label: `${municipio.nomeCompleto} — ${nome}`,
        data: periodos.map((periodo) => indicadores.find((i) => i.periodo === periodo)?.valor ?? null),
        borderColor: CORES[colorIndex % CORES.length],
        backgroundColor: CORES[colorIndex % CORES.length],
        tension: 0.3,
      })
      colorIndex += 1
    }
  }

  return { labels: periodos, datasets }
}

/**
 * DashboardPage: filter bar (municipality + indicator selection), a
 * card grid, bar/line charts and a map, all wired to `useConsulta`.
 */
function DashboardPage() {
  const {
    municipios,
    indicadores,
    selecionados,
    periodo,
    dataset,
    loading,
    error,
    buscarMunicipios,
    selecionarMunicipio,
    selecionarIndicadores,
    selecionarPeriodo,
    buscarDados,
  } = useConsulta()

  const [selectedMunicipioObjs, setSelectedMunicipioObjs] = useState([])

  useEffect(() => {
    setSelectedMunicipioObjs((atual) =>
      atual.filter((municipio) => selecionados.includes(municipio.id))
    )
  }, [selecionados])

  const handleAddMunicipio = useCallback(
    (municipio) => {
      selecionarMunicipio(municipio.id)
      setSelectedMunicipioObjs((atual) =>
        atual.some((m) => m.id === municipio.id) ? atual : [...atual, municipio]
      )
    },
    [selecionarMunicipio]
  )

  const handleRemoveMunicipio = useCallback(
    (id) => {
      selecionarMunicipio(id)
    },
    [selecionarMunicipio]
  )

  const barData = useMemo(() => buildBarData(dataset), [dataset])
  const lineData = useMemo(() => buildLineData(dataset), [dataset])

  const indicadoresPorMunicipio = useMemo(() => {
    if (!dataset) return {}
    return Object.fromEntries(
      dataset.municipios.map((municipio) => [
        municipio.id,
        dataset.filtrarPorMunicipio(municipio.id).map((i) => ({
          nome: i.nome,
          valor: i.valor,
          unidade: i.unidade,
        })),
      ])
    )
  }, [dataset])

  const hasData = Boolean(dataset) && dataset.indicadores.length > 0

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>
        Selecione municípios e indicadores para visualizar painéis e gráficos.
      </p>

      <FilterBar
        municipioSuggestions={municipios}
        municipioLoading={loading}
        onSearchMunicipio={buscarMunicipios}
        selectedMunicipios={selectedMunicipioObjs}
        onAddMunicipio={handleAddMunicipio}
        onRemoveMunicipio={handleRemoveMunicipio}
        municipioMax={5}
        selectedIndicadores={indicadores}
        onChangeIndicadores={selecionarIndicadores}
        periodo={periodo}
        onChangePeriodo={selecionarPeriodo}
        onSubmit={buscarDados}
        submitting={loading}
      />

      {error && <p className={styles.error}>{error}</p>}

      {!hasData && !loading && (
        <EmptyState
          icon="📊"
          title="Nenhum dado selecionado"
          description="Escolha ao menos um município e um indicador, depois clique em Consultar."
        />
      )}

      {hasData && (
        <>
          <ErrorBoundary fallback={() => <SectionError />}>
            <section className={styles.cardsGrid}>
              {dataset.indicadores.map((indicador) => (
                <IndicadorCard
                  key={indicador.id}
                  nome={`${indicador.nome} — ${
                    dataset.municipios.find((m) => m.id === indicador.municipioId)?.nomeCompleto ?? ''
                  }`}
                  valor={indicador.valor}
                  unidade={indicador.unidade}
                  periodo={indicador.periodo}
                  fonte={indicador.fonte}
                />
              ))}
            </section>
          </ErrorBoundary>

          <div className={styles.chartsGrid}>
            <ErrorBoundary fallback={() => <SectionError />}>
              <ChartContainer title="Comparação de indicadores" empty={barData.datasets.length === 0}>
                <BarChart data={barData} yLabel="Valor" />
              </ChartContainer>
            </ErrorBoundary>

            <ErrorBoundary fallback={() => <SectionError />}>
              <ChartContainer title="Série temporal" empty={lineData.labels.length <= 1}>
                <LineChart data={lineData} yLabel="Valor" />
              </ChartContainer>
            </ErrorBoundary>
          </div>

          <ErrorBoundary fallback={() => <SectionError />}>
            <section className={styles.mapSection}>
              <h2 className={styles.sectionTitle}>Mapa</h2>
              <BrazilMap
                municipios={dataset.municipios}
                indicadoresPorMunicipio={indicadoresPorMunicipio}
              />
            </section>
          </ErrorBoundary>
        </>
      )}
    </div>
  )
}

function SectionError(_error, reset) {
  return (
    <EmptyState
      icon="⚠️"
      title="Seção indisponível"
      description="Não foi possível carregar esta seção."
      actionLabel="Tentar novamente"
      onAction={reset}
    />
  )
}

export default DashboardPage
