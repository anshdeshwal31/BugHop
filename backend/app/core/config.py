from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    github_app_id: str = ""
    github_private_key: str = ""
    github_webhook_secret: str = ""

    openai_api_key: str = ""

    qdrant_url: str = ""
    qdrant_api_key: str = ""

    llm_model: str = "gpt-5.2"

    environment: str = "development"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
