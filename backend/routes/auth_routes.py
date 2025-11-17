from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random, secrets, string
import jwt
from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, OTPVerification, PasswordReset, Car
from utils import verify_jwt


auth_bp = Blueprint('auth_bp', __name__)

# (OPTIONAL) Twilio Setup - replace with your credentials
# from twilio.rest import Client
# account_sid = "YOUR_TWILIO_SID"
# auth_token = "YOUR_TWILIO_AUTH_TOKEN"
# twilio_phone = "+1234567890"
# client = Client(account_sid, auth_token)


#-----------------GREETINGS-----------------
@auth_bp.route('/me', methods=['POST'])
def get_profile():
    data = request.get_json()
    token = data.get("token")

    user = verify_jwt(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    return jsonify({
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone
    }), 200

# --------------- ADD CAR ------------------
@auth_bp.route('/add-car', methods=['POST'])
def add_car():
    data = request.get_json()

    token = data.get("token")
    user = verify_jwt(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    existing_car = Car.query.filter_by(
        user_id=user.user_id,
        registration_number=data.get("registration_number")
    ).first()

    if existing_car:
        return jsonify({"error": "A car with this registration number already exists."}), 409

    new_car = Car(
        user_id=user.user_id,
        pincode=data.get("pincode"),
        area=data.get("area"),
        make=data.get("make"),
        model=data.get("model"),
        color=data.get("color"),
        registration_number=data.get("registration_number"),
        car_photo=data.get("car_photo")
    )

    db.session.add(new_car)
    db.session.commit()

    return jsonify({"message": "Car added successfully"}), 201


@auth_bp.route('/my-cars', methods=['POST'])
def my_cars():
    data = request.get_json()
    token = data.get("token")

    user = verify_jwt(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    cars = Car.query.filter_by(user_id=user.user_id).all()

    car_list = [{
        "car_id": c.car_id,
        "make": c.make,
        "model": c.model,
        "color": c.color,
        "pincode": c.pincode,
        "area": c.area,
        "registration_number": c.registration_number,
        "car_photo": c.car_photo
    } for c in cars]

    return jsonify({"cars": car_list}), 200


# ---------------- SEND OTP ----------------
@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    phone = data.get('phone')

    if not phone:
        return jsonify({"error": "Phone number is required"}), 400

    otp = str(random.randint(100000, 999999))
    expiry_time = datetime.utcnow() + timedelta(minutes=5)

    # Save or update OTP record
    existing = OTPVerification.query.filter_by(phone=phone).first()
    if existing:
        existing.otp_code = otp
        existing.expiry_time = expiry_time
        existing.verified = False
    else:
        new_otp = OTPVerification(phone=phone, otp_code=otp, expiry_time=expiry_time)
        db.session.add(new_otp)

    db.session.commit()

    # Send OTP (here we'll just mock it)
    print(f" OTP for {phone} is {otp}")

    return jsonify({"message": "OTP sent successfully!"}), 200


# ---------------- VERIFY OTP ----------------
@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    phone = data.get('phone')
    otp_entered = data.get('otp')

    if not phone or not otp_entered:
        return jsonify({"error": "Phone and OTP are required"}), 400

    record = OTPVerification.query.filter_by(phone=phone).first()
    if not record:
        return jsonify({"error": "No OTP found for this number"}), 404

    if record.verified:
        return jsonify({"message": "Phone already verified"}), 200

    if datetime.utcnow() > record.expiry_time:
        return jsonify({"error": "OTP expired"}), 400

    if record.otp_code != otp_entered:
        return jsonify({"error": "Invalid OTP"}), 400

    record.verified = True
    db.session.commit()

    return jsonify({"message": "OTP verified successfully!"}), 200


# ---------------- REGISTER USER ----------------
@auth_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()

    name = data.get('name')
    address = data.get('address')
    google_location = data.get('google_location')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    password_hash = generate_password_hash(password)


    # Check OTP verification
    otp_record = OTPVerification.query.filter_by(phone=phone, verified=True).first()
    if not otp_record:
        return jsonify({"error": "Phone number not verified"}), 403

    # Check if user already exists
    if User.query.filter((User.email == email) | (User.phone == phone)).first():
        return jsonify({"error": "User already exists"}), 409

    # Create user
    new_user = User(
        name=name,
        address=address,
        google_location=google_location,
        email=email,
        phone=phone,
        password_hash=password_hash,
        is_verified=True
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201


# ---------------- LOGIN ----------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print('login reques', data)
    email_or_phone = data.get('email_or_phone')
    password = data.get('password')

    if not email_or_phone or not password:
        return jsonify({"error": "Email/Phone and password are required"}), 400

    # Check if user exists
    user = User.query.filter(
        (User.email == email_or_phone) | (User.phone == email_or_phone)
    ).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Incorrect password"}), 401
    
    token = jwt.encode(
    {
        "user_id": user.user_id,
        "exp": datetime.utcnow() + timedelta(hours=6)
    },
    current_app.config['SECRET_KEY'],
    algorithm="HS256"
)

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.user_id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone
        }
    }), 200


# ---------------- FORGOT PASSWORD ----------------
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email_or_phone = data.get('email_or_phone')

    if not email_or_phone:
        return jsonify({"error": "Email or phone is required"}), 400

    user = User.query.filter(
        (User.email == email_or_phone) | (User.phone == email_or_phone)
    ).first()

    if not user:
        return jsonify({"error": "No account found with that email/phone"}), 404

    # Generate a random secure token
    token = secrets.token_hex(16)
    expiry_time = datetime.utcnow() + timedelta(minutes=15)

    reset = PasswordReset(
        user_id=user.user_id,
        token=token,
        expiry_time=expiry_time,
        is_used=False
    )

    db.session.add(reset)
    db.session.commit()

    # For now, just print token (later can send via email/SMS)
    print(f"🔑 Password reset token for {email_or_phone}: {token}")

    return jsonify({"message": "Password reset token generated successfully!"}), 200


# ---------------- RESET PASSWORD ----------------
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required"}), 400

    reset_record = PasswordReset.query.filter_by(token=token, is_used=False).first()

    if not reset_record:
        return jsonify({"error": "Invalid or expired token"}), 400

    if datetime.utcnow() > reset_record.expiry_time:
        return jsonify({"error": "Reset token expired"}), 400

    user = User.query.get(reset_record.user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.password_hash = new_password
    reset_record.is_used = True
    db.session.commit()

    return jsonify({"message": "Password reset successful"}), 200