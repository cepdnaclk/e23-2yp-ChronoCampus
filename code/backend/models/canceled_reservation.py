from extensions import db
from datetime import datetime

class CanceledReservation(db.Model):
    __tablename__ = "canceled_reservations"

    canceled_id = db.Column(db.String, primary_key=True)
    reservation_id = db.Column(db.String)
    room_id = db.Column(db.String)
    user_id = db.Column(db.String)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    canceled_by = db.Column(db.String)  # who canceled: staff override
    canceled_at = db.Column(db.DateTime, default=datetime.utcnow)