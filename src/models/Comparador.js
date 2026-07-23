/**
 * Compares indicator values between two municipalities of a given
 * Dataset, computing absolute and percentage differences.
 */
export class Comparador {
  /**
   * @param {import('./Dataset').Dataset} dataset
   */
  constructor(dataset) {
    /** @type {import('./Dataset').Dataset} */
    this.dataset = dataset
  }

  /**
   * @param {number} municipioIdA
   * @param {number} municipioIdB
   * @returns {Array<{ indicador: string, valorA: number|null, valorB: number|null, diferenca: number|null, diferencaPercentual: number|null }>}
   */
  comparar(municipioIdA, municipioIdB) {
    const indicadoresA = this.dataset.filtrarPorMunicipio(municipioIdA)
    const indicadoresB = this.dataset.filtrarPorMunicipio(municipioIdB)

    return this.dataset.nomesIndicadores.map((nome) => {
      const indicadorA = indicadoresA.find((indicador) => indicador.nome === nome)
      const indicadorB = indicadoresB.find((indicador) => indicador.nome === nome)

      const valorA = indicadorA?.valor ?? null
      const valorB = indicadorB?.valor ?? null

      const diferenca = valorA != null && valorB != null ? valorA - valorB : null

      const diferencaPercentual =
        valorA != null && valorB != null && valorB !== 0
          ? ((valorA - valorB) / valorB) * 100
          : null

      return {
        indicador: nome,
        valorA,
        valorB,
        diferenca,
        diferencaPercentual,
      }
    })
  }
}

export default Comparador
