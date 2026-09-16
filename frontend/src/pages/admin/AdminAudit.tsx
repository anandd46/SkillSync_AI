import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminAudit() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getAuditLogs()
      .then(r => setLogs(r.data))
      .catch(() => toast.error('Failed to load audit logs'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="Audit Log">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading…</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Action</th><th>User</th><th>Entity</th><th>Time</th></tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td><span className="badge badge-blue">{log.action}</span></td>
                  <td style={{ fontWeight: 500 }}>{log.user_name}</td>
                  <td style={{ color: '#94a3b8' }}>{log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ''}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}
