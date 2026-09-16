import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { studentsAPI, skillsAPI, documentsAPI } from '../../services/api'
import { Star, Upload, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const LEVEL_NAMES: Record<number, string> = { 0: 'No Evidence', 1: 'Beginner', 2: 'Basic', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' }
const LEVEL_COLORS: Record<number, string> = { 0: '#94a3b8', 1: '#ef4444', 2: '#f59e0b', 3: '#fbbf24', 4: '#3b82f6', 5: '#10b981' }

export default function StudentSkills() {
  const [skills, setSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    studentsAPI.getSkills()
      .then(r => setSkills(r.data))
      .catch(() => toast.error('Failed to load skills'))
      .finally(() => setLoading(false))
  }, [])

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await documentsAPI.uploadResume(file)
      toast.success(`Resume uploaded! Extracted ${res.data.extracted_skills?.length || 0} skills.`)
      const skillsRes = await studentsAPI.getSkills()
      setSkills(skillsRes.data)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const filtered = skills.filter(s =>
    !search || s.skill_name.toLowerCase().includes(search.toLowerCase())
  )

  const verified = skills.filter(s => s.is_verified).length
  const avgLevel = skills.length > 0 ? (skills.reduce((sum, s) => sum + (s.proficiency_level || 0), 0) / skills.length) : 0

  return (
    <DashboardLayout title="My Skills">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Stats + Upload */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="stat-card" style={{ minWidth: 120 }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Skills</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>{skills.length}</div>
            </div>
            <div className="stat-card" style={{ minWidth: 120 }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Verified</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{verified}</div>
            </div>
            <div className="stat-card" style={{ minWidth: 120 }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Avg Level</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>{avgLevel.toFixed(1)}</div>
            </div>
          </div>
          <label style={{ cursor: 'pointer' }}>
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleResumeUpload} style={{ display: 'none' }} />
            <button className="btn-primary" disabled={uploading} style={{ pointerEvents: 'none' }}>
              <Upload size={16} />
              {uploading ? 'Uploading…' : 'Upload Resume'}
            </button>
          </label>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search skills…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Skills grid */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Star size={48} style={{ margin: '0 auto 1rem', color: '#94a3b8', opacity: 0.5 }} />
            <h3>No skills yet</h3>
            <p style={{ color: '#94a3b8' }}>Upload your resume to auto-extract skills, or take assessments to demonstrate your skills.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {filtered.map(skill => {
              const color = LEVEL_COLORS[skill.proficiency_level || 0]
              return (
                <div key={skill.id} className="card" style={{ borderLeft: `3px solid ${color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{skill.skill_name}</div>
                    {skill.is_verified && <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>✓ Verified</span>}
                  </div>
                  <div style={{ marginBottom: '0.625rem' }}>
                    <span style={{ fontSize: '0.85rem', color, fontWeight: 600 }}>{LEVEL_NAMES[skill.proficiency_level || 0]}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${((skill.proficiency_level || 0) / 5) * 100}%`, background: color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>Level {skill.proficiency_level}/5</span>
                    <span>{skill.evidence_count} evidence items</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
