import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, ArrowRight, CheckCircle, BarChart3, Users, Building2, Zap, Shield, BookOpen, Target } from 'lucide-react'

const FLOW_STEPS = [
  { icon: '🏭', label: 'Industry', desc: 'Posts job requirements' },
  { icon: '🤖', label: 'AI Extraction', desc: 'NLP extracts skills from JDs' },
  { icon: '📚', label: 'Curriculum', desc: 'Maps skills to courses' },
  { icon: '👤', label: 'Student', desc: 'Evidence & assessments' },
  { icon: '📊', label: 'Skill Gap', desc: 'AI detects gaps' },
  { icon: '⭐', label: 'Readiness', desc: '0–100 score with explanation' },
  { icon: '🎯', label: 'Recommendations', desc: 'Personalized learning path' },
  { icon: '🔄', label: 'Continuous', desc: 'Feedback loop improves system' },
]

const FEATURES = [
  { icon: Brain, title: 'NLP Skill Extraction', desc: 'Automatically extracts and normalizes skills from job descriptions, resumes, and curriculum documents using advanced NLP.' },
  { icon: Zap, title: 'Semantic Matching', desc: 'Goes beyond keyword matching — uses sentence embeddings to find skill relationships even when terminology differs.' },
  { icon: Target, title: 'Explainable AI', desc: 'Every skill gap and recommendation comes with a human-readable explanation — WHAT, WHY, HOW, and NEXT ACTION.' },
  { icon: BarChart3, title: 'Readiness Score', desc: 'Holistic 0–100 job readiness score based on skill match, evidence quality, and assessment performance.' },
  { icon: BookOpen, title: 'Evidence-Based Proficiency', desc: 'Proficiency is earned through assessments, projects, certificates, and internships — not self-declaration alone.' },
  { icon: Shield, title: 'Human-in-the-Loop', desc: 'Faculty and admins can review and override AI recommendations, ensuring transparency and trust.' },
]

const ROLES = [
  { icon: '👤', role: 'Student', color: '#3b82f6', desc: 'View skill gaps, get personalized recommendations, track readiness score, complete assessments' },
  { icon: '👨‍🏫', role: 'Faculty', color: '#8b5cf6', desc: 'Monitor department skill health, identify weak areas, review AI recommendations' },
  { icon: '🔧', role: 'Admin / Institution', color: '#10b981', desc: 'Manage curriculum, view industry alignment, export reports, audit system' },
  { icon: '🏢', role: 'Industry / Recruiter', color: '#f59e0b', desc: 'Post job requirements, view skill availability, provide feedback on graduates' },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9' }}>
      {/* Header */}
      <header style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(148,163,184,0.1)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15,23,42,0.9)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>SkillSync Portal</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>SIH 2026 — Stellar Intelligence</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ fontSize: '0.875rem' }}>Sign In</button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ fontSize: '0.875rem' }}>Get Started <ArrowRight size={14} /></button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 9999, padding: '0.35rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#60a5fa' }}>
          <Zap size={12} /> SIH 2026 — Problem ID: SIH26004
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
          AI-Powered{' '}
          <span className="gradient-text">Academia–Industry</span>
          <br />Skill Synchronization Portal
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Connecting industry demand, academic curriculum and student competency through explainable AI. Detect gaps. Recommend learning. Measure readiness. Close the loop.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              Start Free Demo <ArrowRight size={16} />
            </button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              Sign In
            </button>
          </Link>
        </div>
        {/* Quick demo creds */}
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, display: 'inline-block', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>DEMO ACCOUNTS (password: Demo@1234)</div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
            {[['👤 Student', 'student@example.com'], ['👨‍🏫 Faculty', 'faculty@example.com'], ['🔧 Admin', 'admin@example.com'], ['🏢 Industry', 'industry@example.com']].map(([role, email]) => (
              <div key={email} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{role}</span>
                <span style={{ color: '#60a5fa' }}>{email}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Pipeline Flow */}
      <section style={{ padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>
          The <span className="gradient-text">AI Decision Pipeline</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {FLOW_STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#1e293b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 12, minWidth: 100, flex: '0 0 auto' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{step.icon}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 2 }}>{step.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{step.desc}</div>
              </div>
              {i < FLOW_STEPS.length - 1 && <div style={{ color: '#3b82f6', fontSize: '1.25rem', flexShrink: 0 }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Core AI Capabilities</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Powered by sentence-transformers, NLP, and rule-based explainability</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, background: 'rgba(59,130,246,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <f.icon size={20} color="#60a5fa" />
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>{f.title}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skill Gap Example */}
      <section style={{ padding: '3rem 2rem', maxWidth: 900, margin: '0 auto' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>📊 Real Skill Gap Example</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Target: AI/ML Engineer | Student Profile Analysis</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ background: 'transparent' }}>
              <thead>
                <tr>
                  <th>Skill</th><th>Required</th><th>Student</th><th>Gap</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Python', 'Advanced', 'Advanced', '0', 'matched'],
                  ['Machine Learning', 'Advanced', 'Intermediate', '1', 'partial'],
                  ['SQL', 'Intermediate', 'Beginner', '2', 'major'],
                  ['Docker', 'Intermediate', 'Beginner', '2', 'major'],
                  ['AWS', 'Intermediate', 'No Evidence', '3', 'missing'],
                ].map(([skill, req, student, gap, status]) => (
                  <tr key={skill}>
                    <td style={{ fontWeight: 500 }}>{skill}</td>
                    <td><span className="badge badge-blue">{req}</span></td>
                    <td><span className={`badge ${status === 'matched' ? 'badge-green' : status === 'partial' ? 'badge-yellow' : status === 'major' ? 'badge-yellow' : 'badge-red'}`}>{student}</span></td>
                    <td style={{ color: gap === '0' ? '#34d399' : '#f87171', fontWeight: 600 }}>{gap === '0' ? '✓ 0' : `−${gap}`}</td>
                    <td>
                      <span className={`badge ${status === 'matched' ? 'badge-green' : status === 'partial' ? 'badge-yellow' : status === 'major' ? 'badge-yellow' : 'badge-red'}`}>
                        {status === 'matched' ? '✅ Matched' : status === 'partial' ? '⚠️ Partial' : status === 'major' ? '🔴 Major' : '❌ Missing'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59,130,246,0.08)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.35rem', color: '#60a5fa' }}>🤖 AI Recommendation</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
              AWS was recommended because it is required at Intermediate level for the AI/ML Engineer role, but no verified evidence was found in your profile. Priority: High. Suggested action: Complete AWS Cloud Practitioner course + deploy a model on SageMaker.
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section style={{ padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Role-Based Access</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {ROLES.map((r) => (
            <div key={r.role} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{r.icon}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: r.color, marginBottom: '0.5rem' }}>{r.role}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to close the skill gap?</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Join the platform that connects industry requirements, academic curriculum, and student competency through explainable AI.</p>
          <Link to="/register">
            <button className="btn-primary" style={{ padding: '0.875rem 2.5rem', fontSize: '1rem' }}>
              Start Your Journey <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(148,163,184,0.1)', padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
        SIH 2026 | Problem ID: SIH26004 | AI-Powered Academia–Industry Skill Synchronization Portal | Team: Stellar Intelligence
      </footer>
    </div>
  )
}
