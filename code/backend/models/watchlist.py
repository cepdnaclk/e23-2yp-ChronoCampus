from database import db

class RoomWatchlist(db.Model):
    __tablename__ = "room_watchlist"

    watch_id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    room_id = db.Column(db.Integer, db.ForeignKey("rooms.room_id"))

    reservation_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)

    created_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "watch_id": self.watch_id,
            "user_id": self.user_id,
            "room_id": self.room_id,
            "reservation_date": str(self.reservation_date)
        }
