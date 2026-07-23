/**
 * Represents a single data indicator value obtained from an IBGE
 * aggregate (e.g. population, area) for a given municipality and period.
 */
export class Indicador {
  /**
   * @param {{
   *   id: string,
   *   nome: string,
   *   unidade: string,
   *   fonte: string,
   *   periodo: string,
   *   valor: number|null,
   *   municipioId: number
   * }} params
   */
  constructor({ id, nome, unidade, fonte, periodo, valor, municipioId }) {
    /** @type {string} */
    this.id = id
    /** @type {string} */
    this.nome = nome
    /** @type {string} */
    this.unidade = unidade
    /** @type {string} */
    this.fonte = fonte
    /** @type {string} */
    this.periodo = periodo
    /** @type {number|null} */
    this.valor = valor
    /** @type {number} */
    this.municipioId = municipioId
  }
}

export default Indicador
