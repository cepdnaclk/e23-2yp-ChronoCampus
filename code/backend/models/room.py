from database import db

class Room(db.Model):
    __tablename__ = "rooms"

    room_id = db.Column(db.Integer, primary_key=True)
    room_name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String(100))
    created_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "room_id": self.room_id,
            "room_name": self.room_name,
            "capacity": self.capacity,
            "location": self.location
        }