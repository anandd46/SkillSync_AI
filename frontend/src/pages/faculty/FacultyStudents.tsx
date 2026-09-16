import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { facultyAPI } from '../../services/api'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FacultyStudents() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    facultyAPI.getStudents()
      .then(r => setStudents(r.data))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s =>
    !search ||
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="My Students">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading…</div> : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Roll No</th><th>Batch</th><th>Career Goal</th><th>Readiness</th><th>Profile</th></tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                    <td style={{ color: '#94a3b8' }}>{s.email}</td>
                    <td style={{ color: '#94a3b8' }}>{s.roll_number || '—'}</td>
                    <td style={{ color: '#94a3b8' }}>{s.batch_year || '—'}</td>
                    <td>{s.career_goal ? <span className="badge badge-blue">{s.career_goal}</span> : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: s.readiness_score >= 75 ? '#10b981' : s.readiness_score >= 60 ? '#3b82f6' : s.readiness_score >= 40 ? '#f59e0b' : '#ef4444' }}>
                        {s.readiness_score?.toFixed(0) ?? '—'}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-bar-fill" style={{ width: `${s.profile_completion || 0}%` }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{Math.round(s.profile_completion || 0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
