import { BarChart3 } from 'lucide-react'
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
 * DashboardPage: select a single municipality and view its main IBGE
 * indicators (population, area, density, GDP per capita, etc.).
 */
function DashboardPage() {
  const {
    municipios,
    selecionados,
    dataset,
    loading,
    error,
    buscarMunicipios,
    definirMunicipioUnico,
    removerMunicipio,
    buscarDadosDashboard,
    INDICADORES_DASHBOARD_PADRAO,
  } = useConsulta()

  const [selectedMunicipioObjs, setSelectedMunicipioObjs] = useState([])

  useEffect(() => {
    setSelectedMunicipioObjs((atual) =>
      atual.filter((municipio) => selecionados.includes(municipio.id))
    )
  }, [selecionados])

  const handleAddMunicipio = useCallback(
    (municipio) => {
      definirMunicipioUnico(municipio)
      setSelectedMunicipioObjs([municipio])
    },
    [definirMunicipioUnico]
  )

  const handleRemoveMunicipio = useCallback(
    (id) => {
      removerMunicipio(id)
      setSelectedMunicipioObjs((atual) => atual.filter((m) => m.id !== id))
    },
    [removerMunicipio]
  )

  const handleSubmit = useCallback(() => {
    buscarDadosDashboard()
  }, [buscarDadosDashboard])

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
        Selecione um município para visualizar seus principais indicadores.
      </p>

      <FilterBar
        municipioSuggestions={municipios}
        onSearchMunicipio={buscarMunicipios}
        selectedMunicipios={selectedMunicipioObjs}
        onAddMunicipio={handleAddMunicipio}
        onRemoveMunicipio={handleRemoveMunicipio}
        onClearMunicipios={() => handleRemoveMunicipio(selectedMunicipioObjs[0]?.id)}
        singleMunicipio
        hideIndicadores
        onSubmit={handleSubmit}
        submitting={loading}
      />

      {error && <p className={styles.error}>{error}</p>}

      {!hasData && !loading && (
        <EmptyState
          icon={<BarChart3 size={48} strokeWidth={1.5} />}
          title="Nenhum dado selecionado"
          description="Escolha um município e clique em Consultar."
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
      title="Seção indisponível"
      description="Não foi possível carregar esta seção."
      actionLabel="Tentar novamente"
      onAction={reset}
    />
  )
}

export default DashboardPage
