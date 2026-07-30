import { useCallback, useEffect, useRef, useState } from 'react'
import { ConsultaController } from '../controllers/ConsultaController'
import { StorageService } from '../services/storage/StorageService'
import { IbgeService } from '../services/api/IbgeService'

const INDICADORES_DASHBOARD_PADRAO = ['populacao', 'area', 'pib', 'pib-per-capita', 'densidade', 'alfabetizacao']

/**
 * Hook that manages municipality search, selection and indicator data
 * fetching for the query/explorer screens. Restores the user's last
 * query on mount and cleans up any in-flight requests on unmount.
 * @returns {{
 *   municipios: import('../models/Municipio').Municipio[],
 *   indicadores: string[],
 *   selecionados: number[],
 *   periodo: string|null,
 *   dataset: import('../models/Dataset').Dataset|null,
 *   loading: boolean,
 *   error: string|null,
 *   buscarMunicipios: (query: string) => Promise<void>,
 *   selecionarMunicipio: (id: number) => void,
 *   adicionarMunicipio: (municipio: import('../models/Municipio').Municipio) => void,
 *   definirMunicipioUnico: (municipio: import('../models/Municipio').Municipio) => void,
 *   removerMunicipio: (id: number) => void,
 *   selecionarIndicadores: (ids: string[]) => void,
 *   selecionarPeriodo: (periodo: string|null) => void,
 *   buscarDados: (indicadorIds?: string[]) => Promise<void>,
 *   limpar: () => void
 * }}
 */
export function useConsulta() {
  const [municipios, setMunicipios] = useState([])
  const [selecionados, setSelecionados] = useState([])
  const [indicadores, setIndicadores] = useState([])
  const [periodo, setPeriodo] = useState(null)
  const [dataset, setDataset] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const controllerRef = useRef(new ConsultaController())
  const ibgeServiceRef = useRef(new IbgeService())
  const storageServiceRef = useRef(new StorageService())

  useEffect(() => {
    let ativo = true
    const controller = controllerRef.current
    const ibgeService = ibgeServiceRef.current

    async function restaurar() {
      const ultima = await storageServiceRef.current.recuperarUltimaConsulta()
      if (ativo && ultima) {
        setSelecionados(ultima.municipios ?? [])
        setIndicadores(ultima.indicadores ?? [])
        setPeriodo(ultima.periodo ?? null)
      }
    }

    restaurar()

    return () => {
      ativo = false
      controller.abort()
      ibgeService.abort()
    }
  }, [])

  /**
   * @param {string} query
   * @returns {Promise<void>}
   */
  const buscarMunicipios = useCallback(async (query) => {
    setError(null)
    try {
      const resposta = await ibgeServiceRef.current.buscarMunicipios(query)
      setMunicipios(resposta.data)
    } catch (erro) {
      if (erro?.name !== 'AbortError') {
        setError(erro?.message ?? 'Falha ao buscar municípios')
      }
    }
  }, [])

  /**
   * Toggles a municipality's selection state.
   * @param {number} id
   * @returns {void}
   */
  const selecionarMunicipio = useCallback((id) => {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((existente) => existente !== id) : [...atual, id]
    )
  }, [])

  /**
   * Adds a municipality if it is not already selected.
   * @param {import('../models/Municipio').Municipio} municipio
   * @returns {void}
   */
  const adicionarMunicipio = useCallback((municipio) => {
    setSelecionados((atual) => (atual.includes(municipio.id) ? atual : [...atual, municipio.id]))
  }, [])

  /**
   * Replaces the current selection with a single municipality.
   * @param {import('../models/Municipio').Municipio} municipio
   * @returns {void}
   */
  const definirMunicipioUnico = useCallback((municipio) => {
    setSelecionados([municipio.id])
  }, [])

  /**
   * Removes a municipality from the selection.
   * @param {number} id
   * @returns {void}
   */
  const removerMunicipio = useCallback((id) => {
    setSelecionados((atual) => atual.filter((existente) => existente !== id))
  }, [])

  /**
   * @param {string[]} ids
   * @returns {void}
   */
  const selecionarIndicadores = useCallback((ids) => {
    setIndicadores(ids)
  }, [])

  const selecionarPeriodo = useCallback((novoPeriodo) => {
    setPeriodo(novoPeriodo)
  }, [])

  /**
   * @param {string[]} [indicadorIds]
   * @returns {Promise<void>}
   */
  const buscarDados = useCallback(async (indicadorIds) => {
    const idsIndicadores = indicadorIds ?? indicadores
    if (selecionados.length === 0 || idsIndicadores.length === 0) {
      setError('Selecione ao menos um município e um indicador.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const resultado = await controllerRef.current.executar(selecionados, idsIndicadores, periodo)
      setDataset(resultado)
    } catch (erro) {
      setError(erro?.message ?? 'Falha ao buscar dados')
    } finally {
      setLoading(false)
    }
  }, [selecionados, indicadores, periodo])

  /**
   * Fetches the default dashboard indicators for the currently selected
   * municipality.
   * @returns {Promise<void>}
   */
  const buscarDadosDashboard = useCallback(async () => {
    if (selecionados.length === 0) {
      setError('Selecione um município.')
      return
    }
    await buscarDados(INDICADORES_DASHBOARD_PADRAO)
  }, [selecionados, buscarDados])

  /**
   * Resets all state back to its initial values.
   * @returns {void}
   */
  const limpar = useCallback(() => {
    setMunicipios([])
    setSelecionados([])
    setIndicadores([])
    setPeriodo(null)
    setDataset(null)
    setError(null)
  }, [])

  return {
    municipios,
    indicadores,
    selecionados,
    periodo,
    dataset,
    loading,
    error,
    INDICADORES_DASHBOARD_PADRAO,
    buscarMunicipios,
    selecionarMunicipio,
    adicionarMunicipio,
    definirMunicipioUnico,
    removerMunicipio,
    selecionarIndicadores,
    selecionarPeriodo,
    buscarDados,
    buscarDadosDashboard,
    limpar,
  }
}

export default useConsulta
