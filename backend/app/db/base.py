from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


# Import all models here so that Base has them registered
# before Alembic or create_all() is called.
from app.models.user import User  # noqa: F401, E402
from app.models.transaction import Transaction  # noqa: F401, E402
