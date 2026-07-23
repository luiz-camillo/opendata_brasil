import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import Loading from './components/common/Loading'
import { routes } from './config/routes'

/**
 * App is the root component. It sets up client-side routing (HashRouter,
 * suitable for static hosting such as GitHub Pages), wraps all pages in the
 * shared Layout, and lazily loads each route's page component, guarding
 * every route with its own ErrorBoundary and Suspense fallback.
 */
function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          {routes.map((route) => {
            const LazyPage = lazy(route.component)
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<Loading />}>
                      <LazyPage />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
            )
          })}
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
