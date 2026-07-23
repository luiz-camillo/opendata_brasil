/**
 * Normalized collection of municipalities and indicators produced for a
 * given query. This is the common data shape consumed by the UI
 * (dashboards, tables, charts, exports).
 */
export class Dataset {
  /**
   * @param {{
   *   municipios: import('./Municipio').Municipio[],
   *   indicadores: import('./Indicador').Indicador[],
   *   consultadoEm?: Date,
   *   fonte: string
   * }} params
   */
  constructor({ municipios, indicadores, consultadoEm = new Date(), fonte }) {
    /** @type {import('./Municipio').Municipio[]} */
    this.municipios = municipios ?? []
    /** @type {import('./Indicador').Indicador[]} */
    this.indicadores = indicadores ?? []
    /** @type {Date} */
    this.consultadoEm = consultadoEm
    /** @type {string} */
    this.fonte = fonte
  }

  /**
   * Returns all indicators belonging to a given municipality.
   * @param {number} municipioId
   * @returns {import('./Indicador').Indicador[]}
   */
  filtrarPorMunicipio(municipioId) {
    return this.indicadores.filter((indicador) => indicador.municipioId === municipioId)
  }

  /**
   * Unique, ordered list of indicator names present in this dataset.
   * @returns {string[]}
   */
  get nomesIndicadores() {
    return [...new Set(this.indicadores.map((indicador) => indicador.nome))]
  }

  /**
   * Plain-object representation, suitable for serialization/export.
   * @returns {{ municipios: any[], indicadores: any[], consultadoEm: string, fonte: string }}
   */
  toExportData() {
    return {
      municipios: this.municipios.map((municipio) => ({
        id: municipio.id,
        nome: municipio.nome,
        estado: municipio.estado?.sigla ?? null,
        regiao: municipio.regiao?.nome ?? null,
        populacao: municipio.populacao,
        area: municipio.area,
        densidadeDemografica: municipio.densidadeDemografica,
      })),
      indicadores: this.indicadores.map((indicador) => ({
        municipioId: indicador.municipioId,
        indicador: indicador.nome,
        periodo: indicador.periodo,
        valor: indicador.valor,
        unidade: indicador.unidade,
        fonte: indicador.fonte,
      })),
      consultadoEm: this.consultadoEm.toISOString(),
      fonte: this.fonte,
    }
  }
}

export default Dataset
