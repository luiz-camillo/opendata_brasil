/**
 * Represents a user-initiated query: which municipalities and which
 * indicators to fetch, optionally bounded by a date range. Instances are
 * serializable so they can be persisted (e.g. "last query" in
 * localStorage).
 */
export class Consulta {
  /**
   * @param {{ municipios: number[], indicadores: string[], dataInicio?: string|null, dataFim?: string|null }} params
   */
  constructor({ municipios, indicadores, dataInicio = null, dataFim = null }) {
    /** @type {number[]} */
    this.municipios = municipios ?? []
    /** @type {string[]} */
    this.indicadores = indicadores ?? []
    /** @type {string|null} */
    this.dataInicio = dataInicio
    /** @type {string|null} */
    this.dataFim = dataFim
  }

  /**
   * Validates the query, returning a list of error messages (empty when
   * the query is valid).
   * @returns {string[]}
   */
  validar() {
    const erros = []

    if (!Array.isArray(this.municipios) || this.municipios.length === 0) {
      erros.push('Selecione ao menos um município.')
    }

    if (!Array.isArray(this.indicadores) || this.indicadores.length === 0) {
      erros.push('Selecione ao menos um indicador.')
    }

    if (this.dataInicio && this.dataFim && this.dataInicio > this.dataFim) {
      erros.push('A data de início não pode ser posterior à data de fim.')
    }

    return erros
  }

  /**
   * Plain-object representation for storage.
   * @returns {{ municipios: number[], indicadores: string[], dataInicio: string|null, dataFim: string|null }}
   */
  toJSON() {
    return {
      municipios: this.municipios,
      indicadores: this.indicadores,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
    }
  }

  /**
   * Recreates a Consulta instance from its serialized form.
   * @param {{ municipios?: number[], indicadores?: string[], dataInicio?: string|null, dataFim?: string|null }} json
   * @returns {Consulta}
   */
  static fromJSON(json) {
    return new Consulta({
      municipios: json?.municipios ?? [],
      indicadores: json?.indicadores ?? [],
      dataInicio: json?.dataInicio ?? null,
      dataFim: json?.dataFim ?? null,
    })
  }
}

export default Consulta
