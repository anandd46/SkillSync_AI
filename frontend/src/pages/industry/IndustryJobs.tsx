import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { industryAPI } from '../../services/api'
import { Briefcase, Plus, Upload, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function IndustryJobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newRole, setNewRole] = useState({ title: '', category: '', description: '' })
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [roleSkills, setRoleSkills] = useState<any[]>([])
  const [jdText, setJdText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const res = await industryAPI.listJobRoles()
      setJobs(res.data)
    } catch { toast.error('Failed to load jobs') }
    finally { setLoading(false) }
  }

  const handleCreateRole = async () => {
    if (!newRole.title) return
    setCreating(true)
    try {
      await industryAPI.createJobRole(newRole)
      toast.success('Job role created!')
      setNewRole({ title: '', category: '', description: '' })
      setShowCreateForm(false)
      await loadJobs()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create role')
    } finally { setCreating(false) }
  }

  const loadRoleSkills = async (roleId: number) => {
    const res = await industryAPI.getJobRoleSkills(roleId)
    setRoleSkills(res.data)
  }

  const handleSelectRole = async (job: any) => {
    setSelectedRole(job)
    await loadRoleSkills(job.id)
  }

  const handleExtractJD = async () => {
    if (!selectedRole || !jdText.trim()) return
    setExtracting(true)
    try {
      const res = await industryAPI.extractSkillsFromJD(selectedRole.id, jdText)
      toast.success(`Extracted ${res.data.extracted_skills?.length || 0} skills!`)
      setJdText('')
      await loadRoleSkills(selectedRole.id)
    } catch { toast.error('Extraction failed') }
    finally { setExtracting(false) }
  }

  const LEVEL_NAMES: Record<number, string> = { 1: 'Beginner', 2: 'Basic', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' }

  if (selectedRole) {
    return (
      <DashboardLayout title={`Skills: ${selectedRole.title}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <button className="btn-secondary" onClick={() => setSelectedRole(null)} style={{ alignSelf: 'flex-start' }}>← Back to Jobs</button>

          {/* JD Upload */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🤖 AI Skill Extraction from Job Description</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Paste a job description and our AI will automatically extract and add required skills.</p>
            <textarea className="input" rows={6} value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste job description text here…" style={{ resize: 'vertical', marginBottom: '0.75rem' }} />
            <button className="btn-primary" onClick={handleExtractJD} disabled={extracting || !jdText.trim()}>
              <Upload size={16} />
              {extracting ? 'Extracting…' : 'Extract Skills with AI'}
            </button>
          </div>

          {/* Skills list */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Required Skills ({roleSkills.length})</h3>
            {roleSkills.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No skills added yet. Use AI extraction above.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {roleSkills.map(skill => (
                  <div key={skill.id} className="card" style={{ padding: '1rem', borderLeft: '3px solid #3b82f6' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{skill.skill_name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-blue">{LEVEL_NAMES[skill.required_level] || `L${skill.required_level}`}</span>
                      {skill.is_mandatory && <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>Mandatory</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Job Roles">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus size={16} />
            Add Job Role
          </button>
        </div>

        {showCreateForm && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Create Job Role</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder="Job title (e.g. AI/ML Engineer)" value={newRole.title} onChange={e => setNewRole(f => ({ ...f, title: e.target.value }))} />
              <input className="input" placeholder="Category (e.g. Engineering, Data Science)" value={newRole.category} onChange={e => setNewRole(f => ({ ...f, category: e.target.value }))} />
              <textarea className="input" rows={3} placeholder="Job description…" value={newRole.description} onChange={e => setNewRole(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleCreateRole} disabled={creating}>
                  {creating ? 'Creating…' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading…</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {jobs.map(job => (
              <div key={job.id} className="card" style={{ cursor: 'pointer' }} onClick={() => handleSelectRole(job)}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={18} color="#60a5fa" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{job.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{job.company}</div>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
                {job.category && <span className="badge badge-blue">{job.category}</span>}
                {job.description && <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.5 }}>{job.description?.slice(0, 100)}…</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
