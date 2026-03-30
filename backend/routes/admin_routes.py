# backend/routes/admin_routes.py
from flask import Blueprint, request, jsonify, current_app
from models import db, Admin, User, Car, Subscription, WashEntry
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import or_
import jwt
from datetime import datetime, timedelta, date
from utils import admin_token_required, get_user_from_header

admin_bp = Blueprint('admin_bp', __name__)


# ----------------- ADMIN LOGIN -----------------
@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username_or_email = data.get('username_or_email')
    password = data.get('password')

    if not username_or_email or not password:
        return jsonify({"error": "Username/email and password are required"}), 400

    admin = Admin.query.filter(
        or_(
            Admin.username == username_or_email,
            Admin.email == username_or_email
        )
    ).first()

    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    if not check_password_hash(admin.password_hash, password):
        return jsonify({"error": "Incorrect password"}), 401

    token = jwt.encode(
        {
            "admin_id": admin.admin_id,
            "role": admin.role,
            "exp": datetime.utcnow() + timedelta(days=90)
        },
        current_app.config['SECRET_KEY'],
        algorithm="HS256"
    )

    return jsonify({
        "message": "Admin login successful",
        "token": token,
        "admin": {
            "id": admin.admin_id,
            "username": admin.username,
            "email": admin.email,
            "phone": admin.phone,
            "role": admin.role
        }
    }), 200


# ----------------- LIST USERS -----------------
@admin_bp.route('/users', methods=['GET'])
@admin_token_required
def admin_list_users(admin_id):
    q = request.args.get('q', None)

    if q:
        user_rows = User.query.filter(User.role == "customer", User.name.ilike(f"%{q}%")).all()
    else:
        user_rows = User.query.filter_by(role="customer").all()

    users = []
    for u in user_rows:
        car_rows = Car.query.filter_by(user_id=u.user_id).all()
        car_names = [f"{c.color} {c.make} {c.model} {c.registration_number} " for c in car_rows]
        # car_list = [
        #     {
        #         "make": c.make,
        #         "model": c.model,
        #         "registration_number": c.registration_number,
        #         "color": c.color
        #     }
        #     for c in car_rows
        # ]

        users.append({
            "user_id": u.user_id,
            "name": u.name,
            "phone": u.phone,
            "email": u.email,
            "cars": car_names,
            "is_active": u.is_active
        })

    return jsonify({"users": users}), 200


# ----------------- GET USER CARS -----------------
@admin_bp.route('/admin/user/<int:user_id>/cars', methods=['GET'])
@admin_token_required
def get_user_cars(admin_id, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    cars = Car.query.filter_by(user_id=user_id).all()
    car_list = [
        {
            "car_id": c.car_id,
            "make": c.make,
            "model": c.model,
            "color": c.color,
            "registration_number": c.registration_number
        }
        for c in cars
    ]

    return jsonify({
        "user": {
            "name": user.name,
            # "email": user.email,
            "phone": user.phone,
            "cars": car_list,
        },
        "cars": car_list
    }), 200


# ----------------- ADMIN DASHBOARD -----------------
@admin_bp.route('/dashboard', methods=['GET'])
@admin_token_required
def admin_dashboard(admin_id):

    today = date.today()

    # ---- USERS ----
    total_customers = User.query.filter_by(role="customer").count()
    total_washers = User.query.filter_by(role="washer").count()
    total_supervisors = User.query.filter_by(role="supervisor").count()

    # ---- ACTIVE SUBSCRIPTIONS ----
    active_subscriptions = Subscription.query.filter_by(status="active").count()

    # ---- TODAY'S WASH ENTRIES ----
    today_entries = WashEntry.query.filter_by(wash_date=today).all()

    today_pending_wash = sum(1 for j in today_entries if j.status == "PENDING")

    today_pending_approval = sum(
        1 for j in today_entries
        if j.status in ["WASHED_PENDING_APPROVAL", "NOT_WASHED_PENDING_APPROVAL"]
    )

    today_approved_washed = sum(
        1 for j in today_entries
        if j.status == "APPROVED_WASHED"
    )

    today_approved_not_washed = sum(
        1 for j in today_entries
        if j.status == "APPROVED_NOT_WASHED"
    )

    today_total_jobs = len(today_entries)

    return jsonify({
        "total_customers": total_customers,
        "total_washers": total_washers,
        "total_supervisors": total_supervisors,
        "active_subscriptions": active_subscriptions,
        "today_pending_wash": today_pending_wash,
        "today_pending_approval": today_pending_approval,
        "today_approved_washed": today_approved_washed,
        "today_approved_not_washed": today_approved_not_washed,
        "today_total_jobs": today_total_jobs
    }), 200

#------------------ CREATE STAFF -----------------

@admin_bp.route('/create-staff', methods=['POST'])
@admin_token_required
def create_staff(admin_id):

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    role = data.get("role")

    if role not in ["washer", "supervisor"]:
        return jsonify({"error": "Invalid role"}), 400

    if User.query.filter((User.email == email) | (User.phone == phone)).first():
        return jsonify({"error": "User already exists"}), 409

    new_user = User(
        name=name,
        email=email,
        phone=phone,
        password_hash=generate_password_hash(password),
        address="Staff Account",
        google_location="N/A",
        is_verified=True,
        role=role,
        is_active=1
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": f"{role} created successfully"}), 201

#------------------ UPDATE USER STATUS (ACTIVE/INACTIVE) -----------------

@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@admin_token_required
def update_user_status(admin_id, user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role == "admin":
        return jsonify({"error": "Cannot modify admin"}), 403

    if user.user_id == admin_id:
        return jsonify({"error": "Cannot modify yourself"}), 403

    data = request.get_json()
    is_active = data.get("is_active")

    if isinstance(is_active, bool):
        is_active = 1 if is_active else 0
    if is_active not in [0, 1]:
        return jsonify({"error": "Invalid status"}), 400

    user.is_active = is_active
    db.session.commit()

    return jsonify({"message": "User status updated successfully"}), 200

#------------------ GET USER DETAIL -----------------

@admin_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user_detail(user_id):
    admin = get_user_from_header()
    if not admin or admin.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get Cars
    cars = Car.query.filter_by(user_id=user_id).all()

    cars_data = [
        {
            "car_id": c.car_id,
            "make": c.make,
            "model": c.model,
            "registration_number": c.registration_number,
            "area": c.area,
        }
        for c in cars
    ]

    # Get Active Subscription
    subscription = Subscription.query.filter_by(
        user_id=user_id,
        status="active"
    ).order_by(Subscription.start_date.desc()).first()

    subscription_data = None
    if subscription:
        subscription_data = {
            "subscription_id": subscription.subscription_id,
            "subscription_type": subscription.subscription_type,
            "start_date": str(subscription.start_date),
            "status": subscription.status,
        }

    # Get Recent Wash History (Last 60 days)
    from datetime import datetime, timedelta
    sixty_days_ago = datetime.utcnow().date() - timedelta(days=60)

    today = datetime.utcnow().date()
    washes = WashEntry.query.filter(
        WashEntry.user_id == user_id,
        WashEntry.wash_date >= sixty_days_ago,
        WashEntry.wash_date <= today
    ).order_by(WashEntry.wash_date.desc()).all()

    wash_data = [
        {
            "wash_date": str(w.wash_date),
            "car_id": w.car_id,
            "status": w.status,
            "reason_code": w.not_washed_reason_code,
            "note": w.not_washed_note,
            "proof_image": w.proof_image,
        }
        for w in washes
    ]

    return jsonify({
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "is_active": user.is_active,
        },
        "cars": cars_data,
        "subscription": subscription_data,
    })

#------------------- GET CAR CALENDAR -----------------

@admin_bp.route('/user/<int:user_id>/car/<int:car_id>/calendar', methods=['GET'])
@admin_token_required
def admin_car_calendar(admin_id, user_id, car_id):

    month = request.args.get("month")
    if not month:
        return jsonify({"error": "Month required"}), 400

    year, month_num = map(int, month.split("-"))
    start = datetime(year, month_num, 1)
    end = (start + timedelta(days=32)).replace(day=1)

    # Fetch wash entries for this car in that month
    # washes = (
    # db.session.query(WashEntry)
    # .join(Subscription, WashEntry.subscription_id == Subscription.subscription_id)
    # .filter(
    #     WashEntry.car_id == car_id,
    #     WashEntry.user_id == user_id,
    #     WashEntry.wash_date >= start.date(),
    #     WashEntry.wash_date < end.date(),
    #     WashEntry.wash_date >= Subscription.start_date,
    #     db.or_(
    #         Subscription.end_date == None,
    #         WashEntry.wash_date <= Subscription.end_date
    #     )
    # )
    # .all()
    # )
    # active_sub = Subscription.query.filter_by(
    # user_id=user_id,
    # status="active"
    # ).first()
    today = datetime.utcnow().date()
    
    active_sub = Subscription.query.filter(
        Subscription.user_id == user_id,
        Subscription.status == "active",
        db.or_(
            Subscription.end_date == None,
            Subscription.end_date >= today
        )
    ).first()

    if not active_sub:
        return jsonify({
            "scheduled": [],
            "washed": [],
            "not_washed": [],
            "pending": [],
            "pending_approval": [],
            "details": {}
        })

    washes = WashEntry.query.filter(
        WashEntry.car_id == car_id,
        WashEntry.subscription_id == active_sub.subscription_id,
        WashEntry.wash_date >= start.date(),
        WashEntry.wash_date < end.date()
    ).all()

    scheduled = []
    washed = []
    not_washed = []
    pending = []
    pending_approval = []
    details = {}

    today = datetime.utcnow().date()

    for row in washes:
        date_str = row.wash_date.isoformat()

        if row.status == "PENDING":
            if row.wash_date < today:
                scheduled.append(date_str)
            else:
                pending.append(date_str)

        elif row.status in ["WASHED_PENDING_APPROVAL", "NOT_WASHED_PENDING_APPROVAL"]:
            pending_approval.append(date_str)

        elif row.status == "APPROVED_WASHED":
            washed.append(date_str)

        elif row.status == "APPROVED_NOT_WASHED":
            not_washed.append(date_str)

        # Add detailed info
        details[date_str] = {
            "status": row.status,
            "reason_code": row.not_washed_reason_code,
            "note": row.not_washed_note,
            "proof_image": row.proof_image
        }
    car = Car.query.filter_by(car_id=car_id, user_id=user_id).first()

    car_info = None
    if car:
        car_info = {
            "make": car.make,
            "model": car.model,
            "registration_number": car.registration_number,
    }
    monthly_summary = {
    "total": len(washed) + len(not_washed) + len(pending) + len(pending_approval)+ len(scheduled),
    "washed": len(washed),
    "not_washed": len(not_washed),
    "pending": len(pending) + len(pending_approval),
    }

    return jsonify({
        "monthly_summary": monthly_summary,
        "car_info": car_info,
        "scheduled": scheduled,
        "washed": washed,
        "not_washed": not_washed,
        "pending": pending,
        "pending_approval": pending_approval,
        "details": details
    })

# ----------------- LIST STAFF -----------------
@admin_bp.route('/staff', methods=['GET'])
@admin_token_required
def admin_list_staff(admin_id):

    role = request.args.get("role")

    if role not in ["washer", "supervisor"]:
        return jsonify({"error": "Invalid role"}), 400

    staff_rows = User.query.filter_by(role=role).all()

    staff = []

    for u in staff_rows:
        staff.append({
            "user_id": u.user_id,
            "name": u.name,
            "phone": u.phone,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active
        })

    return jsonify({"staff": staff}), 200

# ----------------- LIST WASH ENTRIES BY STATUS -----------------

@admin_bp.route('/wash-entries', methods=['GET'])
@admin_token_required
def admin_list_wash_entries(admin_id):

    status = request.args.get("status")
    today = date.today()

    if not status:
        return jsonify({"error": "Status required"}), 400

    rows = (
        db.session.query(WashEntry, User, Car)
        .join(User, WashEntry.user_id == User.user_id)
        .join(Car, WashEntry.car_id == Car.car_id)
        .filter(WashEntry.wash_date == today)
    )
    #     .order_by(WashEntry.wash_date.desc())
    #     .all()
    # )
    if status == "PENDING_APPROVAL":
        rows = rows.filter(
            WashEntry.status.in_(["WASHED_PENDING_APPROVAL", "NOT_WASHED_PENDING_APPROVAL"])
        )
    else:
        rows = rows.filter(WashEntry.status == status)
    rows = rows.order_by(WashEntry.wash_date.desc()).all()

    data = []

    for wash, user, car in rows:
        data.append({
            "wash_entry_id": wash.wash_entry_id,
            "wash_date": str(wash.wash_date),
            "customer_name": user.name,
            "phone": user.phone,
            "car": f"{car.make} {car.model}",
            "registration_number": car.registration_number,
            "status": wash.status,
            "reason": wash.not_washed_reason_code,
            "proof_image": wash.proof_image,
            "note": wash.not_washed_note
        })

    return jsonify({"entries": data}), 200