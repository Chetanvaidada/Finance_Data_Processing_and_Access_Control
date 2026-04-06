"""
Seed script — creates an initial admin user and sample transactions.
Run with: python -m app.db.seed
"""
import sys
import os
from datetime import date, timedelta
from decimal import Decimal
import random

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.session import SessionLocal
from app.db.base import Base
from app.db.session import engine
from app.core.security import hash_password
from app.models.user import User
from app.models.transaction import Transaction


CATEGORIES_INCOME = ["Salary", "Freelance", "Investments", "Rental Income", "Bonus"]
CATEGORIES_EXPENSE = [
    "Groceries", "Rent", "Utilities", "Transport", "Entertainment",
    "Healthcare", "Education", "Dining Out", "Shopping", "Insurance",
]


def seed_users(db):
    """Create default users for each role."""
    users_data = [
        {
            "email": "admin@zorvyn.com",
            "hashed_password": hash_password("admin123"),
            "full_name": "Admin User",
            "role": "admin",
        },
        {
            "email": "analyst@zorvyn.com",
            "hashed_password": hash_password("analyst123"),
            "full_name": "Analyst User",
            "role": "analyst",
        },
        {
            "email": "viewer@zorvyn.com",
            "hashed_password": hash_password("viewer123"),
            "full_name": "Viewer User",
            "role": "viewer",
        },
    ]

    created_users = []
    for user_data in users_data:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            print(f"  User '{user_data['email']}' already exists, skipping.")
            created_users.append(existing)
            continue

        user = User(**user_data)
        db.add(user)
        db.commit()
        db.refresh(user)
        created_users.append(user)
        print(f"  Created user: {user.email} (role: {user.role})")

    return created_users


def seed_transactions(db, admin_user):
    """Create sample transactions spanning the last 6 months."""
    existing_count = db.query(Transaction).count()
    if existing_count > 0:
        print(f"  {existing_count} transactions already exist, skipping seed.")
        return

    transactions = []
    today = date.today()

    for i in range(60):  # 60 sample transactions
        days_ago = random.randint(0, 180)
        txn_date = today - timedelta(days=days_ago)

        if random.random() < 0.4:
            # Income
            txn = Transaction(
                user_id=admin_user.id,
                amount=Decimal(str(round(random.uniform(500, 15000), 2))),
                type="income",
                category=random.choice(CATEGORIES_INCOME),
                date=txn_date,
                notes=f"Sample income transaction #{i + 1}",
            )
        else:
            # Expense
            txn = Transaction(
                user_id=admin_user.id,
                amount=Decimal(str(round(random.uniform(20, 3000), 2))),
                type="expense",
                category=random.choice(CATEGORIES_EXPENSE),
                date=txn_date,
                notes=f"Sample expense transaction #{i + 1}",
            )
        transactions.append(txn)

    db.add_all(transactions)
    db.commit()
    print(f"  Created {len(transactions)} sample transactions")


def main():
    print("=" * 50)
    print("  Zorvyn Financial — Database Seed")
    print("=" * 50)

    # Create tables
    print("\n[1/3] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("  Tables created.")

    db = SessionLocal()
    try:
        # Seed users
        print("\n[2/3] Seeding users...")
        users = seed_users(db)

        # Seed transactions (created by admin)
        admin = next((u for u in users if u.role == "admin"), None)
        print("\n[3/3] Seeding transactions...")
        if admin:
            seed_transactions(db, admin)

        print("\n" + "=" * 50)
        print("  Seed complete!")
        print("=" * 50)
        print("\n  Default credentials:")
        print("  Admin:   admin@zorvyn.com   / admin123")
        print("  Analyst: analyst@zorvyn.com / analyst123")
        print("  Viewer:  viewer@zorvyn.com  / viewer123")
        print()

    finally:
        db.close()


if __name__ == "__main__":
    main()
