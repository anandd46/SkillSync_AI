from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import os

from app.core.config import settings
from app.core.database import create_tables

# API routers
from app.api import auth, students, faculty, admin, industry, skills, assessments, analytics, documents, recommendations, notifications

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SIH 2026 — Skill Sync Portal API",
    description="AI-Powered Academia–Industry Skill Synchronization Portal",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/students", tags=["Students"])
app.include_router(faculty.router, prefix="/faculty", tags=["Faculty"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(industry.router, prefix="/industry", tags=["Industry"])
app.include_router(skills.router, prefix="/skills", tags=["Skills"])
app.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])


@app.on_event("startup")
async def startup_event():
    logger.info("Starting SIH 2026 Skill Sync Portal...")
    await create_tables()
    logger.info("Database tables ready")


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "ai_provider": settings.AI_PROVIDER,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."},
    )
