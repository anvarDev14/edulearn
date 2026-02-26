import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AdminQuizzes from './pages/admin/Quizzes'
import Quiz from './pages/Quiz'


// Pages
import Home from './pages/Home'
import Modules from './pages/Modules'
import ModuleLessons from './pages/ModuleLessons'
import Lesson from './pages/Lesson'
import Quiz from './pages/Quiz'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Premium from './pages/Premium'
import News from './pages/News'
import Settings from './pages/Settings'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminModules from './pages/admin/Modules'
import AdminPayments from './pages/admin/Payments'

// Components
import BottomNav from './components/layout/BottomNav'
import Loader from './components/common/Loader'

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  
  if (loading) return <Loader />
  if (!user) return <Navigate to="/" replace />
  if (adminOnly && !user.is_admin) return <Navigate to="/" replace />
  
  return children
}

function AppContent() {
  const { loading } = useAuth()
  
  if (loading) return <Loader fullScreen />
  
  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/modules/:moduleId" element={<ModuleLessons />} />
        <Route path="/lesson/:lessonId" element={<Lesson />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/news" element={<News />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin/quizzes" element={<AdminQuizzes />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <PrivateRoute adminOnly>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute adminOnly>
            <AdminUsers />
          </PrivateRoute>
        } />
        <Route path="/admin/modules" element={
          <PrivateRoute adminOnly>
            <AdminModules />
          </PrivateRoute>
        } />
        <Route path="/admin/payments" element={
          <PrivateRoute adminOnly>
            <AdminPayments />
          </PrivateRoute>
        } />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
