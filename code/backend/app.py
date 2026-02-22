from flask import Flask
from extensions import db
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    from routes.reservation import reservation_bp
    app.register_blueprint(reservation_bp)

    @app.route("/")
    def home():  
        return "ChronoCampus Backend is Running!"
    with app.app_context():
        from models.room import Room
        from models.user import User
        from models.facility import Facility
        from models.reservation import Reservation
        db.create_all()

        # Add sample room if not exists
        if not Room.query.first():
            sample_room = Room(
            room_id="R001",
            room_name="Lab 1",
            capacity=40,
            location="Block A",
            availability_status="available"
            )
            db.session.add(sample_room)

        # Add sample user if not exists
        if not User.query.first():
            sample_user = User(
            user_id="U001",
            name="Test Student",
            email="student@test.com",
            password="1234",
            role="student"
            )
            db.session.add(sample_user)
        
        db.session.commit() 

        # Add sample staff if not exists
        if not User.query.filter_by(user_id="STAFF001").first():
            staff_user = User(
            user_id="STAFF001",
            name="Dr. Smith",
            email="dr.smith@university.com",
            password="1234",
            role="staff"
            )
            db.session.add(staff_user)

        db.session.commit()
        

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
