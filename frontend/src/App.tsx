import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/Dashboard'
import ForecastPage from './pages/Forecast'
import LoginPage from './pages/Login'
import RecommendationsPage from './pages/Recommendations'
import RegisterPage from './pages/Register'
import UploadPage from './pages/Upload'
import { getMe } from './services/auth'
import { useAuthStore } from './store/auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/upload" replace />
  return <>{children}</>
}

function App() {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      import('./lib/api').then(({ setAccessToken }) => {
        setAccessToken(token)
        getMe().then(setUser).catch(() => {
          localStorage.removeItem('access_token')
          setUser(null)
        })
      })
    }
  }, [setUser])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
