from flask import request, jsonify, current_app
import jwt
from functools import wraps
from models import User
from datetime import datetime

def admin_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth = request.headers['Authorization']
            parts = auth.split(" ")
            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        
        user = verify_jwt(token)
        if not user:
            return jsonify({'error': 'Invalid token or user not found'}), 401
        
        if user.role != 'admin':
            return jsonify({'error': 'Admin role required'}), 403
        
        return f(user.user_id, *args, **kwargs)
    return decorated

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired, please login again'}), 401
        except Exception:
            return jsonify({'error': 'Invalid token'}), 401

        return f(current_user_id, *args, **kwargs)
    return decorated

def verify_jwt(token: str):
    """
    Decodes JWT, checks expiry, returns User object.
    Returns None if token invalid or user not found.
    """
    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )

        user_id = payload.get("user_id")
        if not user_id:
            return None

        # Return user from DB
        user = User.query.get(user_id)

        if not user or not user.is_active:
            return None
        
        return user

    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception as e:
        print("JWT Verify Error:", e)
        return None
def get_user_from_header():
    auth = request.headers.get("Authorization")
    if not auth:
        return None

    parts = auth.split(" ")
    if len(parts) != 2:
        return None

    token = parts[1]
    return verify_jwt(token)

