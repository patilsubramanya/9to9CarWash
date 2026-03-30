from models import db, Subscription
from app import app
from datetime import datetime

with app.app_context():
    # Get subscription for user 4
    sub = Subscription.query.filter_by(user_id=4).first()
    
    if sub:
        print(f"Current Start Date: {sub.start_date}")
        # Change to January 1, 2026
        sub.start_date = datetime(2026, 1, 1).date()
        db.session.commit()
        print(f"Updated Start Date: {sub.start_date}")
        print(" Subscription date fixed!")
    else:
        print(" Subscription not found")


