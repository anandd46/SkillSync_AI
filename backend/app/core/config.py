from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "SIH 2026 - Skill Sync Portal"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://sih_user:sih_password@localhost:5432/sih_db"

    # JWT
    JWT_SECRET: str = "supersecretjwtkey2026sih"
    SECRET_KEY: str = "supersecretjwtkey2026sih"
    JWT_ALGORITHM: str = "HS256"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # AI
    AI_PROVIDER: str = "mock"  # mock | openai | local
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Upload
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "./uploads"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
