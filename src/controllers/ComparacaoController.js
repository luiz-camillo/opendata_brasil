import { ConsultaController } from './ConsultaController'
import { Comparador } from '../models/Comparador'
import { INDICADORES_COMPARACAO_PADRAO } from '../config/indicators'

/**
 * Orchestrates the comparison flow between two municipalities: fetches
 * their data through `ConsultaController` and produces a comparison
 * report via the `Comparador` model.
 */
export class ComparacaoController {
  /**
   * @param {{ consultaController?: ConsultaController }} [deps]
   */
  constructor({ consultaController = new ConsultaController() } = {}) {
    /** @type {ConsultaController} */
    this.consultaController = consultaController
  }

  /**
   * Compares two municipalities. Always fetches the default comparison
   * indicators automatically and merges them with any user-selected
   * extras.
   * @param {number} municipioIdA
   * @param {number} municipioIdB
   * @param {string[]} [indicadorIdsExtras] additional user-selected indicators
   * @param {string|null} [periodo] optional year override
   * @returns {Promise<Array<{ indicador: string, valorA: number|null, valorB: number|null, diferenca: number|null, diferencaPercentual: number|null }>>}
   */
  async comparar(municipioIdA, municipioIdB, indicadorIdsExtras = [], periodo = null) {
    const indicadorIds = Array.from(
      new Set([...INDICADORES_COMPARACAO_PADRAO, ...(indicadorIdsExtras ?? [])])
    )

    const dataset = await this.consultaController.executar(
      [municipioIdA, municipioIdB],
      indicadorIds,
      periodo
    )

    const comparador = new Comparador(dataset)
    return comparador.comparar(municipioIdA, municipioIdB)
  }

  /**
   * Cancels any pending network requests.
   * @returns {void}
   */
  abort() {
    this.consultaController.abort()
  }
}

export default ComparacaoController
