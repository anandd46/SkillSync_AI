import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { recommendationsAPI } from '../../services/api'
import { CheckCircle, ExternalLink, Clock, BookOpen, Code, Target, X } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPE_ICONS: Record<string, React.ElementType> = {
  course: BookOpen,
  project: Code,
  tutorial: Target,
  video: Target,
  book: BookOpen,
}

const TYPE_COLORS: Record<string, string> = {
  course: '#3b82f6',
  project: '#10b981',
  tutorial: '#8b5cf6',
  video: '#f59e0b',
  book: '#f59e0b',
}

export default function StudentRecommendations() {
  const [recs, setRecs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    recommendationsAPI.list()
      .then(r => setRecs(r.data))
      .catch(() => toast.error('Failed to load recommendations'))
      .finally(() => setLoading(false))
  }, [])

  const handleComplete = async (id: number) => {
    await recommendationsAPI.complete(id)
    setRecs(recs.map(r => r.id === id ? { ...r, is_completed: true } : r))
    toast.success('Marked as complete!')
  }

  const handleDismiss = async (id: number) => {
    await recommendationsAPI.dismiss(id)
    setRecs(recs.filter(r => r.id !== id))
    toast.success('Dismissed')
  }

  const pending = recs.filter(r => !r.is_completed)
  const completed = recs.filter(r => r.is_completed)
  const filtered = filter === 'completed' ? completed : filter === 'pending' ? pending : recs

  const totalHours = pending.reduce((sum, r) => sum + (r.estimated_hours || 0), 0)

  return (
    <DashboardLayout title="Learning Recommendations">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Pending</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{pending.length}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Completed</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{completed.length}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Est. Hours</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>{totalHours}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Completion</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>
              {recs.length > 0 ? Math.round((completed.length / recs.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem', background: '#1e293b', borderRadius: 10, width: 'fit-content' }}>
          {[['all', 'All'], ['pending', 'Pending'], ['completed', 'Completed']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', background: filter === val ? '#3b82f6' : 'transparent', color: filter === val ? 'white' : '#94a3b8', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Recommendations */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 1rem', color: '#10b981' }} />
            <h3>All done!</h3>
            <p style={{ color: '#94a3b8' }}>Run AI Analysis from the dashboard to generate new recommendations.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((rec, i) => {
              const TypeIcon = TYPE_ICONS[rec.recommendation_type] || Target
              const typeColor = TYPE_COLORS[rec.recommendation_type] || '#94a3b8'
              return (
                <div key={rec.id} className="card" style={{ opacity: rec.is_completed ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {/* Priority badge */}
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${typeColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <TypeIcon size={18} color={typeColor} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rec.title}</div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            {rec.skill_name && <span className="badge badge-blue">{rec.skill_name}</span>}
                            <span className="badge" style={{ background: `${typeColor}15`, color: typeColor }}>{rec.recommendation_type}</span>
                            {rec.estimated_hours && (
                              <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Clock size={10} /> ~{rec.estimated_hours}h
                              </span>
                            )}
                            {rec.is_completed && <span className="badge badge-green">✓ Completed</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                          {rec.resource_url && (
                            <a href={rec.resource_url} target="_blank" rel="noopener noreferrer">
                              <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                                <ExternalLink size={13} /> Open
                              </button>
                            </a>
                          )}
                          {!rec.is_completed && (
                            <button className="btn-primary" onClick={() => handleComplete(rec.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                              <CheckCircle size={13} /> Done
                            </button>
                          )}
                          {!rec.is_completed && (
                            <button onClick={() => handleDismiss(rec.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.35rem' }}>
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* AI Explanation */}
                      {rec.explanation && (
                        <div style={{ padding: '0.625rem', background: 'rgba(0,0,0,0.25)', borderRadius: 8, borderLeft: '3px solid #8b5cf6' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', marginBottom: '0.2rem' }}>🤖 WHY this is recommended</div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>{rec.explanation}</div>
                        </div>
                      )}
                    </div>
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
