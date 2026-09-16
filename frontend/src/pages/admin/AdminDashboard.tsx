import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { adminAPI } from '../../services/api'
import { Users, Shield, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  useEffect(() => { adminAPI.getDashboardStats().then(r => setStats(r.data)).catch(() => toast.error('Failed to load stats')) }, [])

  return (
    <DashboardLayout title="Admin Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="stat-card" style={{ borderLeft: '3px solid #3b82f6' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Users</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6' }}>{stats?.total_users ?? '—'}</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid #10b981' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Students</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>{stats?.total_students ?? '—'}</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid #f59e0b' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Avg Readiness</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>{stats?.average_readiness ?? '—'}%</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Admin Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {[
              { icon: Users, label: 'Manage Users', href: '/admin/users', color: '#3b82f6' },
              { icon: BarChart3, label: 'Reports', href: '/admin/reports', color: '#8b5cf6' },
              { icon: Shield, label: 'Audit Log', href: '/admin/audit', color: '#10b981' },
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
