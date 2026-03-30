from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# ---------------- USERS TABLE ----------------
class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text, nullable=False)
    google_location = db.Column(db.String(255))
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(15), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    role = db.Column(db.String(20), default='customer')
    is_active = db.Column(db.Boolean, default=True)
    is_super_admin = db.Column(db.Boolean, default=False)


    cars = db.relationship('Car', backref='user', lazy=True)

    def __repr__(self):
        return f"<User {self.name}>"

# ---------------- OTP VERIFICATION ----------------
class OTPVerification(db.Model):
    __tablename__ = 'otp_verification'

    otp_id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(15), nullable=False)
    otp_code = db.Column(db.String(6), nullable=False)
    expiry_time = db.Column(db.DateTime, nullable=False)
    verified = db.Column(db.Boolean, default=False)

# ---------------- CARS TABLE ----------------
class Car(db.Model):
    __tablename__ = 'cars'

    car_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    area = db.Column(db.String(100), nullable=False)
    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(30))
    registration_number = db.Column(db.String(20))
    car_photo = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ---------------- ADMINS TABLE ----------------
class Admin(db.Model):
    __tablename__ = 'admins'

    admin_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(15))
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='staff')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ---------------- PASSWORD RESET TABLE ----------------
class PasswordReset(db.Model):
    __tablename__ = 'password_resets'

    reset_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    token = db.Column(db.String(255), unique=True, nullable=False)
    expiry_time = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)

#----------------- SUBSCRIPTION TABLE ----------------
class Subscription(db.Model):
    __tablename__ = "subscriptions"

    subscription_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    subscription_type = db.Column(db.String(20), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    status = db.Column(db.String(20), default="active")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

#---------------- CAR SUBSCRIPTION TABLE ----------------
class CarSubscriptionMap(db.Model):
    __tablename__ = "car_subscription_map"

    id = db.Column(db.Integer, primary_key=True)
    subscription_id = db.Column(db.Integer, nullable=False)
    car_id = db.Column(db.Integer, nullable=False)
    wash_pattern = db.Column(db.String(20), nullable=False)
    alternate_group = db.Column(db.String(1))  # 'A' or 'B'

# ---------------- WASH ENTRY TABLE ----------------
class WashEntry(db.Model):
    __tablename__ = "wash_entries"

    wash_entry_id = db.Column(db.Integer, primary_key=True)

    # Which car this wash belongs to
    car_id = db.Column(
        db.Integer,
        db.ForeignKey('cars.car_id'),
        nullable=False
    )

    # Owner of the car
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.user_id'),
        nullable=False
    )

    # Which subscription generated this wash
    subscription_id = db.Column(
        db.Integer,
        db.ForeignKey('subscriptions.subscription_id'),
        nullable=False
    )

    # Scheduled wash date
    wash_date = db.Column(db.Date, nullable=False)

    # Job status
    status = db.Column(
        db.String(40),
        nullable=False,
        default="PENDING"
    )

    # Filled by washer
    washer_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)

    # Filled by supervisor
    supervisor_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)

    # If not washed
    not_washed_reason = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # structured not washed details
    not_washed_reason_code = db.Column(db.String(50), nullable=True)
    not_washed_note = db.Column(db.Text, nullable=True)
    proof_image = db.Column(db.String(255), nullable=True)


    # Relationships (for easy joins later)
    car = db.relationship("Car", backref="wash_entries")
    user = db.relationship("User", foreign_keys=[user_id])
    subscription = db.relationship("Subscription", backref="wash_entries")
