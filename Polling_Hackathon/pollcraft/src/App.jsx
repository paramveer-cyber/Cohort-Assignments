import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import PageLoader from './components/ui/PageLoader.jsx'

const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const CreatePollPage = lazy(() => import('./pages/CreatePollPage.jsx'))
const EditPollPage = lazy(() => import('./pages/EditPollPage.jsx'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx'))
const PublicAnalyticsPage = lazy(() => import('./pages/PublicAnalyticsPage.jsx'))
const PollVotePage = lazy(() => import('./pages/PollVotePage.jsx'))
const DiscoverPage = lazy(() => import('./pages/DiscoverPage.jsx'))
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'))
const UserPage = lazy(() => import('./pages/UserPage.jsx'))
const HelpPage = lazy(() => import('./pages/HelpPage.jsx'))

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/view-:token" element={<PollVotePage />} />
        <Route path="/poll/:slug" element={<PollVotePage />} />
        <Route path="/results/:id" element={<PublicAnalyticsPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreatePollPage /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><EditPollPage /></ProtectedRoute>} />
        <Route path="/analytics/:id" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}