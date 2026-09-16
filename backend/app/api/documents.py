"""Document upload and skill extraction API."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os, shutil, uuid

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.student import Student
from app.models.evidence import Resume, ResumeSkill
from app.models.skill import Skill, StudentSkill, StudentSkillEvidence
from app.ai.skill_extractor import get_extractor

router = APIRouter()

ALLOWED_TYPES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"}
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def extract_text_from_file(file_path: str, content_type: str) -> str:
    """Extract text from uploaded document."""
    ext = os.path.splitext(file_path)[1].lower()
    try:
        if ext == ".txt":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        elif ext == ".pdf":
            try:
                import fitz  # PyMuPDF
                doc = fitz.open(file_path)
                return "\n".join(page.get_text() for page in doc)
            except ImportError:
                with open(file_path, "rb") as f:
                    return f.read().decode("utf-8", errors="ignore")
        elif ext == ".docx":
            try:
                from docx import Document
                doc = Document(file_path)
                return "\n".join(p.text for p in doc.paragraphs)
            except ImportError:
                with open(file_path, "rb") as f:
                    return f.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return f"Text extraction failed: {e}"
    return ""


@router.post("/upload/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Students only")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}")

    if file.size and file.size > settings.max_upload_bytes:
        raise HTTPException(status_code=400, detail=f"File too large. Max: {settings.MAX_UPLOAD_SIZE_MB}MB")

    student_result = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = student_result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Extract text
    extracted_text = extract_text_from_file(file_path, file.content_type or "")

    # Create resume record
    resume = Resume(
        student_id=student.id,
        filename=file.filename or filename,
        file_url=f"/uploads/{filename}",
        extracted_text=extracted_text,
        is_primary=True,
        processing_status="processing",
    )
    db.add(resume)
    await db.flush()

    # Extract skills with AI
    extractor = get_extractor()
    extracted_skills = extractor.extract_from_resume(extracted_text)

    added_skills = []
    for skill_info in extracted_skills:
        skill_name = skill_info["skill_name"]
        confidence = skill_info["confidence"]

        skill_result = await db.execute(select(Skill).where(Skill.name == skill_name))
        skill = skill_result.scalar_one_or_none()
        if not skill:
            skill = Skill(name=skill_name)
            db.add(skill)
            await db.flush()

        # Add resume skill record
        rs = ResumeSkill(
            resume_id=resume.id,
            skill_id=skill.id,
            raw_skill_text=skill_name,
            confidence=confidence,
            evidence_text=skill_info.get("evidence_text", ""),
        )
        db.add(rs)

        # Add student skill evidence
        evidence = StudentSkillEvidence(
            student_id=student.id,
            skill_id=skill.id,
            source_type="resume",
            source_id=resume.id,
            confidence=confidence,
            weight=0.10,
            proficiency_indicated=2,  # Basic level from resume mention
        )
        db.add(evidence)

        # Update or create student skill
        ss_result = await db.execute(
            select(StudentSkill).where(
                StudentSkill.student_id == student.id,
                StudentSkill.skill_id == skill.id,
            )
        )
        ss = ss_result.scalar_one_or_none()
        if not ss:
            ss = StudentSkill(
                student_id=student.id,
                skill_id=skill.id,
                proficiency_level=2,
                proficiency_score=confidence * 40,
            )
            db.add(ss)

        added_skills.append({"skill": skill_name, "confidence": confidence})

    resume.processing_status = "done"
    await db.commit()

    return {
        "message": f"Resume uploaded. Extracted {len(added_skills)} skills.",
        "resume_id": resume.id,
        "extracted_skills": added_skills,
        "file_url": resume.file_url,
    }
