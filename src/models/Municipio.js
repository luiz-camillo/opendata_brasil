/**
 * Represents a Brazilian municipality, along with the state (estado) and
 * region (regiao) it belongs to.
 */
export class Municipio {
  /**
   * @param {{
   *   id: number,
   *   nome: string,
   *   estado: { id: number, sigla: string, nome: string },
   *   regiao: { id: number, sigla: string, nome: string },
   *   populacao?: number|null,
   *   area?: number|null
   * }} params
   */
  constructor({ id, nome, estado, regiao, populacao = null, area = null }) {
    /** @type {number} */
    this.id = id
    /** @type {string} */
    this.nome = nome
    /** @type {{ id: number, sigla: string, nome: string }} */
    this.estado = estado
    /** @type {{ id: number, sigla: string, nome: string }} */
    this.regiao = regiao
    /** @type {number|null} */
    this.populacao = populacao
    /** @type {number|null} */
    this.area = area
  }

  /**
   * Population density (habitants per km²), or null when population/area
   * are not available.
   * @returns {number|null}
   */
  get densidadeDemografica() {
    return this.populacao != null && this.area != null && this.area > 0
      ? this.populacao / this.area
      : null
  }

  /**
   * Municipality name followed by its state's acronym, e.g. "São Paulo - SP".
   * @returns {string}
   */
  get nomeCompleto() {
    return `${this.nome} - ${this.estado?.sigla ?? ''}`
  }
}

export default Municipio
