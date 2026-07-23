/**
 * Web Worker responsible for running the (potentially expensive) dataset
 * normalization logic off the main thread. Used automatically by
 * `DatasetService` when the amount of raw data is large.
 *
 * Message contract:
 *  - in:  { type: 'NORMALIZE', payload: { rawData, municipios } }
 *  - out: { type: 'NORMALIZE_RESULT', payload: { municipios, indicadores, consultadoEm, fonte } }
 *  - out: { type: 'ERROR', payload: string }
 */
import { normalizarRespostaAgregado } from '../services/dataset/DatasetService'

self.onmessage = (event) => {
  const { type, payload } = event.data ?? {}

  if (type !== 'NORMALIZE') {
    return
  }

  try {
    const { rawData, municipios } = payload ?? {}

    const indicadores = (rawData ?? []).flatMap((resposta) =>
      normalizarRespostaAgregado(resposta.data, resposta.indicador)
    )

    self.postMessage({
      type: 'NORMALIZE_RESULT',
      payload: {
        municipios,
        indicadores,
        consultadoEm: new Date().toISOString(),
        fonte: 'ibge',
      },
    })
  } catch (erro) {
    self.postMessage({
      type: 'ERROR',
      payload: erro?.message ?? 'Erro desconhecido ao normalizar dados',
    })
  }
}
