import { useCallback, useEffect, useMemo, useState } from 'react'
import useConsulta from '../hooks/useConsulta'
import FilterBar from '../components/forms/FilterBar'
import DataTable from '../components/tables/DataTable'
import EmptyState from '../components/common/EmptyState'
import ErrorBoundary from '../components/common/ErrorBoundary'
import styles from './DataExplorerPage.module.css'

const COLUMNS = [
  { key: 'municipio', label: 'Município' },
  { key: 'estado', label: 'UF' },
  { key: 'indicador', label: 'Indicador' },
  { key: 'periodo', label: 'Período' },
  {
    key: 'valor',
    label: 'Valor',
    format: (value) => (value != null ? Number(value).toLocaleString('pt-BR') : '—'),
  },
  { key: 'unidade', label: 'Unidade' },
  { key: 'fonte', label: 'Fonte' },
]

/**
 * DataExplorerPage: select municipalities and view all main IBGE
 * indicators in a virtualized table.
 */
function DataExplorerPage() {
  const {
    municipios,
    selecionados,
    dataset,
    loading,
    error,
    buscarMunicipios,
    adicionarMunicipio,
    removerMunicipio,
    buscarDados,
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
      adicionarMunicipio(municipio)
      setSelectedMunicipioObjs((atual) =>
        atual.some((m) => m.id === municipio.id) ? atual : [...atual, municipio]
      )
    },
    [adicionarMunicipio]
  )

  const handleRemoveMunicipio = useCallback(
    (id) => {
      removerMunicipio(id)
      setSelectedMunicipioObjs((atual) => atual.filter((m) => m.id !== id))
    },
    [removerMunicipio]
  )

  const handleSubmit = useCallback(() => {
    buscarDados(INDICADORES_DASHBOARD_PADRAO)
  }, [buscarDados, INDICADORES_DASHBOARD_PADRAO])

  const tableRows = useMemo(() => {
    if (!dataset) return []
    const municipioPorId = new Map(dataset.municipios.map((m) => [m.id, m]))
    return dataset.indicadores.map((indicador) => {
      const municipio = municipioPorId.get(indicador.municipioId)
      return {
        municipio: municipio?.nome ?? '',
        estado: municipio?.estado?.sigla ?? '',
        indicador: indicador.nome,
        periodo: indicador.periodo,
        valor: indicador.valor,
        unidade: indicador.unidade,
        fonte: indicador.fonte,
      }
    })
  }, [dataset])

  const datasetInfo = dataset
    ? {
        source: dataset.fonte,
        lastUpdated: dataset.consultadoEm,
        totalRecords: dataset.indicadores.length,
      }
    : null

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Data Explorer</h1>
      <p className={styles.subtitle}>
        Selecione municípios para explorar os principais indicadores do IBGE.
      </p>

      <FilterBar
        municipioSuggestions={municipios}
        onSearchMunicipio={buscarMunicipios}
        selectedMunicipios={selectedMunicipioObjs}
        onAddMunicipio={handleAddMunicipio}
        onRemoveMunicipio={handleRemoveMunicipio}
        municipioMax={5}
        hideIndicadores
        onSubmit={handleSubmit}
        submitting={loading}
      />

      {error && <p className={styles.error}>{error}</p>}

      {!dataset && !loading && (
        <EmptyState
          icon="🔍"
          title="Nenhum dado carregado"
          description="Selecione um ou mais municípios e clique em Consultar."
        />
      )}

      {dataset && (
        <ErrorBoundary
          fallback={(_err, reset) => (
            <EmptyState
              icon="⚠️"
              title="Seção indisponível"
              description="Não foi possível carregar a tabela."
              actionLabel="Tentar novamente"
              onAction={reset}
            />
          )}
        >
          <DataTable data={tableRows} columns={COLUMNS} datasetInfo={datasetInfo} dataset={dataset} />
        </ErrorBoundary>
      )}
    </div>
  )
}

export default DataExplorerPage
