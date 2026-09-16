import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Mail, Lock, User, Briefcase } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'student', label: '👤 Student', desc: 'Track skills and get recommendations' },
  { value: 'faculty', label: '👨‍🏫 Faculty', desc: 'Monitor student competency' },
  { value: 'industry', label: '🏢 Industry', desc: 'Post requirements, view talent' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register(email, password, fullName, role)
      toast.success('Account created!')
      const routes: Record<string, string> = { student: '/student/dashboard', faculty: '/faculty/dashboard', industry: '/industry/dashboard' }
      navigate(routes[role] || '/student/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Brain size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Create Account</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Join the SkillSync Portal</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Role Selection */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>I am a…</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    style={{ padding: '0.75rem 0.5rem', borderRadius: 8, border: `2px solid ${role === r.value ? '#3b82f6' : 'rgba(148,163,184,0.15)'}`, background: role === r.value ? 'rgba(59,130,246,0.1)' : '#1e293b', cursor: 'pointer', color: role === r.value ? '#60a5fa' : '#94a3b8', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s', textAlign: 'center' }}>
                    <div>{r.label}</div>
                    <div style={{ fontSize: '0.7rem', marginTop: 2, fontWeight: 400 }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input className="input" style={{ paddingLeft: '2.25rem' }} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" required />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input className="input" style={{ paddingLeft: '2.25rem' }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Password (min 8 chars)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input className="input" style={{ paddingLeft: '2.25rem' }} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={8} required />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
