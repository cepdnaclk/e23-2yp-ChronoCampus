from extensions import db

class Reservation(db.Model):
    __tablename__ = "reservations"

    reservation_id = db.Column(db.String, primary_key=True)
    reservation_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String, default="pending")

    user_id = db.Column(db.String, db.ForeignKey("users.user_id"))
    room_id = db.Column(db.String, db.ForeignKey("rooms.room_id"))