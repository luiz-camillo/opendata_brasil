import { Loader2 } from 'lucide-react'
import styles from './Loading.module.css'

/**
 * Loading displays a simple animated spinner with an optional message.
 * @param {{ message?: string }} props
 */
function Loading({ message = 'Carregando...' }) {
  return (
    <div className={styles.wrapper}>
      <Loader2 className={styles.spinner} size={40} strokeWidth={2} aria-hidden="true" />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  )
}

export default Loading
