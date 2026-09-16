import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, full_name: string, role: string) =>
    api.post('/auth/register', { email, password, full_name, role }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// ─── Students ────────────────────────────────────────────────────────────────
export const studentsAPI = {
  getProfile: () => api.get('/students/me'),
  updateProfile: (data: any) => api.put('/students/me', data),
  getSkills: () => api.get('/students/me/skills'),
  getSkillGaps: () => api.get('/students/me/skill-gaps'),
  getReadiness: () => api.get('/students/me/readiness'),
  analyze: () => api.post('/students/me/analyze'),
  getStudentProfile: (id: number) => api.get(`/students/${id}/profile`),
}

// ─── Industry ────────────────────────────────────────────────────────────────
export const industryAPI = {
  getProfile: () => api.get('/industry/me'),
  listJobRoles: () => api.get('/industry/job-roles'),
  createJobRole: (data: any) => api.post('/industry/job-roles', data),
  addJobSkill: (roleId: number, data: any) =>
    api.post(`/industry/job-roles/${roleId}/skills`, data),
  extractSkillsFromJD: (roleId: number, rawText: string) =>
    api.post(`/industry/job-roles/${roleId}/extract-skills`, { raw_text: rawText }),
  getJobRoleSkills: (roleId: number) =>
    api.get(`/industry/job-roles/${roleId}/skills`),
  submitFeedback: (data: any) => api.post('/industry/feedback', data),
}

// ─── Skills ──────────────────────────────────────────────────────────────────
export const skillsAPI = {
  list: (q?: string) => api.get('/skills/', { params: q ? { q } : {} }),
  get: (id: number) => api.get(`/skills/${id}`),
  normalize: (skill_name: string) =>
    api.post('/skills/normalize', { skill_name }),
  extract: (text: string, source = 'unknown') =>
    api.post('/skills/extract', { text, source }),
}

// ─── Assessments ─────────────────────────────────────────────────────────────
export const assessmentsAPI = {
  list: () => api.get('/assessments/'),
  get: (id: number) => api.get(`/assessments/${id}`),
  start: (id: number) => api.post(`/assessments/${id}/start`),
  submit: (id: number, answers: any[]) =>
    api.post(`/assessments/${id}/submit`, { answers }),
  history: () => api.get('/assessments/my/history'),
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsAPI = {
  institution: () => api.get('/analytics/institution'),
  department: (id: number) => api.get(`/analytics/department/${id}`),
  curriculumAlignment: () => api.get('/analytics/curriculum-alignment'),
}

// ─── Recommendations ─────────────────────────────────────────────────────────
export const recommendationsAPI = {
  list: () => api.get('/recommendations/me'),
  complete: (id: number) => api.post(`/recommendations/${id}/complete`),
  dismiss: (id: number) => api.post(`/recommendations/${id}/dismiss`),
}

// ─── Faculty ─────────────────────────────────────────────────────────────────
export const facultyAPI = {
  getStudents: () => api.get('/faculty/students'),
  getDashboardStats: () => api.get('/faculty/dashboard-stats'),
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
}

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: () => api.get('/notifications/'),
  markRead: (id: number) => api.post(`/notifications/${id}/read`),
}

// ─── Documents ───────────────────────────────────────────────────────────────
export const documentsAPI = {
  uploadResume: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/documents/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
