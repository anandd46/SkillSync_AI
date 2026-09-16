import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { studentsAPI, industryAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function StudentProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ bio: '', linkedin_url: '', github_url: '', career_goal: '', cgpa: '' })

  useEffect(() => {
    Promise.all([studentsAPI.getProfile(), industryAPI.listJobRoles()])
      .then(([pRes, jRes]) => {
        const p = pRes.data
        setProfile(p)
        setJobs(jRes.data)
        setForm({
          bio: p.student?.bio || '',
          linkedin_url: p.student?.linkedin_url || '',
          github_url: p.student?.github_url || '',
          career_goal: p.student?.career_goal || '',
          cgpa: p.student?.cgpa?.toString() || '',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await studentsAPI.updateProfile({ ...form, cgpa: form.cgpa ? parseFloat(form.cgpa) : null })
      toast.success('Profile updated!')
      const pRes = await studentsAPI.getProfile()
      setProfile(pRes.data)
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <DashboardLayout title="Profile"><div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading…</div></DashboardLayout>

  return (
    <DashboardLayout title="My Profile">
      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Avatar + name */}
        <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 }}>
            {user?.full_name?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{user?.full_name}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{user?.email}</div>
            <div style={{ color: '#60a5fa', fontSize: '0.875rem', marginTop: 2 }}>🎓 Student</div>
          </div>
        </div>

        {/* Profile completion */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: 600 }}>Profile Completion</span>
            <span style={{ color: '#60a5fa', fontWeight: 700 }}>{Math.round(profile?.student?.profile_completion || 0)}%</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${profile?.student?.profile_completion || 0}%` }} />
          </div>
        </div>

        {/* Editable fields */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontWeight: 700, margin: 0 }}>Edit Profile</h3>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Career Goal / Target Role</label>
            <input className="input" value={form.career_goal} onChange={e => setForm(f => ({ ...f, career_goal: e.target.value }))} placeholder="e.g. AI/ML Engineer" />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Bio</label>
            <textarea className="input" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell employers about yourself…" style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>GitHub URL</label>
              <input className="input" value={form.github_url} onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))} placeholder="https://github.com/…" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>LinkedIn URL</label>
              <input className="input" value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/…" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>CGPA</label>
            <input className="input" type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={e => setForm(f => ({ ...f, cgpa: e.target.value }))} placeholder="e.g. 8.5" />
          </div>

          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Roll No</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>{profile?.student?.roll_number || '—'}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Batch</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>{profile?.student?.batch_year || '—'}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>CGPA</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>{profile?.student?.cgpa || '—'}</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
