import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  telegram: (initData) => api.post('/auth/telegram', { init_data: initData }),
  me: () => api.get('/auth/me')
}

export const lessonsAPI = {
  getModules: () => api.get('/lessons/modules'),
  getModuleLessons: (moduleId) => api.get(`/lessons/modules/${moduleId}/lessons`),
  getLesson: (lessonId) => api.get(`/lessons/${lessonId}`),
  completeLesson: (lessonId) => api.post(`/lessons/${lessonId}/complete`)
}

export const quizAPI = {
  getQuiz: (quizId) => api.get(`/quiz/${quizId}`),
  submitQuiz: (quizId, answers) => api.post(`/quiz/${quizId}/submit`, { answers })
}

export const gamificationAPI = {
  getStats: () => api.get('/gamification/stats'),
  getXPHistory: (limit = 20) => api.get(`/gamification/xp-history?limit=${limit}`),
  claimDaily: () => api.post('/gamification/daily-challenge')
}

export const leaderboardAPI = {
  getGlobal: (limit = 10) => api.get(`/leaderboard/global?limit=${limit}`),
  getWeekly: (limit = 10) => api.get(`/leaderboard/weekly?limit=${limit}`)
}

export const paymentAPI = {
  getPlans: () => api.get('/payment/plans'),
  uploadScreenshot: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/payment/upload-screenshot', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  createRequest: (planType, screenshotUrl) => api.post('/payment/request', { plan_type: planType, screenshot_url: screenshotUrl }),
  getStatus: () => api.get('/payment/status')
}

export const newsAPI = {
  getAll: (skip = 0, limit = 20) => api.get(`/news?skip=${skip}&limit=${limit}`),
  getPinned: () => api.get('/news/pinned'),
  getById: (id) => api.get(`/news/${id}`)
}

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
  createQuiz: (data) => api.post('/admin/quizzes', data),
  addQuestion: (quizId, data) => api.post(`/admin/quizzes/${quizId}/questions`, data),
  deleteQuiz: (id) => api.delete(`/admin/quizzes/${id}`),
  getPendingPayments: () => api.get('/payment/admin/pending'),
  reviewPayment: (id, approved, note) => api.post(`/payment/admin/${id}/review`, { approved, note }),
  createNews: (data) => api.post('/news', data),
  updateNews: (id, data) => api.put(`/news/${id}`, data),
  deleteNews: (id) => api.delete(`/news/${id}`),
  toggleNewsPin: (id) => api.post(`/news/${id}/pin`)
}

export default api