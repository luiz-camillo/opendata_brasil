import { ConsultaController } from './ConsultaController'
import { Comparador } from '../models/Comparador'

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
   * @param {number} municipioIdA
   * @param {number} municipioIdB
   * @param {string[]} indicadorIds
   * @returns {Promise<Array<{ indicador: string, valorA: number|null, valorB: number|null, diferenca: number|null, diferencaPercentual: number|null }>>}
   */
  async comparar(municipioIdA, municipioIdB, indicadorIds) {
    const dataset = await this.consultaController.executar(
      [municipioIdA, municipioIdB],
      indicadorIds
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
