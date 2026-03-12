from flask import Flask
from flask_cors import CORS
from config import Config
from database import db

from models.room import Room
from models.users import User
from models.reservation import Reservation
from models.override_request import OverrideRequest
from models.notification import Notification
from models.watchlist import RoomWatchlist
from models.waitlist import RoomWaitlist

from routes.reservation_routes import reservation_bp

from routes.watchlist_routes import watchlist_bp


app = Flask(__name__)
app.config.from_object(Config)
app.config["SQLALCHEMY_ECHO"] = True
CORS(app)

db.init_app(app)



with app.app_context():
    db.create_all()
    print("Tables created!")

app.register_blueprint(reservation_bp)
app.register_blueprint(watchlist_bp)

print("DATABASE:", app.config["SQLALCHEMY_DATABASE_URI"]) 

@app.route("/")
def home():
    return {"message": "ChronoCampus Backend Running"}

if __name__ == "__main__":
    app.run(debug=True)
