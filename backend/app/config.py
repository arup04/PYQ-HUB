import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Base configuration
    PROJECT_NAME: str = "PYQ Hub"
    API_V1_STR: str = "/api"
    
    # Database configuration (PostgreSQL with asyncpg)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/pyq_hub"
    
    # Authentication (JWT)
    JWT_SECRET: str = "7a83d4c6b8c9e0d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Storage settings ("local" or "s3")
    STORAGE_TYPE: str = "local"
    UPLOAD_DIR: str = "uploads"  # relative to the backend/ folder
    
    # S3 Settings (Required if STORAGE_TYPE == "s3")
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_BUCKET_NAME: str = ""
    AWS_REGION: str = "us-east-1"
    
    # Enable loading from dotenv file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
