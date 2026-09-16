import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { studentsAPI, recommendationsAPI, notificationsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { Target, Star, BookOpen, BarChart3, TrendingUp, AlertCircle, CheckCircle, Zap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import toast from 'react-hot-toast'

const READINESS_COLOR = (score: number) =>
  score >= 90 ? '#10b981' : score >= 75 ? '#3b82f6' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'

const READINESS_LABEL: Record<string, string> = {
  highly_ready: '🏆 Highly Ready',
  job_ready: '✅ Job Ready',
  moderately_ready: '⚠️ Moderately Ready',
  developing: '📈 Developing',
  needs_improvement: '🔴 Needs Improvement',
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [readiness, setReadiness] = useState<any>(null)
  const [gaps, setGaps] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, gapsRes, recRes, notifRes] = await Promise.allSettled([
          studentsAPI.getProfile(),
          studentsAPI.getSkillGaps(),
          recommendationsAPI.list(),
          notificationsAPI.list(),
        ])
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data)
        if (gapsRes.status === 'fulfilled') setGaps(gapsRes.value.data)
        if (recRes.status === 'fulfilled') setRecommendations(recRes.value.data)
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data)

        // Try to get readiness
        try {
          const readRes = await studentsAPI.getReadiness()
          setReadiness(readRes.data)
        } catch { }
      } catch (err) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      await studentsAPI.analyze()
      toast.success('Analysis complete! Refreshing data…')
      const [gapsRes, readRes, recRes] = await Promise.all([
        studentsAPI.getSkillGaps(),
        studentsAPI.getReadiness(),
        recommendationsAPI.list(),
      ])
      setGaps(gapsRes.data)
      setReadiness(readRes.data)
      setRecommendations(recRes.data)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Analysis failed. Set a target job role first.')
    } finally {
      setAnalyzing(false)
    }
  }

  const readinessScore = readiness?.score ?? profile?.student?.readiness_score ?? 0
  const readinessColor = READINESS_COLOR(readinessScore)
  const readinessCategory = readiness?.category || 'needs_improvement'

  const gapChartData = gaps.slice(0, 8).map(g => ({
    skill: g.skill_name.length > 12 ? g.skill_name.slice(0, 12) + '…' : g.skill_name,
    required: g.required_level,
    current: g.current_level,
  }))

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', margin: '0 auto 1rem', animation: 'pulse 1.5s infinite' }} />
          Loading your dashboard…
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout title="Student Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Welcome + Analyze */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Welcome back, {user?.full_name?.split(' ')[0]}! 👋
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Career Goal: <strong style={{ color: '#f1f5f9' }}>{profile?.student?.career_goal || 'Not set'}</strong>
            </p>
          </div>
          <button className="btn-primary" onClick={handleAnalyze} disabled={analyzing}>
            <Zap size={16} />
            {analyzing ? 'Analyzing…' : 'Run AI Analysis'}
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {/* Readiness Score */}
          <div className="stat-card" style={{ borderLeft: `3px solid ${readinessColor}` }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Readiness Score</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: readinessColor, lineHeight: 1 }}>{readinessScore.toFixed(0)}%</div>
            <div style={{ fontSize: '0.8rem', color: readinessColor }}>{READINESS_LABEL[readinessCategory]}</div>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skill Gaps</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{gaps.filter(g => g.status !== 'matched' && g.status !== 'exceeds').length}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{gaps.filter(g => g.status === 'missing').length} missing</div>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendations</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{recommendations.filter(r => !r.is_completed).length}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{recommendations.filter(r => r.is_completed).length} completed</div>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{Math.round(profile?.student?.profile_completion || 0)}%</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>complete</div>
          </div>
        </div>

        {/* Main content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

          {/* Readiness Breakdown */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Readiness Breakdown</h3>
              <Link to="/student/skill-gaps" style={{ textDecoration: 'none', fontSize: '0.8rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={12} /></Link>
            </div>
            {readiness?.breakdown ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(readiness.breakdown as Record<string, number>).map(([key, val]) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                      <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                      <span style={{ fontWeight: 600 }}>{val.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
                <AlertCircle size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem' }}>Run AI Analysis to see readiness</p>
              </div>
            )}
          </div>

          {/* Skill Gap Chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Skill Gap Overview</h3>
              <Link to="/student/skill-gaps" style={{ textDecoration: 'none', fontSize: '0.8rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 4 }}>Details <ArrowRight size={12} /></Link>
            </div>
            {gapChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={gapChartData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="skill" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8 }}
                    labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
                    itemStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="required" name="Required" fill="#3b82f620" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="current" name="Current" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
                <BarChart3 size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem' }}>No gap data yet — set a target role and run analysis</p>
              </div>
            )}
          </div>

          {/* Top Recommendations */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Top Recommendations</h3>
              <Link to="/student/recommendations" style={{ textDecoration: 'none', fontSize: '0.8rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 4 }}>All <ArrowRight size={12} /></Link>
            </div>
            {recommendations.filter(r => !r.is_completed).slice(0, 4).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {recommendations.filter(r => !r.is_completed).slice(0, 4).map(rec => (
                  <div key={rec.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.625rem', background: '#0f172a', borderRadius: 8, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.85rem' }}>
                      {rec.recommendation_type === 'course' ? '📚' : rec.recommendation_type === 'project' ? '🔨' : '🎯'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {rec.skill_name && <span className="badge badge-blue" style={{ marginRight: 4 }}>{rec.skill_name}</span>}
                        {rec.estimated_hours && `~${rec.estimated_hours}h`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
                <CheckCircle size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem' }}>No recommendations yet</p>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Notifications</h3>
            {notifications.slice(0, 5).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notifications.slice(0, 5).map(n => (
                  <div key={n.id} style={{ padding: '0.625rem', background: '#0f172a', borderRadius: 8, borderLeft: `3px solid ${n.is_read ? 'transparent' : '#3b82f6'}` }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{n.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{n.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem 0', fontSize: '0.875rem' }}>
                No notifications
              </div>
            )}
          </div>
        </div>

        {/* Explainable AI section */}
        {readiness?.explanation && (
          <div className="card" style={{ borderLeft: '3px solid #8b5cf6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Zap size={18} color="#8b5cf6" />
              <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>AI Explanation</h3>
            </div>
            <pre style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#94a3b8', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.7 }}>
              {readiness.explanation}
            </pre>
            {readiness.weakest_skill && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontWeight: 600, color: '#f87171', fontSize: '0.875rem' }}>⚠️ Priority Focus: {readiness.weakest_skill}</div>
                <Link to="/student/recommendations" style={{ fontSize: '0.8rem', color: '#60a5fa', textDecoration: 'none' }}>
                  View recommendations for this skill →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
