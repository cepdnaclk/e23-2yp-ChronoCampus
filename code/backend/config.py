class Config:
    SECRET_KEY = "devkey"
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:password@localhost/chronocampus"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
