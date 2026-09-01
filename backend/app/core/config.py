from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./punarvas.db"
    API_V1_PREFIX: str = "/api"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = 'ignore' # to avoid error when passing extra config from env

settings = Settings()
