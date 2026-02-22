import os

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///chronocampus.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False