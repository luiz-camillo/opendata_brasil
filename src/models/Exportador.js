/**
 * Converts a Dataset into downloadable CSV or JSON content and triggers
 * a browser download.
 */
export class Exportador {
  /**
   * @param {import('./Dataset').Dataset} dataset
   */
  constructor(dataset) {
    /** @type {import('./Dataset').Dataset} */
    this.dataset = dataset
  }

  /**
   * Builds a flat CSV representation: one row per municipio/indicador pair.
   * @returns {string} CSV content
   */
  toCSV() {
    const { municipios, indicadores } = this.dataset
    const municipioPorId = new Map(municipios.map((municipio) => [municipio.id, municipio]))

    const header = ['municipio', 'estado', 'indicador', 'periodo', 'valor', 'unidade', 'fonte']
    const linhas = indicadores.map((indicador) => {
      const municipio = municipioPorId.get(indicador.municipioId)
      return [
        municipio?.nome ?? '',
        municipio?.estado?.sigla ?? '',
        indicador.nome,
        indicador.periodo,
        indicador.valor ?? '',
        indicador.unidade,
        indicador.fonte,
      ]
    })

    const escapar = (valor) => {
      const texto = String(valor ?? '')
      return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
    }

    return [header, ...linhas].map((linha) => linha.map(escapar).join(',')).join('\n')
  }

  /**
   * @returns {string} JSON content
   */
  toJSON() {
    return JSON.stringify(this.dataset.toExportData(), null, 2)
  }

  /**
   * Triggers a browser download of the dataset in the requested format.
   * @param {'csv'|'json'} [formato]
   * @returns {void}
   */
  download(formato = 'csv') {
    const isCsv = formato === 'csv'
    const conteudo = isCsv ? this.toCSV() : this.toJSON()
    const mimeType = isCsv ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;'
    const nomeArquivo = `opendata-brasil.${isCsv ? 'csv' : 'json'}`

    const blob = new Blob([conteudo], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nomeArquivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export default Exportador
