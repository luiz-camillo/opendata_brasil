import { useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useDebounce } from '../../hooks/useDebounce'
import TableToolbar from './TableToolbar'
import EmptyState from '../common/EmptyState'
import styles from './DataTable.module.css'

const ROW_HEIGHT = 44

/**
 * Virtualized, searchable, sortable data table used by the Data
 * Explorer page. Handles thousands of rows smoothly via
 * `@tanstack/react-virtual`.
 *
 * @param {{
 *   data: Array<Record<string, any>>,
 *   columns: Array<{ key: string, label: string, format?: (value: any) => string }>,
 *   datasetInfo?: { source?: string, lastUpdated?: string|Date, totalRecords?: number },
 *   dataset?: import('../../models/Dataset').Dataset|null,
 * }} props
 */
function DataTable({ data = [], columns = [], datasetInfo, dataset = null }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [sortKey, setSortKey] = useState(null)
  const [sortDirection, setSortDirection] = useState(null) // 'asc' | 'desc' | null
  const [visibleColumns, setVisibleColumns] = useState(() =>
    Object.fromEntries(columns.map((column) => [column.key, true]))
  )
  const [pageSize, setPageSize] = useState(25)
  const [page, setPage] = useState(1)
  const [headMode, setHeadMode] = useState(false)

  const parentRef = useRef(null)

  const HEAD_SIZE = 5

  const filteredData = useMemo(() => {
    const termo = debouncedSearch.trim().toLowerCase()
    if (!termo) return data
    return data.filter((row) =>
      columns.some((column) => {
        const valor = row[column.key]
        return valor != null && String(valor).toLowerCase().includes(termo)
      })
    )
  }, [data, columns, debouncedSearch])

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData
    const copia = [...filteredData]
    copia.sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDirection === 'asc' ? va - vb : vb - va
      }
      const sa = String(va).toLowerCase()
      const sb = String(vb).toLowerCase()
      if (sa < sb) return sortDirection === 'asc' ? -1 : 1
      if (sa > sb) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return copia
  }, [filteredData, sortKey, sortDirection])

  const totalPages = pageSize === 'Todos' ? 1 : Math.max(1, Math.ceil(sortedData.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pagedData = useMemo(() => {
    if (headMode) return sortedData.slice(0, HEAD_SIZE)
    if (pageSize === 'Todos') return sortedData
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, pageSize, currentPage, headMode])

  const activeColumns = columns.filter((column) => visibleColumns[column.key] !== false)

  const rowVirtualizer = useVirtualizer({
    count: pagedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  const handleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDirection('asc')
    } else if (sortDirection === 'asc') {
      setSortDirection('desc')
    } else if (sortDirection === 'desc') {
      setSortKey(null)
      setSortDirection(null)
    } else {
      setSortDirection('asc')
    }
  }

  const toggleColumn = (key) => {
    setVisibleColumns((atual) => ({ ...atual, [key]: atual[key] === false }))
  }

  const handlePageSizeChange = (value) => {
    setPageSize(value)
    setPage(1)
  }

  const sortIndicator = (key) => {
    if (sortKey !== key) return ''
    return sortDirection === 'asc' ? ' ▲' : sortDirection === 'desc' ? ' ▼' : ''
  }

  return (
    <div className={styles.wrapper}>
      {datasetInfo && (
        <div className={styles.datasetInfo}>
          {datasetInfo.source && (
            <span>
              Fonte: <strong>{datasetInfo.source}</strong>
            </span>
          )}
          {datasetInfo.lastUpdated && (
            <span>
              Atualizado em:{' '}
              <strong>
                {new Date(datasetInfo.lastUpdated).toLocaleString('pt-BR')}
              </strong>
            </span>
          )}
          {datasetInfo.totalRecords != null && (
            <span>
              Total de registros: <strong>{datasetInfo.totalRecords.toLocaleString('pt-BR')}</strong>
            </span>
          )}
        </div>
      )}

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        columns={columns}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        shownCount={pagedData.length}
        totalCount={sortedData.length}
        dataset={dataset}
        headMode={headMode}
        onToggleHead={() => setHeadMode((v) => !v)}
      />

      {sortedData.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Nenhum registro encontrado"
          description="Ajuste os filtros ou o termo de busca."
        />
      ) : (
        <div className={styles.tableScroll}>
          <div className={styles.tableInner}>
            <div className={styles.headerRow} style={{ gridTemplateColumns: `repeat(${activeColumns.length}, minmax(140px, 1fr))` }}>
              {activeColumns.map((column) => (
                <button
                  type="button"
                  key={column.key}
                  className={styles.headerCell}
                  onClick={() => handleSort(column.key)}
                >
                  {column.label}
                  {sortIndicator(column.key)}
                </button>
              ))}
            </div>

            <div ref={parentRef} className={styles.body}>
              <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = pagedData[virtualRow.index]
                  return (
                    <div
                      key={virtualRow.key}
                      className={virtualRow.index % 2 === 0 ? styles.row : `${styles.row} ${styles.rowAlt}`}
                      style={{
                        gridTemplateColumns: `repeat(${activeColumns.length}, minmax(140px, 1fr))`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: virtualRow.size,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {activeColumns.map((column) => {
                        const valor = row[column.key]
                        return (
                          <div className={styles.cell} key={column.key} title={String(valor ?? '')}>
                            {column.format ? column.format(valor) : (valor ?? '—')}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {pageSize !== 'Todos' && totalPages > 1 && !headMode && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className={styles.pageInfo}>
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

export default DataTable
