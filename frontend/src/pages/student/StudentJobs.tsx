import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { industryAPI } from '../../services/api'
import { Briefcase, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentJobs() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    industryAPI.listJobRoles()
      .then(r => setJobs(r.data))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="Job Roles">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Explore job roles from industry partners. Set your target role from your profile to get personalized gap analysis.</p>
        {loading ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading…</div> :
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {jobs.map(job => (
              <div key={job.id} className="card">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={18} color="#60a5fa" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{job.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{job.company}</div>
                  </div>
                </div>
                {job.category && <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>{job.category}</span>}
                {job.description && <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{job.description?.slice(0, 100)}…</p>}
              </div>
            ))}
          </div>
        }
      </div>
    </DashboardLayout>
  )
}
