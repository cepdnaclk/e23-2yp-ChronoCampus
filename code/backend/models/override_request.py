from database import db

class OverrideRequest(db.Model):
    __tablename__ = "override_requests"

    request_id = db.Column(db.Integer, primary_key=True)

    reservation_id = db.Column(db.Integer, db.ForeignKey("reservations.reservation_id"))
    lecturer_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    student_id = db.Column(db.Integer, db.ForeignKey("users.user_id"))

    status = db.Column(db.String(20), default="pending")

    created_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "request_id": self.request_id,
            "reservation_id": self.reservation_id,
            "lecturer_id": self.lecturer_id,
            "student_id": self.student_id,
            "status": self.status
        }
