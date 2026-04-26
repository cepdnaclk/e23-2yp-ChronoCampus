from flask import Blueprint, request, jsonify
from models.schedule import Schedule
from app import db
from datetime import datetime

schedule_bp = Blueprint("schedule", __name__)

# CREATE schedule
@schedule_bp.route("/schedules", methods=["POST"])
def create_schedule():
    data = request.json

    try:
        start = datetime.strptime(data["start_time"], "%H:%M").time()
        end = datetime.strptime(data["end_time"], "%H:%M").time()

        if start >= end:
            return jsonify({"error": "start_time must be before end_time"}), 400

        schedule = Schedule(
            course_code=data["course_code"],
            course_name=data["course_name"],
            type=data["type"],
            date=datetime.strptime(data["date"], "%Y-%m-%d").date(),
            start_time=start,
            end_time=end,
            location=data["location"],
            lecturer_name=data["lecturer_name"]
        )

        db.session.add(schedule)
        db.session.commit()

        return jsonify({"message": "Schedule created"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# GET schedules by date
@schedule_bp.route("/schedules", methods=["GET"])
def get_schedules():
    date = request.args.get("date")

    if not date:
        return jsonify({"error": "Date parameter required"}), 400

    try:
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
    except:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    schedules = Schedule.query.filter_by(date=parsed_date)\
        .order_by(Schedule.start_time).all()

    return jsonify([s.to_dict() for s in schedules])


# UPDATE schedule
@schedule_bp.route("/schedules/<int:id>", methods=["PUT"])
def update_schedule(id):
    schedule = Schedule.query.get_or_404(id)
    data = request.json

    if "course_code" in data:
        schedule.course_code = data["course_code"]

    if "course_name" in data:
        schedule.course_name = data["course_name"]

    db.session.commit()

    return jsonify({"message": "Schedule updated"})


# DELETE schedule
@schedule_bp.route("/schedules/<int:id>", methods=["DELETE"])
def delete_schedule(id):
    schedule = Schedule.query.get_or_404(id)
    db.session.delete(schedule)
    db.session.commit()

    return jsonify({"message": "Schedule deleted"})
