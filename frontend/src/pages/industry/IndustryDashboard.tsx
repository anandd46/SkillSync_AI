import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { industryAPI, analyticsAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'
import { Briefcase, Star, TrendingUp } from 'lucide-react'

export default function IndustryDashboard() {
  const [jobs, setJobs] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([industryAPI.listJobRoles(), analyticsAPI.institution()])
      .then(([jRes, aRes]) => { setJobs(jRes.data); setAnalytics(aRes.data) })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Industry Dashboard"><div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading…</div></DashboardLayout>

  return (
    <DashboardLayout title="Industry Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div className="stat-card" style={{ borderLeft: '3px solid #f59e0b' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Job Roles Posted</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>{jobs.length}</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid #3b82f6' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Students</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6' }}>{analytics?.total_students ?? '—'}</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid #10b981' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Avg Readiness</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>{analytics?.average_readiness ?? '—'}%</div>
          </div>
        </div>

        {/* Top in-demand skills */}
        {analytics?.top_demanded_skills?.length > 0 && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Talent Availability vs. Your Requirements</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>This shows how many students across the institution have each demanded skill (based on AI analysis).</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.top_demanded_skills}>
                <XAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8 }} />
                <Bar dataKey="demand" name="Job Roles Requiring Skill" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Job roles overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, margin: 0 }}>Your Job Roles</h3>
            <a href="/industry/jobs" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Manage →</button>
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {jobs.slice(0, 6).map(job => (
              <div key={job.id} style={{ padding: '0.875rem', background: '#0f172a', borderRadius: 10, border: '1px solid rgba(148,163,184,0.1)' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{job.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{job.category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
