import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import styles from './Layout.module.css'

/**
 * Layout is the top-level application shell: header with branding and
 * primary navigation, a collapsible sidebar, the main content area
 * (rendered via `children`), and a footer.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden="true">
            🇧🇷
          </span>
          OpenData Brasil
        </Link>

        <nav className={styles.headerNav} aria-label="Navegação superior">
          <Link className={styles.headerLink} to="/">
            Home
          </Link>
          <Link className={styles.headerLink} to="/dashboard">
            Dashboard
          </Link>
          <Link className={styles.headerLink} to="/explorer">
            Data Explorer
          </Link>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-label="Abrir menu"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          ☰
        </button>
      </header>

      <div className={styles.body}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className={styles.content}>{children}</main>
      </div>

      <footer className={styles.footer}>
        <p>
          OpenData Brasil &copy; {new Date().getFullYear()} — Dados públicos
          abertos e acessíveis.
        </p>
      </footer>
    </div>
  )
}

export default Layout
