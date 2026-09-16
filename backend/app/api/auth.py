from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from pydantic import BaseModel, EmailStr, field_validator
import re

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token,
    get_current_user
)
from app.core.config import settings
from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.industry import Industry
from app.services.audit_service import log_action

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "student"  # student | faculty | admin | industry

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ("student", "faculty", "admin", "industry"):
            raise ValueError("Invalid role")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        is_active=True,
    )
    db.add(user)
    await db.flush()

    # Create role-specific profile
    if data.role == "student":
        profile = Student(user_id=user.id)
        db.add(profile)
    elif data.role == "faculty":
        profile = Faculty(user_id=user.id)
        db.add(profile)
    elif data.role == "industry":
        profile = Industry(user_id=user.id, name=data.full_name)
        db.add(profile)

    await db.commit()
    await db.refresh(user)

    # Create token
    token = create_access_token({"sub": str(user.id), "role": user.role})
    await log_action(db, user.id, "USER_REGISTERED", "user", user.id)

    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        }
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    await log_action(db, user.id, "USER_LOGIN", "user", user.id)

    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        }
    )


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "avatar_url": current_user.avatar_url,
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await log_action(db, current_user.id, "USER_LOGOUT", "user", current_user.id)
    return {"message": "Logged out successfully"}
