import { NavLink } from 'react-router-dom'
import { routes } from '../../config/routes'
import styles from './Sidebar.module.css'

/**
 * Sidebar renders the primary navigation links for the app, highlighting
 * the currently active route. Collapses off-canvas on mobile viewports.
 *
 * @param {{ isOpen?: boolean, onClose?: () => void }} props
 */
function Sidebar({ isOpen = false, onClose }) {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
    >
      <nav className={styles.nav} aria-label="Navegação principal">
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.linkActive}` : styles.link
            }
          >
            {route.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
