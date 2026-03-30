import os
from flask import Blueprint, jsonify, request, current_app
from datetime import datetime
from models import WashEntry, Car, User, db
from utils import get_user_from_header
from werkzeug.utils import secure_filename
from timezone import ist_today
washer_bp = Blueprint("washer", __name__)


@washer_bp.route("/today-jobs", methods=["GET"])
def today_jobs():

    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    # Allow only washer
    if user.role != "washer":
        return jsonify({"error": "Washer access required"}), 403

    today = ist_today()

    jobs = (
        WashEntry.query
        .join(Car, Car.car_id == WashEntry.car_id)
        .join(User, User.user_id == WashEntry.user_id)
        .filter(
            WashEntry.wash_date == today,
            WashEntry.status == "PENDING"
        )
        .all()
    )

    result = []
    for j in jobs:
        result.append({
            "wash_entry_id": j.wash_entry_id,
            "customer_name": j.user.name,
            "phone": j.user.phone,
            "car": f"{j.car.make} {j.car.model}",
            "registration_number": j.car.registration_number,
            "area": j.car.area,
            "pincode": j.car.pincode
        })

    return jsonify({"jobs": result})

VALID_REASONS = {
    "CUSTOMER_DENIED": {"note_required": False},
    "CAR_NOT_AVAILABLE": {"note_required": False},
    "GATE_LOCKED": {"note_required": False},
    "NO_WATER": {"note_required": False},
    "BAD_WEATHER": {"note_required": False},
    "OTHER": {"note_required": True}
}
PHOTO_REQUIRED = {
    "CAR_NOT_AVAILABLE": True,
    "GATE_LOCKED": True,
    "NO_WATER": True,
    "CUSTOMER_DENIED": False,
    "BAD_WEATHER": False,
    "OTHER": False
}

@washer_bp.route("/update-status", methods=["POST"])
# def update_status():

#     user = get_user_from_header()
#     if not user:
#         return jsonify({"error": "Invalid token"}), 401

#     if user.role != "washer":
#         return jsonify({"error": "Washer access required"}), 403

#     data = request.json
#     wash_entry_id = data.get("wash_entry_id")
#     action = data.get("action")

#     job = WashEntry.query.get(wash_entry_id)
#     if not job:
#         return jsonify({"error": "Job not found"}), 404

#     if job.status != "PENDING":
#         return jsonify({"error": "Job already processed"}), 400

#     # WASHED
#     if action == "washed":
#         job.status = "WASHED_PENDING_APPROVAL"
#         job.washer_id = user.user_id
#         db.session.commit()
#         return jsonify({"message": "Marked as washed, waiting supervisor approval"})

#     # NOT WASHED
#     if action == "not_washed":
#         reason_code = data.get("reason_code")
#         note = data.get("note")

#         if reason_code not in VALID_REASONS:
#             return jsonify({"error": "Invalid reason"}), 400

#         if VALID_REASONS[reason_code]["note_required"] and not note:
#             return jsonify({"error": "Note required for this reason"}), 400

#         job.status = "NOT_WASHED_PENDING_APPROVAL"
#         job.washer_id = user.user_id
#         job.not_washed_reason_code = reason_code
#         job.not_washed_note = note

#         db.session.commit()
#         return jsonify({"message": "Marked as not washed, waiting supervisor approval"})

#     return jsonify({"error": "Invalid action"}), 400
def update_status():

    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    if user.role != "washer":
        return jsonify({"error": "Washer access required"}), 403

    # Support both JSON and form-data
    if request.content_type.startswith("application/json"):
        data = request.json
        wash_entry_id = data.get("wash_entry_id")
        action = data.get("action")
        reason_code = data.get("reason_code")
        note = data.get("note")
        file = None
    else:
        wash_entry_id = request.form.get("wash_entry_id")
        action = request.form.get("action")
        reason_code = request.form.get("reason_code")
        note = request.form.get("note")
        file = request.files.get("proof_image")

    job = WashEntry.query.get(wash_entry_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    if job.status != "PENDING":
        return jsonify({"error": "Job already processed"}), 400

    # ---------------- WASHED ----------------
    if action == "washed":
        job.status = "WASHED_PENDING_APPROVAL"
        job.washer_id = user.user_id
        db.session.commit()
        return jsonify({"message": "Marked as washed, waiting supervisor approval"})

    # ---------------- NOT WASHED ----------------
    if action == "not_washed":

        if reason_code not in VALID_REASONS:
            return jsonify({"error": "Invalid reason"}), 400

        # Note validation
        if VALID_REASONS[reason_code]["note_required"] and not note:
            return jsonify({"error": "Note required for this reason"}), 400

        # Photo validation
        if PHOTO_REQUIRED.get(reason_code) and not file:
            return jsonify({"error": "Photo proof required for this reason"}), 400

        image_path = None

        # Save photo if provided
        if file:
            filename = secure_filename(file.filename)
            unique_name = f"{wash_entry_id}_{int(datetime.now().timestamp())}_{filename}"
            save_path = os.path.join("uploads", "not_washed", unique_name)
            file.save(save_path)
            image_path = f"uploads/not_washed/{unique_name}"

        job.status = "NOT_WASHED_PENDING_APPROVAL"
        job.washer_id = user.user_id
        job.not_washed_reason_code = reason_code
        job.not_washed_note = note
        job.proof_image = image_path 

        db.session.commit()

        return jsonify({"message": "Marked as not washed, waiting supervisor approval"})

    return jsonify({"error": "Invalid action"}), 400