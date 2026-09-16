import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getUsers()
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const ROLE_COLORS: Record<string, string> = { student: '#3b82f6', faculty: '#8b5cf6', admin: '#10b981', industry: '#f59e0b' }

  return (
    <DashboardLayout title="User Management">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading…</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.full_name}</td>
                  <td style={{ color: '#94a3b8' }}>{u.email}</td>
                  <td>
                    <span className="badge" style={{ background: `${ROLE_COLORS[u.role] || '#94a3b8'}18`, color: ROLE_COLORS[u.role] || '#94a3b8', textTransform: 'capitalize' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}
