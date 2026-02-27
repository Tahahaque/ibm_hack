import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { useAppContext } from '@/context/AppContext'
import { CalendarPage } from './pages/CalendarPage'
import { CreateEventPage } from '@/pages/CreateEventPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { FeedPage } from '@/pages/FeedPage'
import { LoginPage } from '@/pages/LoginPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { OrgDashboardPage } from '@/pages/OrgDashboardPage'
import { OrgOnboardingPage } from '@/pages/OrgOnboardingPage'
import { OrgPage } from '@/pages/OrgPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SchedulePage } from './pages/SchedulePage'
import { SelectRolePage } from '@/pages/SelectRolePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAppContext()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { user } = useAppContext()

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to={user ? '/feed' : '/login'} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/select-role" element={<SelectRolePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/org-onboarding" element={<OrgOnboardingPage />} />

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event/:id"
          element={
            <ProtectedRoute>
              <EventDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/org/:id"
          element={
            <ProtectedRoute>
              <OrgPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/org-dashboard"
          element={
            <ProtectedRoute>
              <OrgDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
