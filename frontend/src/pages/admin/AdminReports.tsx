import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { analyticsAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

export default function AdminReports() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { analyticsAPI.institution().then(r => setData(r.data)).catch(() => toast.error('Failed to load reports')) }, [])

  return (
    <DashboardLayout title="System Reports">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {data?.top_demanded_skills?.length > 0 && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Most In-Demand Industry Skills</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.top_demanded_skills}>
                <XAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8 }} />
                <Bar dataKey="demand" name="Job Roles" radius={[4, 4, 0, 0]}>
                  {data.top_demanded_skills.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {data?.top_skill_gaps?.length > 0 && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Top Skill Gaps Across Institution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.top_skill_gaps} layout="vertical">
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis dataKey="skill" type="category" width={120} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8 }} />
                <Bar dataKey="count" name="Students Affected" radius={[0, 4, 4, 0]}>
                  {data.top_skill_gaps.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
