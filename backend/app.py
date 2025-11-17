from flask import Flask, jsonify
from flask_cors import CORS
from models import db, Admin
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from werkzeug.security import generate_password_hash

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

with app.app_context():
    db.create_all()
        
    def seed_admins():
        existing = Admin.query.count()
        if existing == 0:
            admins = [
                {"username": "Shivdatta", "email": "shivdatta.sharma@gmail.com", "phone": "+917483742285", "password": "Shivdatta@1"},
                # {"username": "Raj", "email": "admin2@company.com", "phone": "+919900000002", "password": "Raj@2"},
                # {"username": "Naveen", "email": "admin3@company.com", "phone": "+919900000003", "password": "Naveen@3"},
                # {"username": "Sunil", "email": "admin4@company.com", "phone": "+919900000004", "password": "Sunil@4"},
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
    seed_admins()
    print(" All database tables created successfully!")

@app.route('/')
def home():
    return jsonify({"message": "9to9 Car Wash Backend Running "})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

