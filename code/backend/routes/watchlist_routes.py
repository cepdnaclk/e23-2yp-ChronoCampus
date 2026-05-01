from flask import Blueprint, request, jsonify
from database import db
from models.watchlist import RoomWatchlist

watchlist_bp = Blueprint("watchlist", __name__)

@watchlist_bp.route("/watchlist", methods=["POST"])
def add_watcher():
    data = request.json
    user_id = data.get("user_id")
    room_id = data.get("room_id")
    reservation_date = data.get("reservation_date")
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    from datetime import datetime
    try:
        start_time_dt = datetime.fromisoformat(start_time)
        end_time_dt = datetime.fromisoformat(end_time)
    except Exception:
        return jsonify({"error": "Invalid datetime format"}), 400

    watcher = RoomWatchlist(
        user_id=user_id,
        room_id=room_id,
        reservation_date=reservation_date,
        start_time=start_time_dt,
        end_time=end_time_dt
    )
    db.session.add(watcher)
    db.session.commit()

    return jsonify({"message": "Watcher added successfully"}), 201