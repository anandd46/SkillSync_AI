import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { analyticsAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#ef4444', '#f59e0b', '#fbbf24', '#3b82f6', '#10b981']

export default function FacultyAnalytics() {
  const [data, setData] = useState<any>(null)
  const [alignment, setAlignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsAPI.institution(), analyticsAPI.curriculumAlignment()])
      .then(([dRes, aRes]) => { setData(dRes.data); setAlignment(aRes.data) })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Analytics"><div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading…</div></DashboardLayout>

  const distData = data?.readiness_distribution
    ? Object.entries(data.readiness_distribution).map(([k, v]) => ({ name: k, value: v as number }))
    : []

  return (
    <DashboardLayout title="Department Analytics">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
          <div className="stat-card"><div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Students</div><div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>{data?.total_students}</div></div>
          <div className="stat-card"><div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Avg Readiness</div><div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{data?.average_readiness}%</div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>

          {/* Top skill gaps */}
          {data?.top_skill_gaps?.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Top Skill Gaps in Institution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.top_skill_gaps} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="skill" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8 }} />
                  <Bar dataKey="count" name="Students" radius={[0, 4, 4, 0]}>
                    {data.top_skill_gaps.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Readiness distribution */}
          {distData.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Readiness Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={distData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {distData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Curriculum alignment */}
        {alignment?.alignment?.length > 0 && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Curriculum vs Industry Demand Alignment</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr><th>Skill</th><th>Industry Demand</th><th>Curriculum Coverage</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {alignment.alignment.slice(0, 15).map((a: any) => (
                    <tr key={a.skill_name}>
                      <td style={{ fontWeight: 500 }}>{a.skill_name}</td>
                      <td><span className="badge badge-blue">{a.industry_demand} roles</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-bar-fill" style={{ width: `${a.coverage_percentage}%` }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{a.coverage_percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${a.status === 'Fully Covered' ? 'badge-green' : a.status === 'Not Covered' ? 'badge-red' : 'badge-yellow'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
