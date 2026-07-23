import { ApiResponse } from '../../models/ApiResponse'
import { ApiError } from '../../models/ApiError'
import { Municipio } from '../../models/Municipio'
import { DataSourceService } from './DataSourceService'

const BASE_URL = 'https://servicodados.ibge.gov.br/api'
const RETRY_DELAYS_MS = [500, 1000, 2000]
const SOURCE_ID = 'ibge'
const SOURCE_NAME = 'IBGE - Instituto Brasileiro de Geografia e Estatística'

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Converts raw IBGE numeric strings ("...", "-", "X", null, "1523.3")
 * into a finite number or null.
 * @param {unknown} valor
 * @returns {number|null}
 */
function paraNumero(valor) {
  if (valor == null) return null
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null
  const texto = String(valor).trim()
  if (texto === '' || texto === '...' || texto === '-' || texto === 'X') return null
  const numero = Number(texto.replace(',', '.'))
  return Number.isFinite(numero) ? numero : null
}

/**
 * Concrete DataSourceService implementation for the IBGE
 * "Serviço de Dados" API (localidades + agregados/SIDRA).
 *
 * Every network call:
 * - is issued through an AbortController tracked per request "type" so a
 *   newer request of the same type cancels any previous, in-flight one;
 * - is retried up to 3 times with exponential backoff (500ms/1000ms/2000ms)
 *   when it fails due to a network error or a 5xx response.
 */
export class IbgeService extends DataSourceService {
  constructor() {
    super()
    /** @type {Map<string, AbortController>} */
    this._controllers = new Map()
  }

  /** @returns {string} */
  get sourceId() {
    return SOURCE_ID
  }

  /** @returns {string} */
  get sourceName() {
    return SOURCE_NAME
  }

  /**
   * Creates a fresh AbortController for the given request type, aborting
   * any previous request registered under the same type.
   * @param {string} tipo
   * @returns {AbortController}
   */
  _novoControllerPara(tipo) {
    const anterior = this._controllers.get(tipo)
    if (anterior) {
      anterior.abort()
    }
    const controller = new AbortController()
    this._controllers.set(tipo, controller)
    return controller
  }

  /**
   * Cancels every pending request issued by this service instance.
   * @returns {void}
   */
  abort() {
    for (const controller of this._controllers.values()) {
      controller.abort()
    }
    this._controllers.clear()
  }

  /**
   * Performs a fetch with retry + exponential backoff. Only retries on
   * network failures or 5xx responses; 4xx responses fail immediately.
   * @param {string} url
   * @param {AbortSignal} signal
   * @returns {Promise<any>} parsed JSON body
   */
  async _fetchWithRetry(url, signal) {
    let ultimoErro

    for (let tentativa = 0; tentativa <= RETRY_DELAYS_MS.length; tentativa += 1) {
      try {
        const resposta = await fetch(url, { signal })

        if (!resposta.ok) {
          const retryable = resposta.status >= 500
          const erro = new ApiError({
            message: `IBGE respondeu com status ${resposta.status}`,
            statusCode: resposta.status,
            source: SOURCE_ID,
            endpoint: url,
            retryable,
          })

          if (retryable && tentativa < RETRY_DELAYS_MS.length) {
            ultimoErro = erro
            await delay(RETRY_DELAYS_MS[tentativa])
            continue
          }

          throw erro
        }

        return await resposta.json()
      } catch (erro) {
        if (erro?.name === 'AbortError') {
          throw erro
        }

        if (erro instanceof ApiError) {
          throw erro
        }

        // Network-level failure (fetch rejected).
        ultimoErro = new ApiError({
          message: erro?.message || 'Falha de rede ao consultar a API do IBGE',
          statusCode: null,
          source: SOURCE_ID,
          endpoint: url,
          retryable: true,
        })

        if (tentativa < RETRY_DELAYS_MS.length) {
          await delay(RETRY_DELAYS_MS[tentativa])
          continue
        }

        throw ultimoErro
      }
    }

    throw ultimoErro
  }

  /**
   * @param {any} municipio raw IBGE localidades/municipios entry
   * @returns {Municipio}
   */
  _paraMunicipio(municipio) {
    const uf = municipio?.microrregiao?.mesorregiao?.UF ?? municipio?.regiao?.UF ?? null
    return new Municipio({
      id: municipio.id,
      nome: municipio.nome,
      estado: uf
        ? { id: uf.id, sigla: uf.sigla, nome: uf.nome }
        : { id: 0, sigla: '', nome: '' },
      regiao: uf?.regiao
        ? { id: uf.regiao.id, sigla: uf.regiao.sigla, nome: uf.regiao.nome }
        : { id: 0, sigla: '', nome: '' },
    })
  }

  /**
   * Searches municipalities by (partial, case-insensitive) name.
   * @param {string} query
   * @returns {Promise<ApiResponse>}
   */
  async buscarMunicipios(query) {
    const controller = this._novoControllerPara('buscarMunicipios')
    const url = `${BASE_URL}/v1/localidades/municipios`

    const dados = await this._fetchWithRetry(url, controller.signal)
    const termo = (query ?? '').trim().toLowerCase()

    const filtrados = termo
      ? dados.filter((municipio) => municipio.nome.toLowerCase().includes(termo))
      : dados

    return new ApiResponse({
      data: filtrados.map((municipio) => this._paraMunicipio(municipio)),
      source: SOURCE_ID,
    })
  }

  /**
   * @param {string} query alias required by the DataSourceService contract
   * @returns {Promise<ApiResponse>}
   */
  async buscarLocalidades(query) {
    return this.buscarMunicipios(query)
  }

  /**
   * Fetches a single municipality by its IBGE id.
   * @param {number} id
   * @returns {Promise<ApiResponse>}
   */
  async buscarMunicipioPorId(id) {
    const controller = this._novoControllerPara('buscarMunicipioPorId')
    const url = `${BASE_URL}/v1/localidades/municipios/${id}`

    const dados = await this._fetchWithRetry(url, controller.signal)

    return new ApiResponse({
      data: this._paraMunicipio(dados),
      source: SOURCE_ID,
    })
  }

  /**
   * Lists all Brazilian states.
   * @returns {Promise<ApiResponse>}
   */
  async buscarEstados() {
    const controller = this._novoControllerPara('buscarEstados')
    const url = `${BASE_URL}/v1/localidades/estados`

    const dados = await this._fetchWithRetry(url, controller.signal)

    return new ApiResponse({
      data: dados.map((estado) => ({
        id: estado.id,
        sigla: estado.sigla,
        nome: estado.nome,
        regiao: estado.regiao,
      })),
      source: SOURCE_ID,
    })
  }

  /**
   * Fetches aggregate (SIDRA) data for a set of municipalities.
   * @param {string} agregadoId
   * @param {number[]} localidades municipio IBGE ids (N6 level)
   * @param {string} periodos e.g. '-1', '-6', '2010'
   * @param {string} [variavel] variable id within the aggregate
   * @returns {Promise<ApiResponse>}
   */
  async buscarAgregado(agregadoId, localidades, periodos, variavel = '') {
    const controller = this._novoControllerPara(`buscarAgregado:${agregadoId}:${variavel}`)
    const localidadesStr = (localidades ?? []).join('|')
    const url = `${BASE_URL}/v3/agregados/${agregadoId}/periodos/${periodos}/variaveis/${variavel}?localidades=N6[${localidadesStr}]`

    const dados = await this._fetchWithRetry(url, controller.signal)

    return new ApiResponse({
      data: dados,
      source: SOURCE_ID,
    })
  }

  /**
   * @param {number[]} ids
   * @param {string[]} indicadores indicator ids as defined in config/indicators.js
   * @returns {Promise<ApiResponse>}
   */
  async buscarIndicadores(_ids, _indicadores) {
    throw new Error(
      'buscarIndicadores deve ser orquestrado pelo ConsultaController usando buscarAgregado para cada indicador.'
    )
  }

  /**
   * Pings the IBGE API to check reachability.
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    const controller = this._novoControllerPara('checkHealth')
    try {
      const resposta = await fetch(`${BASE_URL}/v1/localidades/regioes`, {
        signal: controller.signal,
      })
      return resposta.ok
    } catch {
      return false
    }
  }
}

export { paraNumero }
export default IbgeService
