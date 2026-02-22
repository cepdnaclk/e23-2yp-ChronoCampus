from extensions import db

class Room(db.Model):
    __tablename__ = "rooms"

    room_id = db.Column(db.String, primary_key=True)
    room_name = db.Column(db.String, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String, nullable=False)
    availability_status = db.Column(db.String, default="available")
