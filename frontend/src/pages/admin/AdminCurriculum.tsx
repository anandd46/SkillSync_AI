import React from 'react'
import DashboardLayout from '../../components/DashboardLayout'

export default function AdminCurriculum() {
  return <DashboardLayout title="Curriculum Management"><div className="card" style={{ textAlign: 'center', padding: '3rem' }}><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div><h2>Curriculum Management</h2><p style={{ color: '#94a3b8' }}>Map curriculum courses to industry-demanded skills. Use the API endpoint <code>POST /admin/courses/:id/skills</code> to add skills to courses.</p></div></DashboardLayout>
}
