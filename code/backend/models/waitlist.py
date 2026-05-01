from database import db
from datetime import datetime


class RoomWaitlistQueue(db.Model):
    __tablename__ = "room_waitlist"

    waitlist_id      = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id          = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    room_id          = db.Column(db.Integer, db.ForeignKey("rooms.room_id"), nullable=False)
    reservation_date = db.Column(db.Date, nullable=False)
    start_time       = db.Column(db.DateTime, nullable=False)
    end_time         = db.Column(db.DateTime, nullable=False)
    queue_position   = db.Column(db.Integer, nullable=False)   # 1 = first in line
    status           = db.Column(db.String(20), default="waiting")  # waiting | notified | expired
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="waitlist_entries")
    room = db.relationship("Room", backref="waitlist_entries")

    def to_dict(self):
        return {
            "waitlist_id":      self.waitlist_id,
            "user_id":          self.user_id,
            "room_id":          self.room_id,
            "reservation_date": str(self.reservation_date),
            "start_time":       str(self.start_time),
            "end_time":         str(self.end_time),
            "queue_position":   self.queue_position,
            "status":           self.status,
            "created_at":       str(self.created_at),
        }