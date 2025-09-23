import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE__URL", "postgresql://user:password@localhost/dbname")
    FIREBASE_CREDENTIALS: str = os.getenv("FIREBASE_CREDENTIALS", "{}")
    FIREBASE_API_KEY: str = os.getenv("FIREBASE_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()