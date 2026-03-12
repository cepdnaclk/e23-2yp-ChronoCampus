from database import db
from datetime import datetime
from models.users import User
from models.room import Room

class Reservation(db.Model):
    __tablename__ = "reservations"

    reservation_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    room_id = db.Column(db.Integer, db.ForeignKey("rooms.room_id"))
    reservation_date = db.Column(db.Date)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    status = db.Column(db.String(20), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Add relationships
    user = db.relationship("User", backref="reservations")
    room = db.relationship("Room", backref="reservations")

    def to_dict(self):
        return {
            "reservation_id": self.reservation_id,
            "user_id": self.user_id,
            "user_name": self.user.full_name if self.user else None,
            "room_id": self.room_id,
            "room_name": self.room.room_name if self.room else None,
            "reservation_date": str(self.reservation_date),
            "start_time": str(self.start_time),
            "end_time": str(self.end_time),
         
            "status": self.status
        }