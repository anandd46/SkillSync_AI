import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { studentsAPI } from '../../services/api'
import { AlertCircle, AlertTriangle, CheckCircle, XCircle, Zap, Info } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string; borderClass: string }> = {
  missing: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', label: 'Missing', borderClass: 'skill-gap-missing' },
  major_gap: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'Major Gap', borderClass: 'skill-gap-major' },
  partial_gap: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', label: 'Partial Gap', borderClass: 'skill-gap-partial' },
  matched: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.06)', label: 'Matched', borderClass: 'skill-gap-matched' },
  exceeds: { icon: CheckCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.06)', label: 'Exceeds', borderClass: 'skill-gap-matched' },
}

const LEVEL_BARS = (level: number, color = '#3b82f6') => (
  <div style={{ display: 'flex', gap: 3 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{ width: 20, height: 8, borderRadius: 3, background: i <= level ? color : 'rgba(148,163,184,0.15)', transition: 'background 0.3s' }} />
    ))}
  </div>
)

export default function StudentGaps() {
  const [gaps, setGaps] = useState<any[]>([])
  const [readiness, setReadiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    Promise.all([studentsAPI.getSkillGaps(), studentsAPI.getReadiness()])
      .then(([gR, rR]) => { setGaps(gR.data); setReadiness(rR.data) })
      .catch(() => toast.error('Failed to load gap data'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? gaps : gaps.filter(g => g.status === filter)

  const counts = {
    all: gaps.length,
    missing: gaps.filter(g => g.status === 'missing').length,
    major_gap: gaps.filter(g => g.status === 'major_gap').length,
    partial_gap: gaps.filter(g => g.status === 'partial_gap').length,
    matched: gaps.filter(g => g.status === 'matched' || g.status === 'exceeds').length,
  }

  return (
    <DashboardLayout title="Skill Gaps">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {[
            { key: 'all', label: 'Total Skills', color: '#f1f5f9' },
            { key: 'missing', label: 'Missing', color: '#ef4444' },
            { key: 'major_gap', label: 'Major Gap', color: '#f59e0b' },
            { key: 'partial_gap', label: 'Partial Gap', color: '#fbbf24' },
            { key: 'matched', label: 'Matched', color: '#10b981' },
          ].map(({ key, label, color }) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{ background: filter === key ? `${color}18` : '#1e293b', border: `1px solid ${filter === key ? color : 'rgba(148,163,184,0.12)'}`, borderRadius: 10, padding: '0.875rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color }}>{counts[key as keyof typeof counts] || 0}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{label}</div>
            </button>
          ))}
        </div>

        {/* Readiness score bar */}
        {readiness && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Overall Readiness</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: readiness.score >= 75 ? '#10b981' : readiness.score >= 60 ? '#3b82f6' : '#ef4444' }}>
                {readiness.score?.toFixed(0)}%
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{readiness.label}</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-bar-fill" style={{ width: `${readiness.score}%` }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Needs Improvement</span><span>Highly Ready</span>
              </div>
            </div>
          </div>
        )}

        {/* Gap list */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading gap data…</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 1rem', color: '#10b981' }} />
            <h3>No gaps in this category!</h3>
            <p style={{ color: '#94a3b8' }}>Run AI Analysis from the dashboard to compute skill gaps.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(gap => {
              const cfg = STATUS_CONFIG[gap.status] || STATUS_CONFIG['missing']
              const Icon = cfg.icon
              return (
                <div key={gap.id} className="card" style={{ background: cfg.bg, borderLeft: `4px solid ${cfg.color}`, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon size={20} color={cfg.color} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{gap.skill_name}</div>
                        <span className={`badge ${gap.status === 'missing' ? 'badge-red' : gap.status === 'matched' || gap.status === 'exceeds' ? 'badge-green' : 'badge-yellow'}`} style={{ marginTop: 4 }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', flexShrink: 0 }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>Required</div>
                        {LEVEL_BARS(gap.required_level, '#3b82f6')}
                        <div style={{ fontSize: '0.75rem', marginTop: 2, color: '#60a5fa' }}>{gap.required_level_name || `Level ${gap.required_level}`}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>Current</div>
                        {LEVEL_BARS(gap.current_level, cfg.color)}
                        <div style={{ fontSize: '0.75rem', marginTop: 2, color: cfg.color }}>{gap.current_level_name || `Level ${gap.current_level}`}</div>
                      </div>
                      {gap.gap_level > 0 && (
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>Gap</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: cfg.color }}>-{gap.gap_level}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>levels</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Explanation */}
                  {gap.explanation && (
                    <div style={{ marginTop: '0.875rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <Info size={14} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
                        <strong style={{ color: '#f1f5f9' }}>AI Explanation: </strong>{gap.explanation}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
