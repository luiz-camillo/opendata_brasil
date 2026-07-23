import { Dataset } from '../../models/Dataset'
import { Exportador } from '../../models/Exportador'

/**
 * Applies filters to a Dataset (e.g. restricting to a subset of
 * municipalities or indicators) before exporting.
 * @param {Dataset} dataset
 * @param {{ municipios?: number[], indicadores?: string[] }} [filtros]
 * @returns {Dataset}
 */
function aplicarFiltros(dataset, filtros = {}) {
  const { municipios, indicadores } = filtros

  const municipiosFiltrados = municipios?.length
    ? dataset.municipios.filter((m) => municipios.includes(m.id))
    : dataset.municipios

  const indicadoresFiltrados = dataset.indicadores.filter((indicador) => {
    const pertenceAoMunicipio = !municipios?.length || municipios.includes(indicador.municipioId)
    const pertenceAoIndicador = !indicadores?.length || indicadores.includes(indicador.nome)
    return pertenceAoMunicipio && pertenceAoIndicador
  })

  return new Dataset({
    municipios: municipiosFiltrados,
    indicadores: indicadoresFiltrados,
    consultadoEm: dataset.consultadoEm,
    fonte: dataset.fonte,
  })
}

/**
 * Orchestrates dataset export to CSV/JSON, applying optional filters
 * beforehand and delegating file generation/download to the
 * `Exportador` model.
 */
export class ExportService {
  /**
   * Exports a dataset, optionally filtered, triggering a browser
   * download.
   * @param {Dataset} dataset
   * @param {'csv'|'json'} formato
   * @param {{ municipios?: number[], indicadores?: string[] }} [filtros]
   * @returns {void}
   */
  exportar(dataset, formato, filtros = {}) {
    const datasetFiltrado = aplicarFiltros(dataset, filtros)
    const exportador = new Exportador(datasetFiltrado)
    exportador.download(formato)
  }

  /**
   * @param {Dataset} dataset
   * @returns {string} CSV content
   */
  gerarCSV(dataset) {
    return new Exportador(dataset).toCSV()
  }

  /**
   * @param {Dataset} dataset
   * @returns {string} JSON content
   */
  gerarJSON(dataset) {
    return new Exportador(dataset).toJSON()
  }

  /**
   * Triggers a browser download for arbitrary text content.
   * @param {string} conteudo
   * @param {string} nomeArquivo
   * @param {string} mimeType
   * @returns {void}
   */
  download(conteudo, nomeArquivo, mimeType) {
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

export { aplicarFiltros }
export default ExportService
