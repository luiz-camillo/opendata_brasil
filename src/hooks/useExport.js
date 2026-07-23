import { useCallback, useRef, useState } from 'react'
import { ExportService } from '../services/export/ExportService'

/**
 * Hook exposing dataset export functionality with a loading flag.
 * @returns {{ exporting: boolean, exportar: (dataset: import('../models/Dataset').Dataset, formato: 'csv'|'json', filtros?: object) => Promise<void> }}
 */
export function useExport() {
  const [exporting, setExporting] = useState(false)
  const serviceRef = useRef(new ExportService())

  /**
   * @param {import('../models/Dataset').Dataset} dataset
   * @param {'csv'|'json'} formato
   * @param {{ municipios?: number[], indicadores?: string[] }} [filtros]
   * @returns {Promise<void>}
   */
  const exportar = useCallback(async (dataset, formato, filtros = {}) => {
    setExporting(true)
    try {
      serviceRef.current.exportar(dataset, formato, filtros)
    } finally {
      setExporting(false)
    }
  }, [])

  return { exporting, exportar }
}

export default useExport
