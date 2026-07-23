import { Dataset } from '../../models/Dataset'
import { Indicador } from '../../models/Indicador'
import { paraNumero } from '../api/IbgeService'

const WORKER_THRESHOLD = 100

/**
 * Extracts, from a single raw IBGE "agregados" (SIDRA) response entry
 * (as returned by `IbgeService.buscarAgregado`), one `Indicador` per
 * municipality/period combination.
 *
 * @param {any} respostaAgregado raw JSON array from the agregados API
 * @param {{ nome: string, unidade: string }} indicadorConfig
 * @returns {Indicador[]}
 */
function normalizarRespostaAgregado(respostaAgregado, indicadorConfig) {
  const indicadores = []

  for (const variavel of respostaAgregado ?? []) {
    for (const resultado of variavel.resultados ?? []) {
      for (const serie of resultado.series ?? []) {
        const municipioId = Number(serie.localidade?.id)
        const periodos = serie.serie ?? {}

        for (const [periodo, valorBruto] of Object.entries(periodos)) {
          indicadores.push(
            new Indicador({
              id: `${indicadorConfig.id ?? variavel.id}-${municipioId}-${periodo}`,
              nome: indicadorConfig.nome ?? variavel.variavel,
              unidade: indicadorConfig.unidade ?? variavel.unidade ?? '',
              fonte: 'ibge',
              periodo: normalizarPeriodo(periodo),
              valor: paraNumero(valorBruto),
              municipioId,
            })
          )
        }
      }
    }
  }

  return indicadores
}

/**
 * Normalizes an IBGE period string (e.g. "2010", "202501") into an ISO
 * date (YYYY-MM-DD). Falls back to the raw value when it cannot be
 * parsed as a plain year or year+month.
 * @param {string} periodo
 * @returns {string}
 */
function normalizarPeriodo(periodo) {
  const texto = String(periodo)

  if (/^\d{4}$/.test(texto)) {
    return `${texto}-01-01`
  }

  if (/^\d{6}$/.test(texto)) {
    const ano = texto.slice(0, 4)
    const mes = texto.slice(4, 6)
    return `${ano}-${mes}-01`
  }

  return texto
}

/**
 * Normalizes raw IBGE API responses into the application's canonical
 * `Dataset` shape: consistent field names, numeric coercion, ISO dates,
 * and null-safety for missing values.
 *
 * When the combined number of indicators exceeds a threshold, the heavy
 * lifting is delegated to a Web Worker so the main thread stays
 * responsive.
 */
export class DatasetService {
  /**
   * @param {Array<{ indicador: { id: string, nome: string, unidade: string }, data: any }>} respostas
   *   one entry per fetched indicator, each carrying its raw aggregate
   *   response and the indicator config used to fetch it
   * @param {import('../../models/Municipio').Municipio[]} municipios
   * @returns {Promise<Dataset>}
   */
  async normalizar(respostas, municipios) {
    const totalEstimado = (respostas ?? []).reduce((soma, resposta) => {
      const series = (resposta.data ?? []).flatMap((v) =>
        (v.resultados ?? []).flatMap((r) => r.series ?? [])
      )
      return soma + series.length
    }, 0)

    if (totalEstimado > WORKER_THRESHOLD && typeof Worker !== 'undefined') {
      return this._normalizarViaWorker(respostas, municipios)
    }

    return this._normalizarSincrono(respostas, municipios)
  }

  /**
   * Synchronous normalization path, used for small datasets.
   * @param {Array<{ indicador: any, data: any }>} respostas
   * @param {import('../../models/Municipio').Municipio[]} municipios
   * @returns {Dataset}
   */
  _normalizarSincrono(respostas, municipios) {
    const indicadores = (respostas ?? []).flatMap((resposta) =>
      normalizarRespostaAgregado(resposta.data, resposta.indicador)
    )

    return new Dataset({
      municipios,
      indicadores,
      consultadoEm: new Date(),
      fonte: 'ibge',
    })
  }

  /**
   * Delegates normalization to `dataProcessor.worker.js`, rehydrating
   * the returned plain object into a real `Dataset` instance.
   * @param {Array<{ indicador: any, data: any }>} respostas
   * @param {import('../../models/Municipio').Municipio[]} municipios
   * @returns {Promise<Dataset>}
   */
  _normalizarViaWorker(respostas, municipios) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('../../workers/dataProcessor.worker.js', import.meta.url), {
        type: 'module',
      })

      worker.onmessage = (event) => {
        const { type, payload } = event.data ?? {}
        worker.terminate()

        if (type === 'NORMALIZE_RESULT') {
          resolve(
            new Dataset({
              municipios,
              indicadores: (payload.indicadores ?? []).map((i) => new Indicador(i)),
              consultadoEm: new Date(payload.consultadoEm),
              fonte: payload.fonte ?? 'ibge',
            })
          )
        } else {
          reject(new Error(payload ?? 'Falha ao normalizar dados no worker'))
        }
      }

      worker.onerror = (event) => {
        worker.terminate()
        reject(new Error(event.message ?? 'Erro desconhecido no worker de normalização'))
      }

      worker.postMessage({
        type: 'NORMALIZE',
        payload: { rawData: respostas, municipios },
      })
    })
  }
}

export { normalizarRespostaAgregado, normalizarPeriodo, WORKER_THRESHOLD }
export default DatasetService
