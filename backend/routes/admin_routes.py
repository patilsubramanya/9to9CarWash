# # backend/routes/admin_routes.py
# from flask import Blueprint, request, jsonify, current_app
# from models import db, Admin, User, Car
# from werkzeug.security import check_password_hash
# import jwt
# from datetime import datetime, timedelta
# from utils import admin_token_required


# admin_bp = Blueprint('admin_bp', __name__)

# @admin_bp.route('/admin/login', methods=['POST'])
# def admin_login():
#     data = request.get_json()
#     username_or_email = data.get('username_or_email')
#     password = data.get('password')

#     if not username_or_email or not password:
#         return jsonify({"error": "Username/email and password are required"}), 400

#     admin = Admin.query.filter(
#         (Admin.username == username_or_email) | (Admin.email == username_or_email)
#     ).first()

#     if not admin:
#         return jsonify({"error": "Admin not found"}), 404

#     if not check_password_hash(admin.password_hash, password):
#         return jsonify({"error": "Incorrect password"}), 401

#     token = jwt.encode(
#         {
#             "admin_id": admin.admin_id,
#             "role": admin.role,
#             "exp": datetime.utcnow() + timedelta(hours=8)
#         },
#         current_app.config['SECRET_KEY'],
#         algorithm="HS256"
#     )

#     return jsonify({
#         "message": "Admin login successful",
#         "token": token,
#         "admin": {
#             "id": admin.admin_id,
#             "username": admin.username,
#             "email": admin.email,
#             "phone": admin.phone,
#             "role": admin.role
#         }
#     }), 200


# # List all users with phone and car name (make + model)
# @admin_bp.route('/admin/users', methods=['GET'])
# @admin_token_required
# def admin_list_users(admin_id):
#     # optional query param: ?q=name_to_search
#     q = request.args.get('q', None)

#     # Query users and join with cars (left join to include users without cars)
#     # Build a list of user entries: { user_id, name, phone, cars: [ "Make Model", ... ] }
#     users = []
#     if q:
#         user_rows = User.query.filter(User.name.ilike(f"%{q}%")).all()
#     else:
#         user_rows = User.query.all()

#     for u in user_rows:
#         car_rows = Car.query.filter_by(user_id=u.user_id).all()
#         car_names = []
#         for c in car_rows:
#             car_names.append(f"{c.make} {c.model}")
#         users.append({
#             "user_id": u.user_id,
#             "name": u.name,
#             "phone": u.phone,
#             "email": u.email,
#             "cars": car_names
#         })

#     return jsonify({"users": users}), 200







# backend/routes/admin_routes.py
from flask import Blueprint, request, jsonify, current_app
from models import db, Admin, User, Car
from werkzeug.security import check_password_hash
from sqlalchemy import or_
import jwt
from datetime import datetime, timedelta
from utils import admin_token_required

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
            "exp": datetime.utcnow() + timedelta(hours=8)
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
        user_rows = User.query.filter(User.name.ilike(f"%{q}%")).all()
    else:
        user_rows = User.query.all()

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
            "cars": car_names
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
            "email": user.email,
            "phone": user.phone,
        },
        "cars": car_list
    }), 200
