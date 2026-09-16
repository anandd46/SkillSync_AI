import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { industryAPI } from '../../services/api'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'

export default function IndustryFeedback() {
  const [text, setText] = useState('')
  const [type, setType] = useState('skill_demand')
  const [rating, setRating] = useState(4)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) { toast.error('Please write your feedback'); return }
    setSubmitting(true)
    try {
      await industryAPI.submitFeedback({ feedback_text: text, feedback_type: type, rating })
      toast.success('Feedback submitted! Thank you.')
      setText('')
    } catch { toast.error('Submission failed') }
    finally { setSubmitting(false) }
  }

  return (
    <DashboardLayout title="Submit Feedback">
      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '3px solid #f59e0b' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7 }}>
            Your feedback directly influences academic curriculum and helps bridge the skill gap between industry and academia.
            Share what skills you need, what's missing from graduates, and how colleges can better prepare students for real-world work.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Feedback Type</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                ['skill_demand', '📊 Skill Demand'],
                ['curriculum_gap', '📚 Curriculum Gap'],
                ['student_quality', '👤 Student Quality'],
                ['general', '💬 General'],
              ].map(([val, label]) => (
                <button key={val} onClick={() => setType(val)}
                  style={{ padding: '0.4rem 1rem', borderRadius: 8, border: `2px solid ${type === val ? '#f59e0b' : 'rgba(148,163,184,0.15)'}`, background: type === val ? 'rgba(245,158,11,0.1)' : '#0f172a', color: type === val ? '#fbbf24' : '#94a3b8', cursor: 'pointer', fontWeight: type === val ? 600 : 400, fontSize: '0.875rem', transition: 'all 0.15s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Rating</label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} onClick={() => setRating(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', fontSize: '1.5rem', color: i <= rating ? '#f59e0b' : '#334155', transition: 'color 0.15s' }}>
                  ★
                </button>
              ))}
              <span style={{ color: '#94a3b8', fontSize: '0.875rem', alignSelf: 'center', marginLeft: '0.5rem' }}>{rating}/5</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Feedback</label>
            <textarea className="input" rows={6} value={text} onChange={e => setText(e.target.value)}
              placeholder="Describe what skills are missing, what you'd like to see improved, or any suggestions for the curriculum…"
              style={{ resize: 'vertical' }} />
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ alignSelf: 'flex-start' }}>
            {submitting ? 'Submitting…' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
