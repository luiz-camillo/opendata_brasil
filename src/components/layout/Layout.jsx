import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { routes } from '../../config/routes'
import Sidebar from './Sidebar'
import styles from './Layout.module.css'

const EXTERNAL_LINKS = [
  { label: 'APIs Públicas', to: '/apis' },
  { label: 'GitHub', href: 'https://github.com' },
]

/**
 * Layout is the top-level application shell: header with branding and
 * primary navigation, a collapsible sidebar, the main content area
 * (rendered via `children`), and a footer.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const currentRoute = routes.find((route) => route.path === location.pathname)

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
          {routes
            .filter((route) => route.showInHeader !== false)
            .map((route) => (
              <Link
                key={route.path}
                className={`${styles.headerLink} ${
                  location.pathname === route.path ? styles.headerLinkActive : ''
                }`}
                to={route.path}
              >
                {route.label}
              </Link>
            ))}
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
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={styles.content}>
          {currentRoute && currentRoute.path !== '/' && (
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link to="/" className={styles.breadcrumbLink}>
                Home
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{currentRoute.label}</span>
            </nav>
          )}
          {children}
        </main>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <span className={styles.brandIcon} aria-hidden="true">
              🇧🇷
            </span>
            OpenData Brasil
            <p className={styles.footerTagline}>Dados públicos abertos e acessíveis.</p>
          </div>

          <nav className={styles.footerNav} aria-label="Navegação do rodapé">
            {routes
              .filter((route) => route.showInFooter !== false)
              .map((route) => (
                <Link key={route.path} className={styles.footerLink} to={route.path}>
                  {route.label}
                </Link>
              ))}
            {EXTERNAL_LINKS.map((link) =>
              link.href ? (
                <a
                  key={link.label}
                  className={styles.footerLink}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} className={styles.footerLink} to={link.to}>
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>

        <p className={styles.footerCopy}>
          © {new Date().getFullYear()} OpenData Brasil. Dados fornecidos por órgãos públicos
          brasileiros.
        </p>
      </footer>
    </div>
  )
}

export default Layout
