import React, { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, User, Star, BookOpen, Target, BarChart3,
  Briefcase, Bell, LogOut, Brain, Menu, X, ChevronRight
} from 'lucide-react'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  student: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/student/dashboard' },
    { icon: User, label: 'Profile', href: '/student/profile' },
    { icon: Star, label: 'My Skills', href: '/student/skills' },
    { icon: Target, label: 'Skill Gaps', href: '/student/skill-gaps' },
    { icon: BookOpen, label: 'Recommendations', href: '/student/recommendations' },
    { icon: BarChart3, label: 'Assessments', href: '/student/assessments' },
    { icon: BarChart3, label: 'Progress', href: '/student/progress' },
    { icon: Briefcase, label: 'Jobs', href: '/student/jobs' },
  ],
  faculty: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/faculty/dashboard' },
    { icon: User, label: 'My Students', href: '/faculty/students' },
    { icon: BarChart3, label: 'Analytics', href: '/faculty/analytics' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: User, label: 'Users', href: '/admin/users' },
    { icon: BookOpen, label: 'Curriculum', href: '/admin/curriculum' },
    { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
    { icon: Target, label: 'Audit Log', href: '/admin/audit' },
  ],
  industry: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/industry/dashboard' },
    { icon: Briefcase, label: 'Job Roles', href: '/industry/jobs' },
    { icon: Star, label: 'Feedback', href: '/industry/feedback' },
  ],
}

const ROLE_COLORS: Record<string, string> = {
  student: '#3b82f6',
  faculty: '#8b5cf6',
  admin: '#10b981',
  industry: '#f59e0b',
}

const ROLE_LABELS: Record<string, string> = {
  student: '👤 Student',
  faculty: '👨‍🏫 Faculty',
  admin: '🔧 Admin',
  industry: '🏢 Industry',
}

export default function DashboardLayout({ children, title }: { children: ReactNode; title?: string }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = NAV_BY_ROLE[user?.role || 'student'] || []
  const roleColor = ROLE_COLORS[user?.role || 'student']

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = () => (
    <div style={{
      width: 240, minHeight: '100vh', background: '#1e293b',
      borderRight: '1px solid rgba(148,163,184,0.1)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Brain size={16} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9' }}>SkillSync</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>SIH 2026</div>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}33, ${roleColor}66)`, border: `2px solid ${roleColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
            {user?.full_name?.[0] || '?'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name}</div>
            <div style={{ fontSize: '0.7rem', color: roleColor }}>{ROLE_LABELS[user?.role || '']}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.href
          return (
            <Link key={item.href} to={item.href} style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
              <div className={`sidebar-link ${isActive ? 'active' : ''}`} style={isActive ? { borderLeft: `3px solid ${roleColor}` } : {}}>
                <item.icon size={16} />
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.625rem', borderTop: '1px solid rgba(148,163,184,0.08)' }}>
        <button className="sidebar-link" onClick={handleLogout} style={{ color: '#ef4444', width: '100%' }}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'none' }} className="lg-sidebar">
        <Sidebar />
      </div>
      <div style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(148,163,184,0.1)', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div>
            {title && <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{title}</h1>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#1e293b', padding: '0.25rem 0.75rem', borderRadius: 9999, border: '1px solid rgba(148,163,184,0.1)' }}>
              AI: Mock Mode
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
