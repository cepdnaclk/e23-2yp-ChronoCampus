from flask import Blueprint, request, jsonify
from extensions import db
from models.reservation import Reservation
from models.user import User
from models.room import Room
from models.canceled_reservation import CanceledReservation
from datetime import datetime
import uuid

reservation_bp = Blueprint("reservation", __name__, url_prefix="/reservations")

# -----------------------------
# Create Reservation
# -----------------------------
@reservation_bp.route("/create", methods=["POST"])
def create_reservation():
    data = request.get_json()

    # --- Step 1: Convert times ---
    start_time = datetime.strptime(data["start_time"], "%Y-%m-%d %H:%M:%S")
    end_time = datetime.strptime(data["end_time"], "%Y-%m-%d %H:%M:%S")

    # --- Step 2: Validate time ---
    if end_time <= start_time:
        return jsonify({"error": "End time must be after start time"}), 400

    # --- Step 3: Validate user ---
    user = User.query.get(data["user_id"])
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.role not in ["student", "staff"]:
        return jsonify({"error": "User cannot make a reservation"}), 403

    # --- Step 4: Check for conflicts ---
    existing_reservations = Reservation.query.filter(
        Reservation.room_id == data["room_id"],
        Reservation.start_time < end_time,
        Reservation.end_time > start_time
    ).all()

    # --- Step 5: Handle priority and log cancellations ---
    for r in existing_reservations:
        r_user = User.query.get(r.user_id)
        # Staff > student
        if user.role == "staff" and r_user.role == "student":
            # Log canceled student reservation
            canceled = CanceledReservation(
                canceled_id=str(uuid.uuid4()),
                reservation_id=r.reservation_id,
                room_id=r.room_id,
                user_id=r.user_id,
                start_time=r.start_time,
                end_time=r.end_time,
                canceled_by=user.user_id
            )
            db.session.add(canceled)
            # Remove student's conflicting booking
            db.session.delete(r)
        elif user.role == "student" and r_user.role == "staff":
            return jsonify({"error": "Room already booked by staff"}), 400
        else:
            return jsonify({"error": "Room already booked for this time"}), 400

    # --- Step 6: Create new reservation ---
    new_reservation = Reservation(
        reservation_id=str(uuid.uuid4()),
        reservation_date=datetime.strptime(data["reservation_date"], "%Y-%m-%d"),
        start_time=start_time,
        end_time=end_time,
        status="confirmed",
        user_id=user.user_id,
        room_id=data["room_id"]
    )

    db.session.add(new_reservation)
    db.session.commit()

    return jsonify({"message": "Reservation created successfully"})


# -----------------------------
# View All Reservations
# -----------------------------
@reservation_bp.route("/all", methods=["GET"])
def get_all_reservations():
    reservations = Reservation.query.all()
    result = []
    for r in reservations:
        result.append({
            "reservation_id": r.reservation_id,
            "room_id": r.room_id,
            "user_id": r.user_id,
            "start_time": r.start_time,
            "end_time": r.end_time
        })
    return jsonify(result)


# -----------------------------
# Cancel Reservation
# -----------------------------
@reservation_bp.route("/cancel/<reservation_id>", methods=["DELETE"])
def cancel_reservation(reservation_id):
    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return jsonify({"error": "Reservation not found"}), 404

    db.session.delete(reservation)
    db.session.commit()
    return jsonify({"message": "Reservation cancelled successfully"})


# -----------------------------
# Search Available Rooms
# -----------------------------
@reservation_bp.route("/available", methods=["GET"])
def search_available_rooms():
    date_str = request.args.get("reservation_date")
    start_time_str = request.args.get("start_time")
    end_time_str = request.args.get("end_time")

    if not date_str or not start_time_str or not end_time_str:
        return jsonify({"error": "Missing query parameters"}), 400

    start_time = datetime.strptime(start_time_str, "%Y-%m-%d %H:%M:%S")
    end_time = datetime.strptime(end_time_str, "%Y-%m-%d %H:%M:%S")

    all_rooms = Room.query.all()
    available_rooms = []

    for room in all_rooms:
        conflict = Reservation.query.filter(
            Reservation.room_id == room.room_id,
            Reservation.start_time < end_time,
            Reservation.end_time > start_time
        ).first()

        if not conflict:
            available_rooms.append({
                "room_id": room.room_id,
                "room_name": room.room_name,
                "capacity": room.capacity,
                "location": room.location
            })

    return jsonify({"available_rooms": available_rooms})


# -----------------------------
# View Canceled Reservations (for priority demo)
# -----------------------------
@reservation_bp.route("/canceled", methods=["GET"])
def get_canceled_reservations():
    canceled = CanceledReservation.query.all()
    result = []
    for c in canceled:
        result.append({
            "reservation_id": c.reservation_id,
            "room_id": c.room_id,
            "user_id": c.user_id,
            "start_time": c.start_time,
            "end_time": c.end_time,
            "canceled_by": c.canceled_by,
            "canceled_at": c.canceled_at
        })
    return jsonify(result)