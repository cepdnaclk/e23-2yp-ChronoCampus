import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # ── Database ───────────────────────────────────────────────
    # Reads from .env file — create a .env in backend/ with:
    #   DB_HOST=localhost
    #   DB_NAME=chronocampus_db
    #   DB_USER=postgres
    #   DB_PASSWORD=yourpassword
    #   DB_PORT=5432
    DB_HOST     = os.getenv("DB_HOST",     "localhost")
    DB_NAME     = os.getenv("DB_NAME",     "chronocampus_db")
    DB_USER     = os.getenv("DB_USER",     "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_PORT     = os.getenv("DB_PORT",     "5432")

    # SQLAlchemy connection string (built from .env values)
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # psycopg2 connection dict (for auth routes)
    PSYCOPG2_CONN = {
        "host":     DB_HOST,
        "database": DB_NAME,
        "user":     DB_USER,
        "password": DB_PASSWORD,
        "port":     DB_PORT,
    }
    
