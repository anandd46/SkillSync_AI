// Placeholder stubs for remaining student pages
import React from 'react'
import DashboardLayout from '../../components/DashboardLayout'

export default function StudentProgress() {
  return (
    <DashboardLayout title="My Progress">
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
        <h2>Progress Tracking</h2>
        <p style={{ color: '#94a3b8' }}>Complete assessments and run AI analysis to track your readiness score over time.</p>
      </div>
    </DashboardLayout>
  )
}
