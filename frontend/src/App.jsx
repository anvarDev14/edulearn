import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Auth
import Login from './pages/Login'

// Main Pages
import Home from './pages/Home'
import Modules from './pages/Modules'
import ModuleLessons from './pages/ModuleLessons'
import Lesson from './pages/Lesson'
import Quiz from './pages/Quiz'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Premium from './pages/Premium'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Settings from './pages/Settings'
import Search from './pages/Search'
import Challenges from './pages/Challenges'
import AIChat from './pages/AIChat'
import Bookmarks from './pages/Bookmarks'
import Certificates from './pages/Certificates'
import Friends from './pages/Friends'
import AudioLibrary from './pages/AudioLibrary'
import AudioCategory from './pages/AudioCategory'
import AudioPlayer from './pages/AudioPlayer'
import BookLibrary from './pages/BookLibrary'
import BookCategory from './pages/BookCategory'
import BookDetail from './pages/BookDetail'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminModules from './pages/admin/Modules'
import AdminPayments from './pages/admin/Payments'
import AdminQuizzes from './pages/admin/Quizzes'
import AdminQuizCreate from './pages/admin/QuizCreate'
import AdminQuizAICreate from './pages/admin/QuizAICreate'
import AdminSettings from './pages/admin/Settings'
import AdminNews from './pages/admin/News'
import AdminAudio from './pages/admin/Audio'
import AdminBooks from './pages/admin/Books'

// Components
import BottomNav from './components/layout/BottomNav'
import Loader from './components/common/Loader'

import './styles/globals.css'

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !user.is_admin) return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const { loading } = useAuth()
  if (loading) return <Loader />
  return children
}

function AppContent() {
  const { loading } = useAuth()

  if (loading) return <Loader fullScreen />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="app-shell">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Protected */}
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/modules" element={<PrivateRoute><Modules /></PrivateRoute>} />
          <Route path="/modules/:moduleId" element={<PrivateRoute><ModuleLessons /></PrivateRoute>} />
          <Route path="/lesson/:lessonId" element={<PrivateRoute><Lesson /></PrivateRoute>} />
          <Route path="/quiz/:quizId" element={<PrivateRoute><Quiz /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/premium" element={<PrivateRoute><Premium /></PrivateRoute>} />
          <Route path="/news" element={<PrivateRoute><News /></PrivateRoute>} />
          <Route path="/news/:id" element={<PrivateRoute><NewsDetail /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
          <Route path="/challenges" element={<PrivateRoute><Challenges /></PrivateRoute>} />
          <Route path="/ai-chat" element={<PrivateRoute><AIChat /></PrivateRoute>} />
          <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
          <Route path="/certificates" element={<PrivateRoute><Certificates /></PrivateRoute>} />
          <Route path="/friends" element={<PrivateRoute><Friends /></PrivateRoute>} />

          {/* Audio Library */}
          <Route path="/audio" element={<PrivateRoute><AudioLibrary /></PrivateRoute>} />
          <Route path="/audio/:categoryId" element={<PrivateRoute><AudioCategory /></PrivateRoute>} />
          <Route path="/audio/player/:audioId" element={<PrivateRoute><AudioPlayer /></PrivateRoute>} />

          {/* Books Library */}
          <Route path="/books" element={<PrivateRoute><BookLibrary /></PrivateRoute>} />
          <Route path="/books/:categoryId" element={<PrivateRoute><BookCategory /></PrivateRoute>} />
          <Route path="/books/detail/:bookId" element={<PrivateRoute><BookDetail /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/modules" element={<PrivateRoute adminOnly><AdminModules /></PrivateRoute>} />
          <Route path="/admin/quizzes" element={<PrivateRoute adminOnly><AdminQuizzes /></PrivateRoute>} />
          <Route path="/admin/quizzes/create" element={<PrivateRoute adminOnly><AdminQuizCreate /></PrivateRoute>} />
          <Route path="/admin/quizzes/ai-create" element={<PrivateRoute adminOnly><AdminQuizAICreate /></PrivateRoute>} />
          <Route path="/admin/payments" element={<PrivateRoute adminOnly><AdminPayments /></PrivateRoute>} />
          <Route path="/admin/settings" element={<PrivateRoute adminOnly><AdminSettings /></PrivateRoute>} />
          <Route path="/admin/news" element={<PrivateRoute adminOnly><AdminNews /></PrivateRoute>} />
          <Route path="/admin/audio" element={<PrivateRoute adminOnly><AdminAudio /></PrivateRoute>} />
          <Route path="/admin/books" element={<PrivateRoute adminOnly><AdminBooks /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
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
