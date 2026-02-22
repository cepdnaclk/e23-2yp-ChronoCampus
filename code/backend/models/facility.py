from extensions import db

class Facility(db.Model):
    __tablename__ = "facilities"

    facility_id = db.Column(db.String, primary_key=True)
    facility_name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)