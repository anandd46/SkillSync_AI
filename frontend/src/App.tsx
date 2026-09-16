import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Student
import StudentDashboard from './pages/student/StudentDashboard'
import StudentSkills from './pages/student/StudentSkills'
import StudentGaps from './pages/student/StudentGaps'
import StudentRecommendations from './pages/student/StudentRecommendations'
import StudentAssessments from './pages/student/StudentAssessments'
import StudentProgress from './pages/student/StudentProgress'
import StudentJobs from './pages/student/StudentJobs'
import StudentProfile from './pages/student/StudentProfile'

// Faculty
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import FacultyStudents from './pages/faculty/FacultyStudents'
import FacultyAnalytics from './pages/faculty/FacultyAnalytics'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCurriculum from './pages/admin/AdminCurriculum'
import AdminReports from './pages/admin/AdminReports'
import AdminAudit from './pages/admin/AdminAudit'

// Industry
import IndustryDashboard from './pages/industry/IndustryDashboard'
import IndustryJobs from './pages/industry/IndustryJobs'
import IndustryFeedback from './pages/industry/IndustryFeedback'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-pulse-glow" style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', margin: '0 auto 1rem' }} />
        <p style={{ color: '#94a3b8' }}>Loading…</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  switch (user.role) {
    case 'student': return <Navigate to="/student/dashboard" replace />
    case 'faculty': return <Navigate to="/faculty/dashboard" replace />
    case 'admin': return <Navigate to="/admin/dashboard" replace />
    case 'industry': return <Navigate to="/industry/dashboard" replace />
    default: return <Navigate to="/login" replace />
  }
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <RoleRedirect /> : <LandingPage />} />
      <Route path="/login" element={user ? <RoleRedirect /> : <LoginPage />} />
      <Route path="/register" element={user ? <RoleRedirect /> : <RegisterPage />} />

      {/* Student */}
      <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/skills" element={<ProtectedRoute roles={['student']}><StudentSkills /></ProtectedRoute>} />
      <Route path="/student/skill-gaps" element={<ProtectedRoute roles={['student']}><StudentGaps /></ProtectedRoute>} />
      <Route path="/student/recommendations" element={<ProtectedRoute roles={['student']}><StudentRecommendations /></ProtectedRoute>} />
      <Route path="/student/assessments" element={<ProtectedRoute roles={['student']}><StudentAssessments /></ProtectedRoute>} />
      <Route path="/student/progress" element={<ProtectedRoute roles={['student']}><StudentProgress /></ProtectedRoute>} />
      <Route path="/student/jobs" element={<ProtectedRoute roles={['student']}><StudentJobs /></ProtectedRoute>} />

      {/* Faculty */}
      <Route path="/faculty/dashboard" element={<ProtectedRoute roles={['faculty', 'admin']}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/students" element={<ProtectedRoute roles={['faculty', 'admin']}><FacultyStudents /></ProtectedRoute>} />
      <Route path="/faculty/analytics" element={<ProtectedRoute roles={['faculty', 'admin']}><FacultyAnalytics /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/curriculum" element={<ProtectedRoute roles={['admin']}><AdminCurriculum /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute roles={['admin']}><AdminAudit /></ProtectedRoute>} />

      {/* Industry */}
      <Route path="/industry/dashboard" element={<ProtectedRoute roles={['industry', 'admin']}><IndustryDashboard /></ProtectedRoute>} />
      <Route path="/industry/jobs" element={<ProtectedRoute roles={['industry', 'admin']}><IndustryJobs /></ProtectedRoute>} />
      <Route path="/industry/feedback" element={<ProtectedRoute roles={['industry', 'admin']}><IndustryFeedback /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
