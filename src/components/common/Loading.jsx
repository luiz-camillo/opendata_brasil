import styles from './Loading.module.css'

/**
 * Loading displays a simple animated spinner with an optional message.
 * @param {{ message?: string }} props
 */
function Loading({ message = 'Carregando...' }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} role="status" aria-label="loading" />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  )
}

export default Loading
