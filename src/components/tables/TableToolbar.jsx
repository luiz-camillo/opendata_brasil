import { useState } from 'react'
import { useExport } from '../../hooks/useExport'
import styles from './TableToolbar.module.css'

const PAGE_SIZE_OPTIONS = [25, 50, 100, 'Todos']

/**
 * Toolbar for DataTable: debounced search, column visibility toggle,
 * page size selector, export buttons and a record counter.
 *
 * @param {{
 *   searchValue: string,
 *   onSearchChange: (value: string) => void,
 *   columns: Array<{ key: string, label: string }>,
 *   visibleColumns: Record<string, boolean>,
 *   onToggleColumn: (key: string) => void,
 *   pageSize: number|'Todos',
 *   onPageSizeChange: (value: number|'Todos') => void,
 *   shownCount: number,
 *   totalCount: number,
 *   dataset?: import('../../models/Dataset').Dataset|null,
 *   headMode?: boolean,
 *   onToggleHead?: () => void,
 * }} props
 */
function TableToolbar({
  searchValue,
  onSearchChange,
  columns,
  visibleColumns,
  onToggleColumn,
  pageSize,
  onPageSizeChange,
  shownCount,
  totalCount,
  dataset,
  headMode = false,
  onToggleHead,
}) {
  const [columnMenuOpen, setColumnMenuOpen] = useState(false)
  const { exporting, exportar } = useExport()

  const handleExport = (formato) => {
    if (dataset) exportar(dataset, formato)
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.row}>
        <input
          type="search"
          className={styles.search}
          placeholder="Buscar em todas as colunas..."
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <div className={styles.columnMenuWrapper}>
          <button
            type="button"
            className={styles.button}
            onClick={() => setColumnMenuOpen((open) => !open)}
          >
            Colunas ▾
          </button>
          {columnMenuOpen && (
            <div className={styles.columnMenu}>
              {columns.map((column) => (
                <label key={column.key} className={styles.columnOption}>
                  <input
                    type="checkbox"
                    checked={visibleColumns[column.key] !== false}
                    onChange={() => onToggleColumn(column.key)}
                  />
                  {column.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`${styles.button} ${headMode ? styles.activeButton : ''}`}
          onClick={onToggleHead}
          title="Mostrar apenas as 5 primeiras linhas"
        >
          {headMode ? 'Head: 5 linhas' : 'Head'}
        </button>

        <select
          className={styles.select}
          value={pageSize}
          onChange={(event) => {
            const value = event.target.value
            onPageSizeChange(value === 'Todos' ? 'Todos' : Number(value))
          }}
          aria-label="Itens por página"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === 'Todos' ? 'Todos' : `${option} / página`}
            </option>
          ))}
        </select>

        <div className={styles.exportButtons}>
          <button
            type="button"
            className={styles.button}
            onClick={() => handleExport('csv')}
            disabled={!dataset || exporting}
          >
            Exportar CSV
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => handleExport('json')}
            disabled={!dataset || exporting}
          >
            Exportar JSON
          </button>
        </div>
      </div>

      <p className={styles.counter}>
        Mostrando {shownCount.toLocaleString('pt-BR')} de {totalCount.toLocaleString('pt-BR')} registros
      </p>
    </div>
  )
}

export default TableToolbar
