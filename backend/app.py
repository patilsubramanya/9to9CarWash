from datetime import datetime
from flask import Flask, jsonify, send_from_directory
import os
from flask_cors import CORS
from models import db, Admin, User
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.supervisor_routes import supervisor_bp
from routes.subscription_routes import subscription_bp, extend_wash_entries
from routes.washer_routes import washer_bp
from werkzeug.security import generate_password_hash
from apscheduler.schedulers.background import BackgroundScheduler


# Initialize background scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(func=extend_wash_entries, trigger="cron", hour=0, minute=0)  # Run every 24 hours
scheduler.start()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'supersecretkey_change_this'


# ---------------- DATABASE CONFIG ----------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)



# Register blueprints
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(subscription_bp, url_prefix='/subscription')
app.register_blueprint(supervisor_bp, url_prefix='/supervisor')
app.register_blueprint(washer_bp, url_prefix='/washer')


if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
    with app.app_context():
        extend_wash_entries()  # Extend wash entries for all active subscriptions on startup

with app.app_context():
    db.create_all()
        
    def seed_admins():
        existing = Admin.query.count()
        if existing == 0:
            admins = [
                {"username": "Shivdatta", "email": "shivdatta.sharma@gmail.com", "phone": "+917483742285", "password": "Shivdatta@1"},
            ]
            for a in admins:
                adm = Admin(
                    username=a["username"],
                    email=a["email"],
                    phone=a["phone"],
                    password_hash=generate_password_hash(a["password"]),
                    role="superadmin"
                )
                db.session.add(adm)
            db.session.commit()
            print("Seeded default admin accounts (4)")
        else:
            print(f"Admin table already has {existing} records")
    

    def seed_main_user_admin():
        existing = User.query.filter_by(role='admin').first()
        if not existing:
            admin_user = User(
                name="Raj",
                address="Bengaluru",
                google_location="",
                email="Raj@gmail.com",
                phone="7894561230",
                password_hash=generate_password_hash("Raj@1"),
                role="admin",
                is_verified=True,
                is_super_admin=True
            )
            db. session.add(admin_user)
            db.session.commit()
            print("Main admin user created in users table")
        else:
            print("Admin already exists in users table")
    

    def seed_staff_users():
    # from models import User
    # from werkzeug.security import generate_password_hash

        staff_accounts = [
            {
                "name": "Mohan",
                "email": "Mohan@gmail.com",
                "phone": "9696857412",
                "role": "supervisor"
            },
            {
                "name": "Appu",
                "email": "Appu@gmail.com",
                "phone": "7474859632",
                "role": "washer"
            }
        ]

        for s in staff_accounts:
            existing = User.query.filter_by(email=s["email"]).first()
            if not existing:
                user = User(
                    name=s["name"],
                    address="Office",
                    google_location="",
                    email=s["email"],
                    phone=s["phone"],
                    password_hash=generate_password_hash("Staff@1"),
                    role=s["role"],
                    is_verified=True
                )
                db.session.add(user)

        db.session.commit()
        print("Default supervisor & washer created")



    seed_admins()
    seed_main_user_admin()
    seed_staff_users()
    print(" All database tables created successfully!")

@app.route('/')
def home():
    return jsonify({"message": "9to9 Car Wash Backend Running "})

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

