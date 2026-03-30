from unittest import result
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from models import db, Subscription, CarSubscriptionMap, Car, WashEntry
from utils import verify_jwt, get_user_from_header
from calendar import monthrange

subscription_bp = Blueprint("subscription", __name__)

def generate_entries(subscription, start_date, end_date):
    mappings = CarSubscriptionMap.query.filter_by(
        subscription_id=subscription.subscription_id
    ).all()

    for mapping in mappings:
        current = start_date

        while current <= end_date:

            # Skip Sunday
            if current.weekday() == 6:
                current += timedelta(days=1)
                continue

            add_job = False

            # DAILY
            if mapping.wash_pattern == "daily":
                add_job = True

            # ALTERNATE
            elif mapping.wash_pattern == "alternate":
                days_since_start = (current - subscription.start_date).days
                is_even = days_since_start % 2 == 0
                # is_even = current.day % 2 == 0
                if (mapping.alternate_group == "A" and is_even) or \
                   (mapping.alternate_group == "B" and not is_even):
                    add_job = True

            # WEEKLY
            elif mapping.wash_pattern == "weekly":
                if current.weekday() == 0:
                    add_job = True

            if add_job:
                exists = WashEntry.query.filter_by(
                    car_id=mapping.car_id,
                    wash_date=current,
                    subscription_id=subscription.subscription_id
                ).first()

                if not exists:
                    db.session.add(WashEntry(
                        car_id=mapping.car_id,
                        user_id=subscription.user_id,
                        subscription_id=subscription.subscription_id,
                        wash_date=current,
                        status="PENDING"
                    ))

            current += timedelta(days=1)

    db.session.commit()

def generate_wash_entries(subscription, user_id):
    """
    Generate 30 days of wash jobs for a subscription
    """
    # from datetime import datetime, timedelta

    start_date = subscription.start_date
    # end_date = start_date + timedelta(days=30)
    last_day = monthrange(start_date.year, start_date.month)[1]
    first_month_end = datetime(start_date.year, start_date.month, last_day).date()

    next_month_start = first_month_end + timedelta(days=1)
    next_month_last_date = monthrange(next_month_start.year, next_month_start.month)[1]
    end_date = datetime(next_month_start.year, next_month_start.month, next_month_last_date).date()

    generate_entries(subscription, start_date, end_date)

    # mappings = CarSubscriptionMap.query.filter_by(
    #     subscription_id=subscription.subscription_id
    # ).all()

    # for mapping in mappings:
    #     current = start_date

    #     while current < end_date:

    #         # Skip Sundays
    #         if current.weekday() == 6:
    #             current += timedelta(days=1)
    #             continue

    #         add_job = False

    #         # DAILY
    #         if mapping.wash_pattern == "daily":
    #             add_job = True

    #         # ALTERNATE
    #         elif mapping.wash_pattern == "alternate":
    #             is_even = current.day % 2 == 0
    #             if (mapping.alternate_group == "A" and is_even) or \
    #                (mapping.alternate_group == "B" and not is_even):
    #                 add_job = True

    #         # WEEKLY (Monday)
    #         elif mapping.wash_pattern == "weekly":
    #             if current.weekday() == 0:
    #                 add_job = True

    #         if add_job:
    #             exists = WashEntry.query.filter_by(
    #                 car_id=mapping.car_id,
    #                 wash_date=current,
    #                 subscription_id=subscription.subscription_id
    #             ).first()

    #             if not exists:
    #                 job = WashEntry(
    #                     car_id=mapping.car_id,
    #                     user_id=user_id,
    #                     subscription_id=subscription.subscription_id,
    #                     wash_date=current,
    #                     status="PENDING"
    #                 )
    #                 db.session.add(job)

    #         current += timedelta(days=1)

    # db.session.commit()

def generate_wash_entries_from_date(subscription, start_date):
    # from datetime import timedelta

    # end_date = start_date + timedelta(days=30)
    #get last date of the current month of start date
    last_day = monthrange(start_date.year, start_date.month)[1]
    end_of_current_month = datetime(start_date.year, start_date.month, last_day).date()

    #get first date of next month
    next_month_start = (end_of_current_month + timedelta(days=1))
    next_month_last_date = monthrange(next_month_start.year, next_month_start.month)[1]
    end_date = datetime(next_month_start.year, next_month_start.month, next_month_last_date).date()


    generate_entries(subscription, start_date, end_date)

    # mappings = CarSubscriptionMap.query.filter_by(
    #     subscription_id=subscription.subscription_id
    # ).all()

    # for mapping in mappings:
    #     current = start_date

    #     while current < end_date:

    #         # Skip Sunday
    #         if current.weekday() == 6:
    #             current += timedelta(days=1)
    #             continue

    #         exists = WashEntry.query.filter_by(
    #             car_id=mapping.car_id,
    #             wash_date=current,
    #             subscription_id=subscription.subscription_id
    #         ).first()

    #         if not exists:
    #             db.session.add(WashEntry(
    #                 car_id=mapping.car_id,
    #                 user_id=subscription.user_id,
    #                 subscription_id=subscription.subscription_id,
    #                 wash_date=current,
    #                 status="PENDING"
    #             ))

    #         current += timedelta(days=1)

    # db.session.commit()

def extend_wash_entries():
    from datetime import datetime, timedelta
    from app import app

    with app.app_context():

        today = datetime.utcnow().date()

        active_subs = Subscription.query.filter_by(status="active").all()

        print("Cron running")

        for sub in active_subs:

            last_entry = db.session.query(WashEntry).filter_by(
                subscription_id=sub.subscription_id
            ).order_by(WashEntry.wash_date.desc()).first()

            if not last_entry:
                print(f"⚠️ No wash entries found for subscription {sub.subscription_id}")
                generate_wash_entries(sub, sub.user_id)
                continue
            print("checking subs", sub.subscription_id)
            print("last entry date", last_entry.wash_date)

            # 🔥 If only 5 days left → extend
            if (last_entry.wash_date - today).days <= 5:
            # if True:
                print(f"Extending wash entries for subscription {sub.subscription_id}")
                # generate_wash_entries_from_date(
                #     sub,
                #     last_entry.wash_date + timedelta(days=1)
                # )
                last_date = last_entry.wash_date

                # 🔹 move to next month
                if last_date.month == 12:
                    next_month = 1
                    next_year = last_date.year + 1
                else:
                    next_month = last_date.month + 1
                    next_year = last_date.year

                start_date = datetime(next_year, next_month, 1).date()

                generate_wash_entries_from_date(sub, start_date)


@subscription_bp.route("/create-or-update", methods=["POST"])
def create_or_update_subscription():
    data = request.json
    start_date = data.get("start_date")
    # Optional: client can send explicit per-car mappings
    car_mappings_payload = data.get("car_mappings")

    user = get_user_from_header()
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    user_id = user.user_id

    # Fetch user cars
    cars = Car.query.filter_by(user_id=user_id).all()
    car_count = len(cars)

    # Infer subscription_type from car_mappings_payload
    subscription_type = None
    if car_mappings_payload and isinstance(car_mappings_payload, list):
        # Count unique wash patterns to infer type
        patterns = set()
        groups = set()
        for entry in car_mappings_payload:
            pattern = entry.get("wash_pattern")
            if pattern:
                patterns.add(pattern)
            group = entry.get("alternate_group")
            if group:
                groups.add(group)
        
        # If all are daily → regular
        if patterns == {"daily"}:
            subscription_type = "regular"
        # If any are alternate → alternate (or occasional if some are weekly too)
        elif "alternate" in patterns or ("alternate" in patterns and "weekly" in patterns):
            if patterns == {"alternate"}:
                subscription_type = "alternate"
            else:
                subscription_type = "occasional"
        else:
            # Default to regular if unclear
            subscription_type = "regular"
    else:
        # Fallback: infer based on car count
        if car_count == 1:
            subscription_type = "regular"
        elif car_count == 2:
            subscription_type = "alternate"
        else:
            subscription_type = "occasional"

    # Validate subscription rules
    if subscription_type == "regular" and car_count < 1:
        return jsonify({"error": "Not allowed"}), 400
    if subscription_type == "alternate" and car_count < 2:
        return jsonify({"error": "Not allowed"}), 400
    if subscription_type == "occasional" and car_count < 3:
        return jsonify({"error": "Not allowed"}), 400

    # Cancel existing active subscription
    old_sub = Subscription.query.filter_by(
        user_id=user_id, status="active"
    ).first()
    if old_sub:
        WashEntry.query.filter(
            WashEntry.subscription_id == old_sub.subscription_id,
            WashEntry.wash_date >= datetime.utcnow().date(),
            WashEntry.status == "PENDING"
        ).delete(synchronize_session=False)
        old_sub.status = "cancelled"
        old_sub.end_date = datetime.utcnow().date()
        db.session.commit()
    
    # Create new subscription
    sub = Subscription(
        user_id=user_id,
        subscription_type=subscription_type,
        start_date=datetime.strptime(start_date, "%Y-%m-%d").date(),
        status="active"
    )
    db.session.add(sub)
    db.session.commit()

    # Assign cars
    # If frontend provided explicit per-car mappings, use them (strict mode)
    if car_mappings_payload and isinstance(car_mappings_payload, list):
        for entry in car_mappings_payload:
            try:
                cid = int(entry.get("car_id"))
            except Exception:
                continue
            # ensure car belongs to user
            car_obj = Car.query.filter_by(car_id=cid, user_id=user_id).first()
            if not car_obj:
                continue
            pattern = entry.get("wash_pattern") or "daily"
            group = entry.get("alternate_group")
            mapping = CarSubscriptionMap(
                subscription_id=sub.subscription_id,
                car_id=cid,
                wash_pattern=pattern,
                alternate_group=group
            )
            db.session.add(mapping)
    else:
        # fallback: existing behavior — assign based on subscription type and car index
        for idx, car in enumerate(cars):
            if subscription_type == "regular":
                pattern = "daily"
                group = None
            elif subscription_type == "alternate":
                pattern = "alternate"
                group = "A" if idx % 2 == 0 else "B"
            else:  # occasional
                if idx < 2:
                    pattern = "alternate"
                    group = "A" if idx % 2 == 0 else "B"
                else:
                    pattern = "weekly"
                    group = None

            mapping = CarSubscriptionMap(
                subscription_id=sub.subscription_id,
                car_id=car.car_id,
                wash_pattern=pattern,
                alternate_group=group
            )
            db.session.add(mapping)

    db.session.commit()
    generate_wash_entries(sub, user_id)


    return jsonify({
        "success": True,
        "subscription_id": sub.subscription_id
    })


@subscription_bp.route("/car-calendar", methods=["POST"])
def get_car_calendar():
    print("REQUEST JSON:", request.json)
    data = request.json
    car_id = data.get("car_id")
    month = data.get("month")
    print("MONTH RECEIVED:", month)

    user = get_user_from_header()
    if not user:
        print(" USER NOT FOUND FROM HEADER")
        return jsonify({"error": "Invalid token"}), 401

    print(f"✓ User authenticated: {user.user_id}")

    result = (
    db.session.query(CarSubscriptionMap, Subscription)
    .join(
        Subscription,
        CarSubscriptionMap.subscription_id == Subscription.subscription_id
    )
    .join(
        Car,
        CarSubscriptionMap.car_id == Car.car_id
    )
    .filter(
        Car.car_id == car_id,
        Car.user_id == user.user_id,
        Subscription.status == "active"
    )
    .order_by(Subscription.start_date.desc())
    .first()
)

    print("CAR ID:", car_id)
    print("USER ID:", user.user_id)
    print("QUERY RESULT:", result)

    if not result:
        print("❌ NO ACTIVE SUBSCRIPTION FOUND FOR THIS CAR")
        # Debug: Check if car exists
        car = Car.query.filter_by(car_id=car_id, user_id=user.user_id).first()
        if car:
            print(f"  ✓ Car exists (ID: {car_id})")
        else:
            print(f"  ❌ Car does not exist or doesn't belong to user")
        
        # Debug: Check if any subscriptions exist for user
        subs = Subscription.query.filter_by(user_id=user.user_id, status="active").all()
        print(f"  Active subscriptions for user: {len(subs)}")
        
        # Debug: Check if car subscription map exists
        mappings = CarSubscriptionMap.query.filter_by(car_id=car_id).all()
        print(f"  CarSubscriptionMap entries for car: {len(mappings)}")
        
        return jsonify({"scheduled_dates": []})

    mapping, subscription = result

    # Debug: show mapping details for this car
    print(f"MAPPING DEBUG: id={mapping.id}, car_id={mapping.car_id}, subscription_id={mapping.subscription_id}, wash_pattern={mapping.wash_pattern}, alternate_group={mapping.alternate_group}")
    # List all mappings for this subscription to verify per-car patterns
    other_mappings = CarSubscriptionMap.query.filter_by(subscription_id=subscription.subscription_id).all()
    print(f"Total mappings for subscription {subscription.subscription_id}: {len(other_mappings)}")
    for m in other_mappings:
        print(f"  mapping: id={m.id}, car_id={m.car_id}, wash_pattern={m.wash_pattern}, alternate_group={m.alternate_group}")

    year, month_num = map(int, month.split("-"))
    start = datetime(year, month_num, 1)
    end = (start + timedelta(days=32)).replace(day=1)
    print("START DATE:", start)
    print("END DATE:", end)
    print(f"SUBSCRIPTION START DATE: {subscription.start_date}")
    print(f"WASH PATTERN: {mapping.wash_pattern}, ALTERNATE GROUP: {mapping.alternate_group}")

    dates = []
    current = start

    while current <= end:
        if current.date() < subscription.start_date:
            current += timedelta(days=1)
            continue
        if current.weekday() == 6:
            current += timedelta(days=1)
            continue

    # DAILY
        if mapping.wash_pattern == "daily":
            # if current.weekday() != 6:  # skip Sunday only
            dates.append(current.date().isoformat())

    # ALTERNATE
        elif mapping.wash_pattern == "alternate":
            # if current.weekday() != 6:
            days_since_start = (current.date() - subscription.start_date).days
            is_even = days_since_start % 2 == 0
            # is_even = current.day % 2 == 0
            if (mapping.alternate_group == "A" and is_even) or \
                (mapping.alternate_group == "B" and not is_even):
                dates.append(current.date().isoformat())

    # WEEKLY
        elif mapping.wash_pattern == "weekly":
            if current.weekday() == 0:  # Monday
                dates.append(current.date().isoformat())

        current += timedelta(days=1)

    print(f"✓ Generated {len(dates)} scheduled dates")
        # ---------------- GET REAL WASH RESULTS ----------------
    today = datetime.utcnow().date()
    history_limit = today - timedelta(days=60)

    wash_rows = WashEntry.query.filter(
        WashEntry.car_id == car_id,
        WashEntry.wash_date >= history_limit,
        WashEntry.wash_date < end.date()
    ).all()

    washed_dates = []
    not_washed_dates = []
    details = {}

    for row in wash_rows:
        d = row.wash_date.isoformat()

        if row.status == "APPROVED_WASHED":
            washed_dates.append(d)

        elif row.status == "APPROVED_NOT_WASHED":
            not_washed_dates.append(d)
            details[d] = {
                "reason": row.not_washed_reason_code,
                # "note": row.note,
                "image": row.proof_image
            }

    return jsonify({
        "subscription_type": subscription.subscription_type,
        "wash_pattern": mapping.wash_pattern,
        "alternate_group": mapping.alternate_group,
        "start_date": subscription.start_date.isoformat(),
        "scheduled": dates,
        "washed": washed_dates,
        "not_washed": not_washed_dates,
        "details": details
    })

