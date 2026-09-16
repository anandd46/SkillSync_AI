import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { facultyAPI } from '../../services/api'
import { Users, BarChart3, Target, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'

export default function FacultyDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    facultyAPI.getDashboardStats()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="Faculty Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="stat-card" style={{ borderLeft: '3px solid #3b82f6' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Students</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6' }}>{stats?.total_students ?? '-'}</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid #10b981' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Avg Readiness</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>{stats?.average_readiness ?? '-'}%</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid #f59e0b' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Top Gaps</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>{stats?.top_skill_gaps?.length ?? '-'}</div>
          </div>
        </div>

        {stats?.top_skill_gaps?.length > 0 && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Department Skill Gaps (Most Affected Skills)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.top_skill_gaps} margin={{ left: 0 }}>
                <XAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8 }} />
                <Bar dataKey="count" name="Students Affected" radius={[4, 4, 0, 0]}>
                  {stats.top_skill_gaps.map((_: any, i: number) => (
                    <Cell key={i} fill={['#ef4444', '#f59e0b', '#fbbf24', '#3b82f6', '#8b5cf6'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {[
              { icon: Users, label: 'View Students', href: '/faculty/students', color: '#3b82f6' },
              { icon: BarChart3, label: 'Analytics', href: '/faculty/analytics', color: '#8b5cf6' },
            ].map(({ icon: Icon, label, href, color }) => (
              <a key={label} href={href} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={color} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
