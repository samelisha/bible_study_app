from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://bible_user:bible_pass@localhost:5432/bible_db"

    class Config:
        env_file = ".env"

settings = Settings()
