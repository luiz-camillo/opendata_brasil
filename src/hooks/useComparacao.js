import { useCallback, useRef, useState } from 'react'
import { ComparacaoController } from '../controllers/ComparacaoController'

/**
 * Hook that manages state and orchestration for the municipality
 * comparison screen.
 * @returns {{
 *   municipioA: number|null,
 *   municipioB: number|null,
 *   resultado: Array<{ indicador: string, valorA: number|null, valorB: number|null, diferenca: number|null, diferencaPercentual: number|null }>|null,
 *   loading: boolean,
 *   error: string|null,
 *   setMunicipioA: (id: number|null) => void,
 *   setMunicipioB: (id: number|null) => void,
 *   comparar: (indicadorIds: string[]) => Promise<void>
 * }}
 */
export function useComparacao() {
  const [municipioA, setMunicipioA] = useState(null)
  const [municipioB, setMunicipioB] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const controllerRef = useRef(new ComparacaoController())

  /**
   * @param {string[]} indicadorIds
   * @returns {Promise<void>}
   */
  const comparar = useCallback(
    async (indicadorIds) => {
      if (municipioA == null || municipioB == null) {
        setError('Selecione dois municípios para comparar.')
        return
      }

      setLoading(true)
      setError(null)
      try {
        const dados = await controllerRef.current.comparar(municipioA, municipioB, indicadorIds)
        setResultado(dados)
      } catch (erro) {
        setError(erro?.message ?? 'Falha ao comparar municípios')
      } finally {
        setLoading(false)
      }
    },
    [municipioA, municipioB]
  )

  return {
    municipioA,
    municipioB,
    resultado,
    loading,
    error,
    setMunicipioA,
    setMunicipioB,
    comparar,
  }
}

export default useComparacao
