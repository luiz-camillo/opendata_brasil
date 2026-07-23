import { IbgeService } from '../services/api/IbgeService'
import { DatasetService } from '../services/dataset/DatasetService'
import { StorageService } from '../services/storage/StorageService'
import { Consulta } from '../models/Consulta'
import { INDICADORES_IBGE } from '../config/indicators'

/**
 * Builds the cache key for a given municipio + indicator combination.
 * @param {number} municipioId
 * @param {string} indicadorId
 * @returns {string}
 */
function chaveCache(municipioId, indicadorId) {
  return `indicador:${indicadorId}:municipio:${municipioId}`
}

/**
 * Orchestrates the full query flow: cache lookup, parallel fetches to
 * the IBGE service, normalization via `DatasetService`, cache write-back
 * and persistence of the last performed query.
 */
export class ConsultaController {
  /**
   * @param {{ ibgeService?: IbgeService, datasetService?: DatasetService, storageService?: StorageService }} [deps]
   */
  constructor({
    ibgeService = new IbgeService(),
    datasetService = new DatasetService(),
    storageService = new StorageService(),
  } = {}) {
    /** @type {IbgeService} */
    this.ibgeService = ibgeService
    /** @type {DatasetService} */
    this.datasetService = datasetService
    /** @type {StorageService} */
    this.storageService = storageService
  }

  /**
   * Executes a query for the given municipality ids and indicator ids,
   * returning a normalized `Dataset`. Municipalities that fail to fetch
   * are skipped so the caller still gets partial results.
   * @param {number[]} municipioIds
   * @param {string[]} indicadorIds
   * @returns {Promise<Dataset>}
   */
  async executar(municipioIds, indicadorIds) {
    const consulta = new Consulta({ municipios: municipioIds, indicadores: indicadorIds })
    const erros = consulta.validar()
    if (erros.length > 0) {
      throw new Error(erros.join(' '))
    }

    const indicadoresConfig = INDICADORES_IBGE.filter((indicador) =>
      indicadorIds.includes(indicador.id)
    )

    const municipios = await this._buscarMunicipios(municipioIds)

    const respostas = await this._buscarIndicadoresComCache(municipioIds, indicadoresConfig)

    const dataset = await this.datasetService.normalizar(respostas, municipios)

    await this.storageService.salvarUltimaConsulta(consulta)

    return dataset
  }

  /**
   * Fetches municipality entities in parallel, silently skipping any
   * that fail so the query can still return partial results.
   * @param {number[]} municipioIds
   * @returns {Promise<import('../models/Municipio').Municipio[]>}
   */
  async _buscarMunicipios(municipioIds) {
    const resultados = await Promise.allSettled(
      municipioIds.map((id) => this.ibgeService.buscarMunicipioPorId(id))
    )

    return resultados
      .filter((resultado) => resultado.status === 'fulfilled')
      .map((resultado) => resultado.value.data)
  }

  /**
   * Fetches indicator data for every (indicator, all-municipios)
   * combination, checking the IndexedDB cache first and writing back on
   * cache misses. Failures are swallowed per-indicator so a single
   * failing indicator doesn't abort the whole query.
   * @param {number[]} municipioIds
   * @param {Array<{ id: string, nome: string, unidade: string, agregadoId: string, variavel: string, periodos: string }>} indicadoresConfig
   * @returns {Promise<Array<{ indicador: any, data: any }>>}
   */
  async _buscarIndicadoresComCache(municipioIds, indicadoresConfig) {
    const chave = chaveCache(municipioIds.join('-'), indicadoresConfig.map((i) => i.id).join('-'))
    const ttl = indicadoresConfig.some((i) => i.id === 'populacao' || i.id === 'area')
      ? 1440
      : 360

    const cacheado = await this.storageService.getCachedData(chave)
    if (cacheado) {
      return cacheado
    }

    const resultados = await Promise.allSettled(
      indicadoresConfig.map(async (indicadorConfig) => {
        const resposta = await this.ibgeService.buscarAgregado(
          indicadorConfig.agregadoId,
          municipioIds,
          indicadorConfig.periodos,
          indicadorConfig.variavel
        )
        return { indicador: indicadorConfig, data: resposta.data }
      })
    )

    const respostas = resultados
      .filter((resultado) => resultado.status === 'fulfilled')
      .map((resultado) => resultado.value)

    if (respostas.length > 0) {
      await this.storageService.setCachedData(chave, respostas, ttl)
    }

    return respostas
  }

  /**
   * Cancels any pending network requests issued by the underlying
   * `IbgeService`.
   * @returns {void}
   */
  abort() {
    this.ibgeService.abort()
  }
}

export default ConsultaController
