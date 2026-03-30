from flask import Blueprint, jsonify, request
from datetime import datetime
from models import db, WashEntry, Car, User
from utils import get_user_from_header
from sqlalchemy import or_
from timezone import ist_today

supervisor_bp = Blueprint("supervisor", __name__)


@supervisor_bp.route("/dashboard", methods=["GET"])
def supervisor_dashboard():

    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    # Allow only supervisor
    if user.role != "supervisor":
        return jsonify({"error": "Supervisor access required"}), 403

    today = ist_today()

    pending_for_wash = WashEntry.query.filter_by(
        wash_date=today,
        status="PENDING"
    ).count()

    pending_approval = WashEntry.query.filter(
        WashEntry.wash_date == today,
        WashEntry.status.in_([
            "WASHED_PENDING_APPROVAL",
            "NOT_WASHED_PENDING_APPROVAL"
        ])
    ).count()

    approved_washed = WashEntry.query.filter_by(
        wash_date=today,
        status="APPROVED_WASHED"
    ).count()

    approved_not_washed = WashEntry.query.filter_by(
        wash_date=today,
        status="APPROVED_NOT_WASHED"
    ).count()

    return jsonify({
        "pending_for_wash": pending_for_wash,
        "pending_approval": pending_approval,
        "approved_washed": approved_washed,
        "approved_not_washed": approved_not_washed
    })

@supervisor_bp.route("/pending-approvals", methods=["GET"])
def pending_approvals():

    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    if user.role != "supervisor":
        return jsonify({"error": "Supervisor access required"}), 403

    jobs = (
        WashEntry.query
        .join(Car, Car.car_id == WashEntry.car_id)
        .join(User, User.user_id == WashEntry.user_id)
        .filter(
            or_(
                WashEntry.status == "WASHED_PENDING_APPROVAL",
                WashEntry.status == "NOT_WASHED_PENDING_APPROVAL"
            )
        )
        .order_by(WashEntry.wash_date.asc())
        .all()
    )

    result = []
    for j in jobs:

        action = "washed" if j.status == "WASHED_PENDING_APPROVAL" else "not_washed"

        result.append({
            "wash_entry_id": j.wash_entry_id,
            "date": j.wash_date.isoformat(),
            "customer_name": j.user.name,
            "phone": j.user.phone,
            "car": f"{j.car.make} {j.car.model}",
            "registration_number": j.car.registration_number,
            "area": j.car.area,
            "action": action,
            "reason_code": j.not_washed_reason_code,
            "note": j.not_washed_note,
            "proof_image": j.proof_image
        })

    return jsonify({"pending_approvals": result})

@supervisor_bp.route("/decision", methods=["POST"])
def supervisor_decision():

    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    if user.role != "supervisor":
        return jsonify({"error": "Supervisor access required"}), 403

    data = request.json
    wash_entry_id = data.get("wash_entry_id")
    decision = data.get("decision")  # approve / reject

    job = WashEntry.query.get(wash_entry_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    if job.status not in ["WASHED_PENDING_APPROVAL", "NOT_WASHED_PENDING_APPROVAL"]:
        return jsonify({"error": "Job not awaiting approval"}), 400

    # APPROVE
    if decision == "approve":

        if job.status == "WASHED_PENDING_APPROVAL":
            job.status = "APPROVED_WASHED"

        elif job.status == "NOT_WASHED_PENDING_APPROVAL":
            job.status = "APPROVED_NOT_WASHED"

        job.supervisor_id = user.user_id
        db.session.commit()

        return jsonify({"message": "Decision approved"})

    # REJECT
    elif decision == "reject":

        job.status = "PENDING"
        job.supervisor_id = user.user_id

        # clear washer action so it can be redone
        job.washer_id = None
        job.not_washed_reason_code = None
        job.not_washed_note = None
        job.proof_image = None

        db.session.commit()

        return jsonify({"message": "Sent back for rewash"})

    return jsonify({"error": "Invalid decision"}), 400
