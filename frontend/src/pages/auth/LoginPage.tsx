import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      // Navigate based on stored user role
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        const routes: Record<string, string> = {
          student: '/student/dashboard',
          faculty: '/faculty/dashboard',
          admin: '/admin/dashboard',
          industry: '/industry/dashboard',
        }
        navigate(routes[user.role] || '/student/dashboard')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (email: string) => {
    setEmail(email)
    setPassword('Demo@1234')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Brain size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Welcome Back</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>SkillSync Portal — SIH 2026</p>
        </div>

        {/* Quick login buttons */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', textAlign: 'center' }}>Quick Demo Login</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              ['👤 Student', 'student@example.com'],
              ['👨‍🏫 Faculty', 'faculty@example.com'],
              ['🔧 Admin', 'admin@example.com'],
              ['🏢 Industry', 'industry@example.com'],
            ].map(([label, em]) => (
              <button key={em} onClick={() => quickLogin(em)} className="btn-secondary" style={{ fontSize: '0.8rem', justifyContent: 'center' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input className="input" style={{ paddingLeft: '2.25rem' }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input className="input" style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }} type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
          </p>
        </div>

        <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
