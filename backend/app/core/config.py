from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    github_app_id: str = ""
    github_private_key: str = ""
    github_webhook_secret: str = ""
    github_timeout_seconds: int = 30
    github_pat: str = ""
    github_max_files: int = 0

    google_api_key: str = ""

    qdrant_url: str = ""
    qdrant_api_key: str = ""
    qdrant_timeout_seconds: int = 60
    qdrant_upsert_batch_size: int = 128

    llm_model: str = "gemini-2.5-flash"
    embedding_model: str = "models/text-embedding-004"
    embedding_provider: str = "google"
    embedding_dim: int = 1536
    huggingface_api_key: str = ""
    embedding_concurrency: int = 6
    embedding_batch_size: int = 16

    environment: str = "development"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = str(_ENV_PATH)
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
