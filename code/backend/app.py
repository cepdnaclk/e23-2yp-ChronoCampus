from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import db
from models.room import Room
from models.reservation import Reservation
from models.override_request import OverrideRequest
from models.notification import Notification
from models.watchlist import RoomWatchlist
from models.waitlist import RoomWaitlistQueue as RoomWaitlist
from models.users import User
from routes.reservation_routes import reservation_bp
from routes.watchlist_routes import watchlist_bp
from routes.auth_routes import auth_bp

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, supports_credentials=True)

db.init_app(app)

with app.app_context():
    db.create_all()
    print("✅ Tables ready!")
    print("✅ DB URI:", app.config["SQLALCHEMY_DATABASE_URI"])

app.register_blueprint(reservation_bp)
app.register_blueprint(watchlist_bp)
app.register_blueprint(auth_bp)

@app.route("/")
def home():
    return jsonify({"message": "ChronoCampus API Running"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)