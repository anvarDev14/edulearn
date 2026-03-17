import axios from 'axios'

// Use explicit API URL if provided, otherwise fall back to same-origin `/api`.
// This ensures the frontend and bot talk to the same backend instance/database.
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth API
export const authAPI = {
  loginWithCode: (code) => api.post('/auth/code', { code }),
  telegram: (initData) => api.post('/auth/telegram', { init_data: initData }),
  me: () => api.get('/auth/me')
}

// Lessons API
export const lessonsAPI = {
  getModules: () => api.get('/lessons/modules'),
  getModuleLessons: (moduleId) => api.get(`/lessons/modules/${moduleId}/lessons`),
  getLesson: (lessonId) => api.get(`/lessons/${lessonId}`),
  completeLesson: (lessonId) => api.post(`/lessons/${lessonId}/complete`)
}

// Quiz API
export const quizAPI = {
  getQuiz: (quizId) => api.get(`/quiz/${quizId}`),
  submitQuiz: (quizId, answers) => api.post(`/quiz/${quizId}/submit`, { answers })
}

// Gamification API
export const gamificationAPI = {
  getStats: () => api.get('/gamification/stats'),
  getXPHistory: (limit = 20) => api.get(`/gamification/xp-history?limit=${limit}`),
  claimDaily: () => api.post('/gamification/daily-challenge')
}

// Leaderboard API
export const leaderboardAPI = {
  getGlobal: (limit = 10) => api.get(`/leaderboard/global?limit=${limit}`),
  getWeekly: (limit = 10) => api.get(`/leaderboard/weekly?limit=${limit}`)
}

// Payment API
export const paymentAPI = {
  getPlans: () => api.get('/payment/plans'),
  uploadScreenshot: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/payment/upload-screenshot', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  createRequest: (planType, screenshotUrl) =>
    api.post('/payment/request', { plan_type: planType, screenshot_url: screenshotUrl }),
  getStatus: () => api.get('/payment/status')
}

// News API
export const newsAPI = {
  getAll: (skip = 0, limit = 20) => api.get(`/news?skip=${skip}&limit=${limit}`),
  getPinned: () => api.get('/news/pinned'),
  getById: (id) => api.get(`/news/${id}`)
}

// Friends API
export const friendsAPI = {
  getFriends: () => api.get('/friends'),
  getRequests: () => api.get('/friends/requests'),
  sendRequest: (userId) => api.post(`/friends/request/${userId}`),
  acceptRequest: (friendshipId) => api.post(`/friends/accept/${friendshipId}`),
  removeFriend: (friendshipId) => api.delete(`/friends/${friendshipId}`)
}

// Bookmarks API
export const bookmarksAPI = {
  getAll: () => api.get('/bookmarks'),
  add: (contentType, contentId, title) => api.post('/bookmarks', { content_type: contentType, content_id: contentId, title }),
  remove: (id) => api.delete(`/bookmarks/${id}`)
}

// Certificates API
export const certificatesAPI = {
  getMy: () => api.get('/certificates'),
  claim: (moduleId) => api.post(`/certificates/claim/${moduleId}`)
}

// Search API
export const searchAPI = {
  search: (q) => api.get(`/search?q=${encodeURIComponent(q)}`)
}

// Challenges API
export const challengesAPI = {
  getAll: () => api.get('/challenges'),
  getActive: () => api.get('/challenges/active')
}

// AI API
export const aiAPI = {
  chat: (message, history = [], lessonId = null) =>
    api.post('/ai/chat', { message, history, lesson_id: lessonId }),
  explain: (text, lessonId = null) =>
    api.post('/ai/explain', { text, lesson_id: lessonId }),
  getHistory: (lessonId = null) =>
    api.get(`/ai/history${lessonId ? `?lesson_id=${lessonId}` : ''}`)
}

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (skip = 0, limit = 50) => api.get(`/admin/users?skip=${skip}&limit=${limit}`),
  grantPremium: (userId, days) => api.post(`/admin/users/${userId}/grant-premium`, { days }),
  revokePremium: (userId) => api.post(`/admin/users/${userId}/revoke-premium`),
  toggleAdmin: (userId) => api.post(`/admin/users/${userId}/toggle-admin`),
  getModules: () => api.get('/admin/modules'),
  createModule: (data) => api.post('/admin/modules', data),
  deleteModule: (id) => api.delete(`/admin/modules/${id}`),
  createLesson: (data) => api.post('/admin/lessons', data),
  deleteLesson: (id) => api.delete(`/admin/lessons/${id}`),
  getQuizzes: () => api.get('/admin/quizzes'),
  createQuiz: (data) => api.post('/admin/quizzes', data),
  addQuestion: (quizId, data) => api.post(`/admin/quizzes/${quizId}/questions`, data),
  deleteQuiz: (id) => api.delete(`/admin/quizzes/${id}`),
  createNews: (data) => api.post('/news', data),
  deleteNews: (id) => api.delete(`/news/${id}`),
  toggleNewsPin: (id) => api.post(`/news/${id}/pin`),
  getPendingPayments: () => api.get('/payment/admin/pending'),
  reviewPayment: (id, approved, note) =>
    api.post(`/payment/admin/${id}/review`, { approved, note }),
  // Challenges admin
  createChallenge: (data) => api.post('/admin/challenges', data),
  deleteChallenge: (id) => api.delete(`/admin/challenges/${id}`)
}

export default api
