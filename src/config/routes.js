/**
 * Central route configuration for the application.
 * Each entry defines a path, a human-readable label (used in navigation),
 * and a lazy-loaded factory that dynamically imports the page component.
 *
 * Keeping routes declarative here allows both the router (App.jsx) and
 * navigation components (Sidebar.jsx) to share a single source of truth.
 */
export const routes = [
  {
    path: '/',
    label: 'Home',
    component: () => import('../pages/HomePage'),
  },
  {
    path: '/dashboard',
    label: 'Dashboard',
    component: () => import('../pages/DashboardPage'),
  },
  {
    path: '/explorer',
    label: 'Data Explorer',
    component: () => import('../pages/DataExplorerPage'),
  },
  {
    path: '/comparacao',
    label: 'Comparação',
    component: () => import('../pages/ComparisonPage'),
  },
  {
    path: '/apis',
    label: 'APIs',
    component: () => import('../pages/ApiInfoPage'),
  },
]

export default routes
