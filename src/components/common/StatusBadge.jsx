import styles from './StatusBadge.module.css'

const STATUS_CLASS = {
  online: 'online',
  offline: 'offline',
  checking: 'checking',
}

/**
 * Small colored badge indicating a status: online (green), offline (red)
 * or checking (yellow).
 *
 * @param {{ status: 'online'|'offline'|'checking', label?: string }} props
 */
function StatusBadge({ status, label }) {
  const statusClass = STATUS_CLASS[status] ?? 'checking'
  const texto = label ?? { online: 'Online', offline: 'Offline', checking: 'Verificando...' }[status]

  return (
    <span className={`${styles.badge} ${styles[statusClass]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {texto}
    </span>
  )
}

export default StatusBadge
