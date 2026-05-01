from database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    user_id            = db.Column(db.Integer, primary_key=True)
    full_name          = db.Column(db.String(100), nullable=False)
    email              = db.Column(db.String(150), unique=True, nullable=False)
    password_hash      = db.Column(db.Text, nullable=False)
    role               = db.Column(db.String(20), nullable=False)
    department         = db.Column(db.String(100), nullable=False, default="General")
    is_active          = db.Column(db.Boolean, default=True)
    email_verified     = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.Text)
    created_at         = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at         = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "user_id":    self.user_id,
            "full_name":  self.full_name,
            "email":      self.email,
            "role":       self.role,
            "department": self.department,
            "is_active":  self.is_active,
        }