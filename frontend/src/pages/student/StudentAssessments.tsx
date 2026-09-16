import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { assessmentsAPI } from '../../services/api'
import { Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const LEVEL_NAMES: Record<number, string> = { 0: 'No Evidence', 1: 'Beginner', 2: 'Basic', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' }
const DIFF_COLORS: Record<string, string> = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' }

export default function StudentAssessments() {
  const [assessments, setAssessments] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeAssessment, setActiveAssessment] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [view, setView] = useState<'list' | 'taking' | 'result'>('list')

  useEffect(() => {
    Promise.all([assessmentsAPI.list(), assessmentsAPI.history()])
      .then(([aRes, hRes]) => { setAssessments(aRes.data); setHistory(hRes.data) })
      .catch(() => toast.error('Failed to load assessments'))
      .finally(() => setLoading(false))
  }, [])

  const startAssessment = async (id: number) => {
    const res = await assessmentsAPI.get(id)
    setActiveAssessment(res.data)
    setAnswers({})
    setResult(null)
    setView('taking')
  }

  const handleSubmit = async () => {
    if (!activeAssessment) return
    setSubmitting(true)
    try {
      const answersArray = activeAssessment.questions.map((q: any) => ({
        question_id: q.id,
        answer: answers[q.id] || '',
      }))
      const res = await assessmentsAPI.submit(activeAssessment.id, answersArray)
      setResult(res.data)
      setView('result')
      toast.success('Assessment submitted!')
      // Refresh history
      const hRes = await assessmentsAPI.history()
      setHistory(hRes.data)
    } catch {
      toast.error('Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <DashboardLayout title="Assessments"><div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading…</div></DashboardLayout>

  // Assessment taking view
  if (view === 'taking' && activeAssessment) {
    const answered = Object.keys(answers).length
    const total = activeAssessment.questions.length
    const progress = (answered / total) * 100

    return (
      <DashboardLayout title={activeAssessment.title}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Progress */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#94a3b8' }}>Progress</span>
              <span style={{ fontWeight: 600 }}>{answered}/{total} answered</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Questions */}
          {activeAssessment.questions.map((q: any, idx: number) => (
            <div key={q.id} className="card" style={{ borderLeft: answers[q.id] ? '3px solid #10b981' : '3px solid rgba(148,163,184,0.1)' }}>
              <div style={{ fontWeight: 600, marginBottom: '1rem' }}>
                <span style={{ color: '#94a3b8', marginRight: '0.5rem' }}>Q{idx + 1}.</span>
                {q.question_text}
              </div>
              {q.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt: string) => (
                    <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      style={{
                        padding: '0.75rem 1rem', borderRadius: 8, border: `2px solid ${answers[q.id] === opt ? '#3b82f6' : 'rgba(148,163,184,0.12)'}`,
                        background: answers[q.id] === opt ? 'rgba(59,130,246,0.1)' : '#0f172a',
                        color: answers[q.id] === opt ? '#60a5fa' : '#f1f5f9',
                        cursor: 'pointer', textAlign: 'left', fontWeight: answers[q.id] === opt ? 600 : 400,
                        transition: 'all 0.15s',
                      }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Submit */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={() => setView('list')}>← Back</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting || answered === 0} style={{ flex: 1, justifyContent: 'center' }}>
              {submitting ? 'Submitting…' : `Submit Assessment (${answered}/${total} answered)`}
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Result view
  if (view === 'result' && result) {
    const score = result.score
    const color = score >= 75 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'
    return (
      <DashboardLayout title="Assessment Result">
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', fontWeight: 900, color, marginBottom: '0.5rem' }}>{score.toFixed(0)}%</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{result.message}</div>
            <div style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              {result.correct}/{result.total} correct • Proficiency: <strong style={{ color }}>{result.proficiency_name}</strong>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {result.passed ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                  <CheckCircle size={20} /> Passed!
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 600 }}>
                  <AlertCircle size={20} /> Keep practicing
                </span>
              )}
            </div>
          </div>
          <button className="btn-primary" onClick={() => setView('list')} style={{ justifyContent: 'center' }}>← Back to Assessments</button>
        </div>
      </DashboardLayout>
    )
  }

  // Main list
  return (
    <DashboardLayout title="Assessments">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Available</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>{assessments.length}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Completed</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{history.length}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Avg Score</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>
              {history.length > 0 ? (history.reduce((s, h) => s + (h.score || 0), 0) / history.length).toFixed(0) : '-'}%
            </div>
          </div>
        </div>

        <h3 style={{ fontWeight: 700, margin: '0.5rem 0 0' }}>Available Assessments</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {assessments.map(a => (
            <div key={a.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => startAssessment(a.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-blue">{a.skill_name || 'General'}</span>
                <span className="badge" style={{ background: `${DIFF_COLORS[a.difficulty] || '#94a3b8'}15`, color: DIFF_COLORS[a.difficulty] || '#94a3b8', textTransform: 'capitalize' }}>
                  {a.difficulty}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>{a.title}</div>
              {a.description && <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>{a.description}</div>}
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={13} /> {a.total_questions} questions</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {a.time_limit_minutes}min</span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#60a5fa' }}>
                  Start <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* History */}
        {history.length > 0 && (
          <>
            <h3 style={{ fontWeight: 700, margin: '0.5rem 0 0' }}>Recent History</h3>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr><th>Assessment</th><th>Score</th><th>Proficiency</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.attempt_id}>
                      <td style={{ fontWeight: 500 }}>{h.assessment_title}</td>
                      <td style={{ fontWeight: 700, color: h.score >= 75 ? '#10b981' : h.score >= 60 ? '#3b82f6' : '#f59e0b' }}>{h.score?.toFixed(0)}%</td>
                      <td><span className="badge badge-blue">{h.proficiency_name}</span></td>
                      <td><span className="badge badge-green">{h.status}</span></td>
                      <td style={{ color: '#94a3b8' }}>{h.completed_at ? new Date(h.completed_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
