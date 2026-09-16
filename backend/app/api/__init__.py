from app.api.auth import router as auth_router
from app.api.students import router as students_router
from app.api.faculty import router as faculty_router
from app.api.admin import router as admin_router
from app.api.industry import router as industry_router
from app.api.skills import router as skills_router
from app.api.assessments import router as assessments_router
from app.api.analytics import router as analytics_router
from app.api.documents import router as documents_router
from app.api.recommendations import router as recommendations_router
from app.api.notifications import router as notifications_router

# Re-export routers
from app.api import auth, students, faculty, admin, industry, skills, assessments, analytics, documents, recommendations, notifications
