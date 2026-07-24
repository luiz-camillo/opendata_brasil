import styles from './EmptyState.module.css'

/**
 * Generic empty-state placeholder: icon, title, description and an
 * optional call-to-action button.
 *
 * @param {{
 *   icon?: import('react').ReactNode,
 *   title: string,
 *   description?: string,
 *   actionLabel?: string,
 *   onAction?: () => void,
 * }} props
 */
function EmptyState({ icon = '📭', title, description, actionLabel, onAction }) {
  return (
    <div className={styles.container}>
      <div className={styles.icon} aria-hidden="true">
        {icon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
