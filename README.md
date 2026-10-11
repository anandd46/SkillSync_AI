# SkillSync AI

### AI-Powered Academia–Industry Skill Synchronization Portal

```
Smart India Hackathon 2026
Problem Statement ID : SIH26004
Theme               : Artificial Intelligence
Category            : Software
Team                : Stellar Intelligence
Built by Anand D for Hackathon
```

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green?logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38BDF8?logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Why This Project?](#why-this-project)
- [Existing Problem](#existing-problem)
- [Proposed Solution](#proposed-solution)
- [What Does the Project Solve?](#what-does-the-project-solve)
- [Project Objectives](#project-objectives)
- [Target Users](#target-users)
- [Key Features](#key-features)
- [How the System Works](#how-the-system-works)
- [AI / ML Architecture](#ai--ml-architecture)
  - [Skill Taxonomy](#skill-taxonomy)
  - [NLP Skill Extraction](#nlp-skill-extraction)
  - [Skill Normalization](#skill-normalization)
  - [Semantic Matching](#semantic-matching)
  - [Skill Gap Detection](#skill-gap-detection)
  - [Evidence-Based Proficiency](#evidence-based-proficiency)
  - [Readiness Score](#readiness-score)
  - [Recommendation Engine](#recommendation-engine)
  - [Explainable AI](#explainable-ai)
- [Curriculum–Industry Alignment](#curriculumindustry-alignment)
- [Assessment and Reassessment](#assessment-and-reassessment)
- [Industry Feedback](#industry-feedback)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Architecture](#database-architecture)
- [API Reference](#api-reference)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Seed / Demo Data](#seed--demo-data)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Demo Login Credentials](#demo-login-credentials)
- [How to Use the System](#how-to-use-the-system)
- [Complete Demo Scenario](#complete-demo-scenario)
- [Security](#security)
- [Error Handling](#error-handling)
- [Limitations](#limitations)
- [Future Scope](#future-scope)
- [Hackathon Relevance](#hackathon-relevance)
- [Innovation and Uniqueness](#innovation-and-uniqueness)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

---

## Overview

### What is SkillSync AI?

SkillSync AI is a web-based platform that connects three stakeholders who normally operate in isolation:

```
Industry (Job Requirements)
         ↓
Academic Curriculum
         ↓
Individual Student Skills & Evidence
         ↓
AI-Computed Skill Gap
         ↓
Explainable Recommendation
         ↓
Assessment
         ↓
Improvement Measurement
         ↓
Industry Feedback
         ↓
Continuous Synchronization
```

The platform does not simply list skills. It compares what industry needs against what a student can actually demonstrate (through resumes, projects, certificates, internships, and assessments), then computes a gap and generates specific, explainable actions the student should take.

---

## Problem Statement

**SIH 2026 — Problem ID: SIH26004**

> Industry skill requirements evolve rapidly. There is frequently a mismatch between:
> 1. Skills demanded by industry
> 2. Skills covered by academic curriculum
> 3. Skills actually possessed by students

This mismatch leaves graduates underprepared for industry roles and institutions without visibility into what to change. Industry lacks a structured channel to communicate its needs to academia, and students lack personalized, evidence-based guidance on where to focus their learning effort.

---

## Why This Project?

### Industry

Companies continuously need new technical and professional skills. These requirements are embedded in job descriptions scattered across platforms, often using different terminology for the same skill. There is no direct channel for industry to communicate these needs to colleges in a structured way.

### Institutions

Colleges design curricula on multi-year cycles. Curriculum committees rarely have real-time data on what industry currently requires. The gap between what is taught and what is needed can widen over time without visibility.

### Students

Students face a practical question that is difficult to answer without data:

> "What exactly am I missing for the role I want?"

Generic career advice is available everywhere. Personalized, evidence-based analysis is not.

### Faculty and Training Cells

Faculty and placement training cells need aggregate visibility into which skills are consistently missing across batches, departments, or programs — so they can take corrective action.

---

## Existing Problem

- Industry skill requirements are scattered across thousands of job descriptions in inconsistent language.
- The same skill may be referred to as "ML", "Machine Learning", "Machine Learning Algorithms", or "supervised learning" depending on the job description.
- Manually comparing curriculum coverage against industry requirements is impractical at scale.
- Students often rely on self-declared skills with no supporting evidence.
- Student competency is rarely verified through structured evidence collection.
- Even when skill gaps are identified, recommendations are often generic with no explanation of why that matters for their specific target role.
- Institutions lack department-level or cohort-level visibility into skill gaps.
- Industry feedback, when it exists, does not flow back into the academic improvement cycle in a structured way.

---

## Proposed Solution

```
Industry Job Description Text
          ↓
NLP Skill Extraction (taxonomy keyword + pattern matching)
          ↓
Skill Normalization (alias lookup → fuzzy match)
          ↓
Structured Industry Skill Profile with Proficiency Requirements
          ↓
Student Evidence Collection (resume, projects, certificates, internships)
          ↓
Evidence-Weighted Proficiency Computation
          ↓
Semantic Skill Matching (cosine similarity on skill embeddings)
          ↓
Skill Gap Detection (missing / partial_gap / major_gap / matched / exceeds)
          ↓
Readiness Score Computation (weighted formula)
          ↓
Explainable Recommendations (WHY + WHAT + HOW + NEXT)
          ↓
Assessment (MCQ / True-False questions)
          ↓
Updated Proficiency from Assessment Score
          ↓
Re-run Gap Analysis → Updated Readiness
          ↓
Industry Feedback Submission
          ↓
Analytics for Faculty / Admin / Institution
```

Every step above is implemented in the codebase. The AI pipeline is orchestrated by `analysis_service.py` and runs on demand when a student triggers analysis or after an assessment is completed.

---

## What Does the Project Solve?

| Problem | How SkillSync AI Addresses It |
|---|---|
| Inconsistent skill terminology across job descriptions | Skill normalization using alias dictionary + fuzzy matching |
| Unknown curriculum-industry mismatch | Curriculum skills mapped to industry requirements via analytics |
| Student reliance on self-declared skills | Evidence-based proficiency (resume, projects, certs, assessments) |
| Unknown student skill gaps | AI gap detection per skill per target role |
| Generic recommendations | Role-specific, gap-driven recommendations with resource links |
| Black-box AI results | Explainable AI — every gap and recommendation includes a plain-language explanation |
| No measurable improvement path | Assessments update proficiency, triggering re-analysis |
| Industry lacks channel to academia | Industry feedback module with structured submission |
| Institutions lack aggregate skill-gap visibility | Faculty analytics and admin reports |
| No audit trail | Audit log for all significant system events |

---

## Project Objectives

1. Identify and structure industry skill requirements from job descriptions.
2. Extract skills from unstructured text using NLP.
3. Normalize different skill name variants to a canonical taxonomy.
4. Compare industry requirements with curriculum coverage.
5. Build evidence-based student skill profiles from multiple sources.
6. Detect skill gaps per student per target job role.
7. Measure student competency as a readiness score (0–100).
8. Generate personalized, prioritized learning recommendations.
9. Explain every AI-generated result in plain English.
10. Allow students to take assessments and update their skill profile.
11. Enable industry partners to submit structured feedback.
12. Provide faculty and admin with aggregated analytics and reports.

---

## Target Users

### Students

- Complete a profile with career goal and target role.
- Upload a resume for AI skill extraction.
- View evidence-based skill gaps for their target role.
- See a readiness score (0–100) with a breakdown.
- Read explainable recommendations with specific resources and estimated hours.
- Take skill assessments (MCQ / True-False) to update their proficiency.
- Browse available job roles.

### Faculty

- View a list of their students with readiness scores and career goals.
- Access department-level analytics: top skill gaps, curriculum alignment summary.
- See which skills are most frequently missing across students.

### Admin / Institution

- View institution-wide dashboard statistics.
- Manage users (view list with roles).
- Access audit logs of significant system events.
- View industry demand vs. student gap reports.
- Curriculum management page (currently a placeholder for future development).

### Industry / Recruiters

- Create a company profile and job roles.
- Add skill requirements manually or extract them from a pasted job description text using AI.
- Submit structured feedback about curriculum, student quality, or skill demand.

---

## Key Features

### Authentication and Role-Based Access

**Purpose:** Secure access with four distinct roles.

**How it works:** Users register with email, password, and role (student, faculty, admin, industry). Passwords are hashed with bcrypt. JWT tokens (HS256) are issued on login and required for all protected endpoints. Each role redirects to its own dashboard automatically on login.

---

### Student Profile and Career Goal

**Purpose:** Collect the minimum context needed for personalized gap analysis.

**How it works:** Students can update their bio, LinkedIn URL, GitHub URL, portfolio URL, CGPA, current semester, career goal (free text), and target job role (selected from available roles in the system).

---

### Resume Upload with AI Skill Extraction

**Purpose:** Automatically discover skills from the student's resume without manual input.

**How it works:** Accepts PDF, DOCX, or TXT files (up to 10 MB). PyMuPDF extracts text from PDF; python-docx extracts from DOCX. The `SkillExtractor` runs NLP keyword matching and pattern matching against the taxonomy. Matched skills are stored as `StudentSkillEvidence` with `source_type="resume"` and a confidence score. Resume evidence carries a weight of 0.10 (lowest non-self-declared weight).

---

### Skill Taxonomy

**Purpose:** A canonical reference of 40+ skills with aliases for consistent matching.

**How it works:** `taxonomy.py` defines skills across 8 categories. Each skill has a list of aliases. Example: "ML", "machine-learning", "machine learning algorithms", "supervised learning" all map to canonical name "Machine Learning".

---

### Evidence-Based Skill Proficiency

**Purpose:** Prevent students from self-declaring high proficiency without supporting evidence.

**Evidence type weights:**

| Evidence Type | Weight |
|---|---|
| Assessment (quiz result) | 0.30 |
| Project | 0.25 |
| Certificate | 0.20 |
| Internship | 0.20 |
| Faculty-verified | 0.15 |
| Industry feedback | 0.15 |
| Resume mention | 0.10 |
| Self-declared | 0.05 |

`skill_service.compute_student_skill_levels()` computes a weighted average across all evidence for a skill and converts the result to a 0–5 proficiency level.

---

### Skill Gap Detection

**Purpose:** Identify exactly what is missing or insufficient for a target role.

**Gap statuses:**

| Status | Meaning |
|---|---|
| `missing` | No verified evidence found for this skill |
| `partial_gap` | Student level is 1 below the required level |
| `major_gap` | Student level is 2+ levels below required |
| `matched` | Student meets the required level exactly |
| `exceeds` | Student level is above the required level |

Each gap includes a plain-English explanation.

---

### Readiness Score

**Purpose:** Summarize a student's overall preparedness for their target role as a single score.

**Formula:**

```
Readiness =
  Skill Coverage    × 0.40
  Proficiency       × 0.25
  Evidence Quality  × 0.20
  Assessment Score  × 0.15
```

**Categories:**

| Range | Label |
|---|---|
| 0–39 | Needs Improvement |
| 40–59 | Developing |
| 60–74 | Moderately Ready |
| 75–89 | Job Ready |
| 90–100 | Highly Ready |

> **Note:** The readiness score is a computed indicator based on available evidence. It does not guarantee employment outcomes.

---

### Semantic Matching

**Purpose:** Identify relatedness between skills beyond exact name matches.

**How it works:** Cosine similarity between 384-dimensional skill embeddings. In `AI_PROVIDER=mock` mode: hash-based deterministic mock embeddings (no model download needed). In `AI_PROVIDER=local` mode: `sentence-transformers` with model `all-MiniLM-L6-v2`. Threshold: 0.65.

---

### Recommendation Engine

**Purpose:** Tell the student what to do next, specifically for their identified gaps.

**How it works:** Rule-based and gap-driven. Selects from a curated resource dictionary per skill (courses, tutorials, practice projects, books). Each recommendation includes an explanation. Resources are prioritized by gap severity. Curated skills include: Python, Machine Learning, SQL, Docker, AWS, React, Deep Learning, Git.

---

### Explainable AI

Every AI-generated output includes a human-readable explanation generated from code templates. Examples:

**Gap explanation:**
```
'Docker' has a MAJOR GAP of 2 levels. The target role requires Intermediate
(level 3), but your current evidence shows Beginner (level 1). This requires
significant learning investment.
```

**Readiness explanation:**
```
Your overall readiness score is 62% (Moderately Ready).

Score breakdown:
• Skill Coverage: 70%
• Proficiency: 58%
• Evidence Quality: 45%
• Assessment Performance: 80%

Main weakness: Docker
Priority areas: Docker, AWS
```

---

### Assessments and Reassessment

**Purpose:** Allow students to formally demonstrate skill knowledge and update their profile when they improve.

**How it works:** MCQ and True-False questions stored in database. Students start an attempt, answer questions, and submit. Backend grades: score (0–100), proficiency level (0–5). Creates `StudentSkillEvidence` with `source_type="assessment"` (weight 0.30). Student can re-run gap analysis after assessment.

---

### Curriculum–Industry Alignment Analytics

**Purpose:** Give faculty and admin visibility into curriculum coverage of industry-required skills.

**How it works:** `CourseSkill` records (skills in courses) compared against `JobSkill` records (skills required by industry). Shows: covered, partial, or missing per skill.

---

### Industry Feedback

**Purpose:** Structured channel for industry to communicate needs back to academia.

**Feedback types:** general | skill_demand | student_quality | curriculum_gap

Stored in `IndustryFeedback` with optional rating (1–5). Captured for human review; does not automatically re-compute student scores.

---

### Audit Logging

**Purpose:** Track significant system events.

**Logged events:** register, login, logout, resume upload, assessment submission, job role creation, feedback submission.

---

## How the System Works

**Example: A student targeting "Data Analyst"**

**1. Industry creates job role** — pastes job description text → AI extracts Python, SQL, Pandas, NumPy, Machine Learning, Data Visualization with confidence scores.

**2. Student sets target** — selects "Data Analyst" as target role, uploads resume → AI extracts skills from PDF/DOCX/TXT → skills added as evidence (weight 0.10).

**3. Student triggers analysis** — `analysis_service.run_gap_analysis()` runs:
- Fetches required skills for role
- Computes weighted proficiency per skill from all evidence
- Runs gap detection per skill
- Stores gap records in database
- Computes readiness score
- Generates recommendations
- Updates `student.readiness_score`

**4. Student reviews results** — Skill Gaps page shows each required skill with status, levels, and explanation. Readiness score shows on dashboard.

**5. Student takes assessment** — completes "Python Fundamentals" quiz (75% score, Intermediate level) → evidence added with weight 0.30.

**6. Student re-runs analysis** — Python gap status improves, readiness score increases, recommendations deprioritize Python, focus shifts to remaining gaps.

---

## AI / ML Architecture

```
Job Description Text → SkillExtractor → SkillNormalizer → Canonical Skills
Student Evidence → skill_service → Weighted Proficiency per Skill
                                         ↓
Required Skills ──────────────── GapDetector → Gap Results per Skill
                                         ↓
                              ReadinessEngine → Score 0-100
                                         ↓
                          RecommendationEngine → Recommendations + XAI
```

### Skill Taxonomy

**File:** `backend/app/ai/taxonomy.py`

- 40+ canonical skills across 8 categories
- Each skill: name, category, skill_type, difficulty, aliases, description, related skills
- Proficiency levels: 0 (No Evidence) to 5 (Expert)
- Evidence weights per source type
- Readiness thresholds (0–39, 40–59, 60–74, 75–89, 90–100)
- Semantic match threshold: 0.65
- Inspired by ESCO and O*NET frameworks

---

### NLP Skill Extraction

**File:** `backend/app/ai/skill_extractor.py`

**Type:** Hybrid rule-based (no LLM required)

**Pipeline:**
1. Text cleaning (whitespace normalization)
2. N-gram matching (1–4 word n-grams against all known taxonomy terms and aliases)
3. Pattern matching (13 regex patterns for phrases like "experience with", "proficient in", "skills:", "technologies:", etc.)
4. Normalization via `SkillNormalizer` (threshold: confidence ≥ 0.65 to keep)
5. Deduplication (keep highest confidence per canonical skill)
6. Evidence context extraction (200-char surrounding window)

**Example input:**
```
Experience with Python, machine learning, SQL and Docker.
Technologies: React, Node.js
```

**Example output:**
```json
[
  {"skill_name": "Python", "confidence": 1.0},
  {"skill_name": "Machine Learning", "confidence": 0.88},
  {"skill_name": "SQL", "confidence": 1.0},
  {"skill_name": "Docker", "confidence": 1.0},
  {"skill_name": "React", "confidence": 1.0},
  {"skill_name": "Node.js", "confidence": 1.0}
]
```

---

### Skill Normalization

**File:** `backend/app/ai/skill_normalizer.py`

**Why needed:** "ML", "Machine Learning", "Machine-Learning", "machine learning algorithms" must all resolve to "Machine Learning".

**Pipeline (4 steps):**
1. Lowercase + clean special characters
2. Exact alias dictionary lookup (confidence = 1.0)
3. Contains/starts-with check against known aliases (confidence = 0.9)
4. `rapidfuzz.fuzz.WRatio` and `token_set_ratio` fuzzy matching (threshold: 75/100, confidence = score/100)

Returns `(None, 0.0)` if no match found above threshold.

---

### Semantic Matching

**File:** `backend/app/ai/semantic_matcher.py`, `backend/app/ai/embeddings.py`

**Purpose:** Match skills by meaning, not just name.

**Models:**

| Setting | Method |
|---|---|
| `AI_PROVIDER=mock` | Hash-based pseudo-embedding (NumPy RandomState seeded by MD5). Consistent results, no download needed. |
| `AI_PROVIDER=local` | `sentence-transformers` `all-MiniLM-L6-v2` (384-dim, ~80 MB, downloads on first use) |

Embeddings are cached in-memory per session. Cosine similarity threshold: 0.65.

---

### Skill Gap Detection

**File:** `backend/app/ai/gap_detector.py`

```
gap = required_level - current_level

current_level == 0   →  MISSING   (priority 1 if required ≥ 3)
gap <= 0, gap == 0   →  MATCHED   (priority 5)
gap < 0              →  EXCEEDS   (priority 5)
gap == 1             →  PARTIAL_GAP (priority 2)
gap >= 2             →  MAJOR_GAP   (priority 1)
```

`compute_overall_match_score()`: weighted percentage where required level determines weight (higher requirements = more weight).

---

### Evidence-Based Proficiency

**File:** `backend/app/services/skill_service.py`

For each `StudentSkillEvidence` record:
```
contribution = (level / 5.0) × 100 × confidence × weight
```
Sum contributions per skill ÷ total weight = score (0–100) → convert to level (0–5).

`compute_evidence_score()` computes overall portfolio quality:
```
evidence_score = min(count/20, 1.0) × 100 × 0.4 + avg_confidence × 100 × 0.6
```

---

### Readiness Score

**File:** `backend/app/ai/readiness_engine.py`

```
Readiness Score =
  skill_match_score  × 0.40
  proficiency_score  × 0.25
  evidence_score     × 0.20
  assessment_score   × 0.15
```

Where:
- `skill_match_score` = `(matched + partial × 0.5) / total × 100`
- `proficiency_score` = avg of `min(current/required, 1.0) × 100` per skill
- `evidence_score` = from `compute_evidence_score()`
- `assessment_score` = avg score across all completed attempts

Result clamped to [0, 100].

---

### Recommendation Engine

**File:** `backend/app/ai/recommendation_engine.py`

- Rule-based, gap-driven (no ML model)
- For `missing` and `major_gap`: prefers course resources
- For `partial_gap`: prefers tutorial or project resources
- Curated resources for: Python, Machine Learning, SQL, Docker, AWS, React, Deep Learning, Git
- Generic fallback for all other skills
- Max 10 recommendations per analysis run
- Each recommendation includes: title, type, provider, URL, estimated hours, XAI explanation

---

### Explainable AI

All explanations are generated from code templates — no language model is required.

- **Gap explanations:** State required level, current level, gap magnitude, and plain-English interpretation
- **Readiness explanations:** Break down each of the 4 score components, identify weakest skill and priority areas
- **Recommendation explanations:** State which gap is addressed, why this resource, what effort is required

All explanations stored in the database and displayed alongside scores in the frontend.

---

## Curriculum–Industry Alignment

The analytics API compares:
- `CourseSkill` records: skills mapped to academic courses with `coverage_level` (1–5)
- `JobSkill` records: skills required by industry with `required_level` (1–5)

Result shows per skill: covered / partial / missing, with coverage level vs. requirement level.

Faculty and admins use this to identify curriculum gaps at institution level.

---

## Assessment and Reassessment

```
Student → Select Assessment → Start Attempt
        → Answer MCQ / True-False Questions
        → Submit
        → Backend grades: score (0-100), proficiency level (0-5)
        → Creates StudentSkillEvidence (source_type="assessment", weight=0.30)
        → Student re-runs gap analysis
        → Updated readiness score reflects assessment performance
```

Multiple attempts per assessment are supported. Each attempt is stored separately. Students see their attempt history with scores.

---

## Industry Feedback

| Field | Options |
|---|---|
| Type | general, skill_demand, student_quality, curriculum_gap |
| Text | Free-form |
| Rating | Optional 1–5 |

Stored in `IndustryFeedback`. Visible in admin analytics. Does not currently auto-update student scores.

---

## System Architecture

```
[Student / Faculty / Admin / Industry]
             ↓ Browser
    React 19 + TypeScript + Vite
         TailwindCSS v4
             ↓ Axios HTTP
    FastAPI + Uvicorn (port 8000)
    ┌─────────────────────────────┐
    │  Auth (JWT + bcrypt)        │
    │  11 API Routers             │
    │  AI Engine                  │
    │  ├─ SkillExtractor          │
    │  ├─ SkillNormalizer         │
    │  ├─ SemanticMatcher         │
    │  ├─ GapDetector             │
    │  ├─ ReadinessEngine         │
    │  └─ RecommendationEngine    │
    └─────────────────────────────┘
             ↓ SQLAlchemy async
       PostgreSQL 15 (asyncpg)
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend framework | React | 19.x | Component-based UI |
| Frontend language | TypeScript | 6.0 | Type-safe code |
| Build tool | Vite | 8.x | Dev server + bundler |
| Styling | TailwindCSS | 4.x | Utility CSS |
| Charts | Recharts | 3.x | Analytics charts |
| UI primitives | Radix UI | Latest | Accessible components |
| HTTP client | Axios | 1.x | API calls |
| Routing | React Router DOM | 7.x | SPA routing |
| Toast notifications | react-hot-toast | 2.x | User feedback |
| Backend framework | FastAPI | 0.111 | REST API |
| Language | Python | 3.11 | Backend + AI |
| ASGI server | Uvicorn | 0.29 | Serves FastAPI |
| ORM | SQLAlchemy | 2.0 | Async DB access |
| Migrations | Alembic | 1.13 | Installed, tables via create_all |
| Validation | Pydantic | 2.7 | Request/response schemas |
| JWT | python-jose | 3.3 | Token encode/decode |
| Password hashing | passlib + bcrypt | 1.7 | Secure passwords |
| File upload | python-multipart | 0.0.9 | Multipart handling |
| PDF parsing | PyMuPDF (fitz) | 1.24 | Text from PDF |
| DOCX parsing | python-docx | 1.1 | Text from DOCX |
| Fuzzy matching | rapidfuzz | 3.9 | Alias fuzzy match |
| Embeddings | sentence-transformers | 2.7 | `all-MiniLM-L6-v2` (optional) |
| NLP | spaCy | 3.7 | NLP (en_core_web_sm in Docker) |
| Numerics | NumPy | 1.26 | Vector ops |
| Database | PostgreSQL | 15 | Relational storage |
| Async DB driver | asyncpg | 0.29 | Async PostgreSQL |
| Containerization | Docker + Compose | Latest | Full-stack deploy |
| Frontend linting | oxlint | Latest | Code quality |

---

## Project Structure

```
SIH/
├── .env.example               ← Copy to .env and fill in values
├── .gitignore
├── docker-compose.yml         ← 3 services: postgres, backend, frontend
│
├── database/
│   └── init.sql               ← Enables uuid-ossp and pg_trgm extensions
│
├── backend/
│   ├── Dockerfile             ← python:3.11-slim, installs spaCy model
│   ├── requirements.txt       ← All Python dependencies (29 packages)
│   ├── seed.py                ← Demo data seeder (532 lines)
│   └── app/
│       ├── main.py            ← FastAPI app entry, 11 routers, CORS
│       ├── core/
│       │   ├── config.py      ← pydantic-settings: reads .env
│       │   ├── database.py    ← Async engine, session factory
│       │   └── security.py    ← JWT, bcrypt, RBAC decorators
│       ├── ai/
│       │   ├── taxonomy.py           ← 40+ skills, aliases, constants
│       │   ├── skill_extractor.py    ← NLP extraction from text
│       │   ├── skill_normalizer.py   ← Alias + fuzzy normalization
│       │   ├── embeddings.py         ← sentence-transformers / mock
│       │   ├── semantic_matcher.py   ← Cosine similarity matching
│       │   ├── gap_detector.py       ← Gap classification per skill
│       │   ├── readiness_engine.py   ← Readiness score + explanation
│       │   └── recommendation_engine.py ← Gap-driven recommendations
│       ├── api/
│       │   ├── auth.py           ← register, login, /me, logout
│       │   ├── students.py       ← profile, skills, gaps, analyze
│       │   ├── faculty.py        ← students list, stats
│       │   ├── admin.py          ← users, audit logs, stats
│       │   ├── industry.py       ← jobs, JD extraction, feedback
│       │   ├── skills.py         ← list, search, normalize, extract
│       │   ├── assessments.py    ← list, get, start, submit
│       │   ├── analytics.py      ← institution, curriculum alignment
│       │   ├── documents.py      ← resume upload + AI extraction
│       │   ├── recommendations.py ← list, complete, dismiss
│       │   └── notifications.py  ← list, mark read
│       ├── models/
│       │   ├── user.py, student.py, faculty.py
│       │   ├── industry.py       ← Industry, JobRole, JobDescription, JobSkill
│       │   ├── institution.py    ← Institution, Department, Program, Course
│       │   ├── skill.py          ← Skill, Category, StudentSkill, Evidence
│       │   ├── evidence.py       ← Project, Certificate, Internship, Resume
│       │   ├── assessment.py     ← Assessment, Question, Attempt, Answer, Score
│       │   ├── ai_models.py      ← SkillGap, Recommendation, LearningResource
│       │   └── system.py         ← AuditLog, Notification, IndustryFeedback, CourseSkill
│       └── services/
│           ├── analysis_service.py   ← Full AI pipeline orchestrator
│           ├── skill_service.py      ← Evidence-weighted proficiency
│           └── audit_service.py      ← Audit log writer
│
└── frontend/
    ├── package.json, vite.config.ts, tsconfig.json
    └── src/
        ├── App.tsx              ← Routes + ProtectedRoute + RoleRedirect
        ├── contexts/AuthContext.tsx
        ├── components/DashboardLayout.tsx
        ├── services/api.ts      ← All Axios API calls
        └── pages/
            ├── LandingPage.tsx
            ├── auth/LoginPage.tsx, RegisterPage.tsx
            ├── student/
            │   ├── StudentDashboard.tsx, StudentProfile.tsx
            │   ├── StudentSkills.tsx, StudentGaps.tsx
            │   ├── StudentRecommendations.tsx, StudentAssessments.tsx
            │   └── StudentJobs.tsx, StudentProgress.tsx (placeholder)
            ├── faculty/
            │   └── FacultyDashboard.tsx, FacultyStudents.tsx, FacultyAnalytics.tsx
            ├── admin/
            │   └── AdminDashboard.tsx, AdminUsers.tsx, AdminReports.tsx
            │       AdminAudit.tsx, AdminCurriculum.tsx (placeholder)
            └── industry/
                └── IndustryDashboard.tsx, IndustryJobs.tsx, IndustryFeedback.tsx
```

---

## Database Architecture

```
USER ──── STUDENT ──── STUDENT_SKILL_EVIDENCE
       │           ├── SKILL_GAP
       │           ├── RECOMMENDATION
       │           ├── ASSESSMENT_ATTEMPT ── ASSESSMENT_ANSWER
       │           ├── RESUME ── RESUME_SKILL
       │           ├── PROJECT
       │           ├── CERTIFICATE
       │           └── INTERNSHIP
       ├── FACULTY
       ├── INDUSTRY ── JOB_ROLE ── JOB_SKILL ── SKILL
       │                       └── JOB_DESCRIPTION
       ├── AUDIT_LOG
       └── NOTIFICATION

INSTITUTION ── DEPARTMENT ── PROGRAM ── COURSE ── COURSE_SKILL ── SKILL
                         └── STUDENT
```

**Key tables:**

| Table | Purpose |
|---|---|
| `users` | Auth: email, bcrypt hash, role, is_active |
| `students` | Profile: CGPA, semester, career_goal, target_role_id, readiness_score |
| `skills` | Canonical skill: name, category, type, difficulty |
| `skill_aliases` | Alias → canonical mapping for normalization |
| `student_skill_evidence` | Per-evidence record: source_type, weight, confidence, proficiency_indicated |
| `skill_gaps` | Current gap analysis: required_level, current_level, gap_level, status, explanation, priority |
| `recommendations` | Current recommendations: type, title, explanation, resource_url, priority, estimated_hours |
| `job_roles` | Industry job roles with title, category, description |
| `job_skills` | Skills per role: required_level (1–5), is_mandatory, priority |
| `job_descriptions` | Raw JD text + extracted_skills JSON |
| `assessments` | Quizzes: title, skill_id, time_limit, passing_score |
| `assessment_questions` | MCQ / True-False with options, correct_answer, explanation |
| `assessment_attempts` | Quiz sessions: score, correct_answers, proficiency_estimated |
| `assessment_answers` | Per-question answer: is_correct, points_earned |
| `resumes` | Uploaded file: filename, file_url, extracted_text, processing_status |
| `projects` | Student projects with github_url, is_verified |
| `certificates` | Certs with issuer, credential_url, is_verified |
| `internships` | Internship records with company, role, skills_used |
| `audit_logs` | action, entity_type, entity_id, user_id, timestamp |
| `notifications` | Per-user: title, message, notification_type, is_read |
| `industry_feedback` | feedback_type, feedback_text, rating, is_processed |
| `institutions` | Institution master record |
| `departments`, `programs`, `courses` | Academic hierarchy |
| `course_skills` | Curriculum coverage: course_id, skill_id, coverage_level |

---

## API Reference

**Interactive Swagger UI:** `http://localhost:8000/docs`
**ReDoc:** `http://localhost:8000/redoc`
**Base URL:** `http://localhost:8000`

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register + return JWT | No |
| POST | `/auth/login` | Login + return JWT | No |
| GET | `/auth/me` | Current user info | Bearer |
| POST | `/auth/logout` | Log out (audit) | Bearer |

### Students

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/students/me` | Student profile | Student |
| PATCH | `/students/me` | Update profile | Student |
| GET | `/students/me/skills` | Skills with evidence | Student |
| GET | `/students/me/skill-gaps` | Gap analysis results | Student |
| POST | `/students/me/analyze` | Trigger full AI pipeline | Student |
| GET | `/students/me/readiness` | Readiness score + breakdown | Student |
| GET | `/students/me/recommendations` | Recommendation list | Student |
| GET | `/students/me/notifications` | Notifications | Student |

### Documents

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/documents/upload/resume` | Upload resume, extract skills | Student |

### Assessments

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/assessments/` | List active assessments | Any |
| GET | `/assessments/{id}` | Assessment + questions | Any |
| POST | `/assessments/{id}/start` | Start an attempt | Student |
| POST | `/assessments/{id}/submit` | Submit answers, get score | Student |
| GET | `/assessments/my/attempts` | Past attempts | Student |

### Industry

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/industry/me` | Industry profile | Industry |
| GET | `/industry/job-roles` | Company's job roles | Industry |
| POST | `/industry/job-roles` | Create job role | Industry |
| POST | `/industry/job-roles/{id}/extract-skills` | AI extract from JD text | Industry |
| POST | `/industry/job-roles/{id}/skills` | Add skill manually | Industry |
| POST | `/industry/feedback` | Submit feedback | Industry |
| GET | `/industry/job-roles/all` | All job roles (for target selection) | Any |

### Skills

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/skills/` | List all skills | Any |
| GET | `/skills/search` | Search by name | Any |
| POST | `/skills/normalize` | Normalize raw skill text | Any |
| POST | `/skills/extract` | Extract skills from text | Any |

### Analytics

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/analytics/institution` | Institution stats | Faculty/Admin |
| GET | `/analytics/department/{id}` | Department stats | Faculty/Admin |
| GET | `/analytics/curriculum-alignment` | Curriculum vs. industry | Faculty/Admin |
| GET | `/analytics/top-demanded-skills` | Most demanded skills | Any |

### Admin

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/admin/dashboard` | System statistics | Admin |
| GET | `/admin/users` | All users list | Admin |
| GET | `/admin/audit-logs` | Audit log entries | Admin |

### Recommendations and Notifications

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| PATCH | `/recommendations/{id}/complete` | Mark complete | Student |
| PATCH | `/recommendations/{id}/dismiss` | Dismiss | Student |
| GET | `/notifications/` | List notifications | Any |
| PATCH | `/notifications/{id}/read` | Mark as read | Any |

---

## Prerequisites

| Requirement | Minimum Version | Notes |
|---|---|---|
| Python | 3.11 | Backend and AI modules |
| Node.js | 18 | Frontend |
| npm | 9 | Frontend packages |
| PostgreSQL | 15 | Database (or use Docker) |
| Git | Any | |
| Docker | Latest | Optional, for containerized setup |

---

## Installation

### Option A — Manual Setup

**Step 1 — Clone the repository**

```bash
git clone <your-repository-url>
cd SIH
```

**Step 2 — Configure environment variables**

```powershell
# Windows PowerShell
Copy-Item .env.example .env
# Edit .env with your values
```

**Step 3 — Set up the backend**

```powershell
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Install all dependencies
pip install -r requirements.txt
```

If using spaCy features (installed in Docker by default), run:
```bash
python -m spacy download en_core_web_sm
```

**Step 4 — Set up the frontend**

```powershell
cd frontend
npm install

# Create frontend .env
echo "VITE_API_URL=http://localhost:8000" > .env
```

---

### Option B — Docker Compose

Runs all three services (PostgreSQL, backend, frontend) with one command:

```powershell
# From project root (where docker-compose.yml is)
docker compose up --build
```

**Services and ports:**

| Service | Port | URL |
|---|---|---|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 8000 | http://localhost:8000 |
| PostgreSQL | 5432 | localhost:5432 |

PostgreSQL starts first with a health check; backend waits until it is healthy before starting.

**Stop services:**
```powershell
docker compose down
```

**Stop and wipe database:**
```powershell
docker compose down -v
```

---

## Configuration

Copy `.env.example` to `.env` and configure the following variables:

### Backend Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | `postgresql+asyncpg://user:pass@host:port/dbname` |
| `POSTGRES_DB` | Docker | `sih_db` | Database name |
| `POSTGRES_USER` | Docker | `sih_user` | Database user |
| `POSTGRES_PASSWORD` | Docker | `sih_password` | Database password |
| `JWT_SECRET` | Yes | `supersecretjwtkey2026sih` | **Change this in any real deployment** |
| `JWT_ALGORITHM` | No | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `480` | Token lifetime (8 hours) |
| `AI_PROVIDER` | No | `mock` | `mock` (demo) or `local` (sentence-transformers) |
| `OPENAI_API_KEY` | No | — | Not used in current implementation |
| `CORS_ORIGINS` | No | `http://localhost:5173,http://localhost:3000` | Allowed origins |
| `ENVIRONMENT` | No | `development` | `development` or `production` |
| `MAX_UPLOAD_SIZE_MB` | No | `10` | Max resume upload size |
| `UPLOAD_DIR` | No | `./uploads` | File storage directory |

### Frontend Variable

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend URL, e.g. `http://localhost:8000` |

---

## Database Setup

### Using Docker (Recommended)

Handled automatically by Docker Compose. Skip to seeding.

### Manual Setup

```sql
-- Create database and user
CREATE DATABASE sih_db;
CREATE USER sih_user WITH PASSWORD 'sih_password';
GRANT ALL PRIVILEGES ON DATABASE sih_db TO sih_user;

-- In the sih_db database, enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

Set `DATABASE_URL` in `backend/.env`:
```
DATABASE_URL=postgresql+asyncpg://sih_user:sih_password@localhost:5432/sih_db
```

Tables are created automatically on first backend startup via SQLAlchemy `create_all`. No separate migration command is required.

> Alembic is installed but migration files are not included in this prototype. Schema changes require manual management.

---

## Seed / Demo Data

After the backend is running and tables exist:

```powershell
cd backend
python seed.py
```

**What is created:**

| Category | Details |
|---|---|
| Skills | 40+ skills across 8 categories with full alias lists |
| Skill levels | 6 levels: No Evidence, Beginner, Basic, Intermediate, Advanced, Expert |
| Institution | "Indian Institute of Technology Demo" |
| Departments | CSE, Data Science, Electronics |
| Programs | B.Tech CSE, B.Tech DS |
| Courses | 10 courses with CourseSkill mappings |
| Demo users | student, faculty, admin, industry accounts |
| Industry companies | 5 companies with sectors |
| Job roles | 10 roles (Data Scientist, ML Engineer, Full-Stack Dev, etc.) |
| Job skills | Required skills per role with proficiency levels |
| Students | 30 student profiles with skills, projects, certificates |
| Assessments | 5 (Python, Machine Learning, SQL, Data Analysis, Git) |
| Questions | 50 questions (10 per assessment, MCQ + True/False) |
| Learning resources | Linked to key skills |
| Notifications | Welcome messages per student |
| Industry feedback | 5 sample feedback entries |

---

## Running the Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1   # Activate virtual env (Windows)
uvicorn app.main:app --reload --port 8000
```

| URL | Purpose |
|---|---|
| `http://localhost:8000` | API root (health + version info) |
| `http://localhost:8000/docs` | Swagger interactive API docs |
| `http://localhost:8000/redoc` | ReDoc API reference |
| `http://localhost:8000/health` | Health check endpoint |

---

## Running the Frontend

```powershell
cd frontend
npm run dev
```

Frontend available at: `http://localhost:5173`

Other scripts:
```powershell
npm run build      # TypeScript compile + Vite production bundle
npm run preview    # Preview production build
npm run lint       # Run oxlint
```

---

## Demo Login Credentials

Created by `seed.py`:

| Role | Email | Password |
|---|---|---|
| 👤 Student | `student@example.com` | `Demo@1234` |
| 👨‍🏫 Faculty | `faculty@example.com` | `Demo@1234` |
| 🔧 Admin | `admin@example.com` | `Demo@1234` |
| 🏢 Industry | `industry@example.com` | `Demo@1234` |

The login page includes quick-access buttons that auto-fill these credentials.

> These are development/demo credentials only. Use strong, unique credentials in any real deployment.

---

## How to Use the System

### Student Workflow

```
1.  Open http://localhost:5173 → Login as student
2.  Dashboard shows: readiness score, recent gaps, recommendations
3.  Profile → Set career goal → Select target job role
4.  Skills → Upload Resume (PDF/DOCX/TXT) → AI extracts skills
5.  Dashboard → Click "Run AI Analysis"
    → AI computes gaps, readiness (0-100), recommendations
6.  Skill Gaps → See each required skill:
    - Required level vs. current level
    - Status: missing / partial_gap / major_gap / matched / exceeds
    - Plain-English AI explanation
7.  Recommendations → See prioritized actions:
    - Resource title, provider, type, estimated hours
    - WHY this recommendation (AI explanation)
    - Mark complete / Dismiss
8.  Assessments → Take a skill quiz → Submit → See score + proficiency
9.  Dashboard → Run AI Analysis again → Watch readiness score update
```

### Faculty Workflow

```
1. Login as faculty
2. Dashboard: student count, average readiness, distribution chart
3. My Students: all students with readiness scores and career goals
4. Analytics: top skill gaps, curriculum alignment table
```

### Admin Workflow

```
1. Login as admin
2. Dashboard: total users, students, assessments, recommendations
3. Users: all accounts with role badges
4. Reports: industry demand chart, readiness distribution
5. Audit Log: timestamped record of all system actions
```

### Industry Workflow

```
1. Login as industry
2. Dashboard: company stats, demanded skills, job role list
3. Job Roles → Add Job Role → Fill in details
4. Select a role → Paste job description → Extract Skills with AI
   → Required skills added automatically
5. Alternatively: Add skills manually with required proficiency level
6. Feedback → Select type → Write text → Optional rating → Submit
```

---

## Complete Demo Scenario

**Estimated time: 10 minutes**

### Setup

Both `student@example.com` and `industry@example.com` logged in on separate tabs.

### Step 1 — Industry Creates Job Requirement (2 min)

Log in as **industry@example.com** → Job Roles → Add Job Role: "Junior Data Scientist"

Open the role → paste JD text:
```
We need a Data Scientist proficient in Python and machine learning.
SQL is required. Experience with Docker and AWS is a plus.
Strong statistics and data analysis skills are essential.
```

Click **Extract Skills** → AI extracts: Python, Machine Learning, SQL, Docker, AWS, Statistics, Data Analysis.

### Step 2 — Student Sets Target (1 min)

Log in as **student@example.com** → Profile → Career Goal: "Data Scientist" → Target Role: Junior Data Scientist

### Step 3 — Upload Resume (1 min)

Skills → Upload Resume (PDF) → AI extracts skills from document.

### Step 4 — AI Analysis (1 min)

Dashboard → Run AI Analysis → Gaps computed, readiness score displayed.

Go to **Skill Gaps** → Show gap status per skill with AI explanations.

### Step 5 — Recommendations (1 min)

Recommendations → Show resource title, provider, estimated hours, and why each was recommended.

### Step 6 — Assessment (2 min)

Assessments → Python Fundamentals → Answer 10 questions → Submit → See 75% score, Intermediate level.

### Step 7 — Re-analysis (30 sec)

Dashboard → Run AI Analysis → Readiness score increases → Python gap resolved → Focus shifts to Docker, AWS.

### Step 8 — Faculty / Admin View (1 min)

Switch to **faculty@example.com** → My Students → Analytics → Curriculum alignment table.

---

## Security

### Implemented

- Passwords hashed with bcrypt (no plain-text storage)
- JWT HS256 authentication for all protected endpoints
- Role-based access control enforced per endpoint
- Pydantic v2 validates all request bodies (HTTP 422 on invalid input)
- File type and size validation on resume upload
- CORS limited to configured origins
- Audit logging of significant events
- Generic 500 error handler (no stack trace exposure)

### Not in This Prototype

- Rate limiting on auth endpoints
- HTTPS (handled by reverse proxy in production)
- Token refresh mechanism
- Row-level security in PostgreSQL

---

## Error Handling

| Scenario | HTTP Code | Response |
|---|---|---|
| Invalid email or password | 401 | "Invalid email or password" |
| Email already registered | 400 | "Email already registered" |
| Account disabled | 403 | "Account is disabled" |
| Wrong role for endpoint | 403 | Role requirement message |
| Invalid / expired JWT | 401 | "Invalid or expired token" |
| Student profile not found | 404 | "Student profile not found" |
| File type not allowed | 400 | Allowed types listed |
| File too large | 400 | Size limit stated |
| Invalid request body | 422 | Pydantic validation error details |
| Unhandled server error | 500 | "Internal server error. Please try again." |

---

## Limitations

1. **Skill extraction accuracy depends on document quality.** Poorly formatted PDFs may yield fewer skills than expected.

2. **Taxonomy coverage is limited to 40+ skills.** Niche or domain-specific skills not in the taxonomy will not be extracted automatically.

3. **Recommendation resources are static.** The curated resource list in `recommendation_engine.py` is hardcoded. URLs may become outdated over time.

4. **Readiness is a heuristic indicator.** The formula weights are design choices, not calibrated against real employment outcome data. Do not interpret as a precise measurement.

5. **Mock embeddings are not semantically meaningful.** In `AI_PROVIDER=mock` mode, semantic matching results are not meaningful for real use. Use `AI_PROVIDER=local` for genuine semantic similarity.

6. **Curriculum alignment requires manual mapping.** `CourseSkill` records must be populated manually or via seed. There is no automated curriculum ingestion.

7. **Industry feedback does not auto-update student scores.** Feedback is stored for human review only.

8. **No automated test suite** is included in the current prototype.

9. **No production deployment configuration** (reverse proxy, HTTPS, secrets management).

10. **Alembic migrations not used.** Schema changes must be managed manually.

---

## Future Scope

- Automated curriculum ingestion from uploaded syllabus PDFs
- Real-time labor market data integration via job portal APIs
- Automated skill taxonomy expansion from extracted skills
- LMS integration (Moodle, Canvas)
- ERP integration for student enrollment data
- Collaborative filtering or RL-based recommendation improvement
- Skill demand forecasting (2–3 year ahead)
- Multilingual NLP for regional language job descriptions
- Native mobile application
- Peer learning and study group matching
- Alumni outcome tracking to calibrate readiness formula
- Automated test suite (pytest, pytest-asyncio, Playwright)
- Production deployment: Docker Swarm / Kubernetes, Nginx, HTTPS

---

## Hackathon Relevance

| SIH Requirement | Implementation |
|---|---|
| Bridge academia–industry skill gap | Three-tier platform: Industry ↔ Curriculum ↔ Student |
| Extract industry skill requirements | `SkillExtractor` NLP + `SkillNormalizer` |
| Handle inconsistent skill naming | Alias dictionary + rapidfuzz fuzzy matching |
| Compare curriculum to industry | `CourseSkill` vs. `JobSkill` analytics |
| Build verified student skill profiles | Multi-source evidence with type-based weights |
| Identify student skill gaps | `GapDetector`: 5-status classification per skill |
| Measure competency | `ReadinessEngine`: weighted score 0–100 |
| Personalized recommendations | `RecommendationEngine`: gap-driven resource selection |
| Explain AI decisions | Template-generated explanations for every result |
| Assessment-based improvement | MCQ/True-False quizzes → evidence → re-analysis |
| Industry feedback loop | Structured `IndustryFeedback` with type + rating |
| Institution analytics | Faculty and admin dashboards + curriculum alignment |
| Accountability | `AuditLog` for all significant system actions |

---

## Innovation and Uniqueness

### Complete Gap-Closure Cycle

The system does not stop at identifying a gap. It recommends a resource, provides an assessment, updates the profile, and recomputes readiness — all in one platform.

### Multi-Source Evidence Weighting

Self-declared skills carry 0.05 weight. Assessment performance carries 0.30. This discourages gaming while rewarding demonstrable competency.

### Explainable AI Without a Language Model

All explanations are generated from code templates. No OpenAI API key is required for explainability. The platform is fully functional offline (in `AI_PROVIDER=mock` mode for demos).

### Demo-First Architecture

`AI_PROVIDER=mock` allows the complete platform to run on any laptop at a hackathon without model downloads or internet dependency.

### Three-Tier Synchronization

Industry requirements, curriculum coverage, and student skills are all connected through a single shared skill taxonomy — making the entire system coherent rather than three separate modules.

---

## Contributing

This project was built as a hackathon prototype for SIH 2026. Contributions, bug reports, and improvement suggestions are welcome.

### How to Contribute

**1. Fork and clone**

```bash
git clone https://github.com/<your-username>/SIH.git
cd SIH
```

**2. Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/` — new functionality
- `fix/` — bug fixes
- `docs/` — documentation improvements
- `refactor/` — code restructuring without behavior change

**3. Make your changes**

Follow existing code patterns:
- Backend: Python 3.11, FastAPI async patterns, SQLAlchemy async sessions, Pydantic v2 models
- Frontend: React 19 with TypeScript, TailwindCSS v4 utility classes
- AI modules: Singleton pattern via `get_*()` functions, structured logging, inline docstrings

**4. Test your changes**

At minimum, verify:
- Backend starts without errors: `uvicorn app.main:app --reload`
- All API routes still return expected responses (check `/docs`)
- Frontend builds without TypeScript errors: `npm run build`
- `npm run lint` passes

**5. Commit clearly**

```bash
git add .
git commit -m "type: short description of what and why"
```

Commit message format:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation change
- `refactor:` code change without behavior change
- `test:` adding or updating tests

**6. Open a pull request**

Submit a pull request against the `main` branch. Include:
- What the change does
- Which problem it solves or which section of the codebase it affects
- Any API or schema changes

### Areas That Need Contribution

If you want to contribute but don't know where to start:

| Area | What's Needed |
|---|---|
| Tests | Unit tests for all AI modules (`pytest`, `pytest-asyncio`) |
| Taxonomy | Expand skill list beyond current 40+ entries |
| Curriculum ingestion | Auto-extract skills from uploaded syllabus PDFs |
| Recommendation resources | Add curated resources for more skills |
| Analytics | Richer charts for faculty and admin views |
| StudentProgress page | Currently a placeholder — needs implementation |
| AdminCurriculum page | Currently a placeholder — needs implementation |
| Accessibility | Keyboard navigation and screen reader support |
| Documentation | API usage examples, architecture diagrams |

### Reporting Issues

When reporting a bug, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Python version, Node.js version, and OS

### Code Style

- **Python:** PEP 8. Use type hints on all function signatures. Use `async`/`await` for all database operations.
- **TypeScript:** Strict mode. No `any` types without a comment explaining why. Components in PascalCase, hooks in camelCase.
- **Commits:** Keep each commit focused on one logical change.

---

## Credits

---

> **Built by Anand D for Hackathon**

**Project:** SkillSync AI — AI-Powered Academia–Industry Skill Synchronization Portal

**Hackathon:** Smart India Hackathon 2026

**Problem Statement ID:** SIH26004

**Team:** Stellar Intelligence

---

## License

License information will be added separately. This project was developed as a hackathon prototype.

