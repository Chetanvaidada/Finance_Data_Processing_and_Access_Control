import math
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.transaction import (
    PaginatedTransactions,
    TransactionCreate,
    TransactionFilter,
    TransactionOut,
    TransactionUpdate,
)


def create_transaction(db: Session, data: TransactionCreate, user_id: str) -> Transaction:
    """Create a new financial transaction."""
    txn = Transaction(
        user_id=user_id,
        amount=data.amount,
        type=data.type,
        category=data.category,
        date=data.date,
        notes=data.notes,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


def get_transactions(db: Session, filters: TransactionFilter) -> PaginatedTransactions:
    """Fetch transactions with filtering, pagination, and sorting."""
    query = db.query(Transaction)

    # Apply filters
    if filters.type:
        query = query.filter(Transaction.type == filters.type)
    if filters.category:
        query = query.filter(Transaction.category.ilike(f"%{filters.category}%"))
    if filters.date_from:
        query = query.filter(Transaction.date >= filters.date_from)
    if filters.date_to:
        query = query.filter(Transaction.date <= filters.date_to)

    # Total count before pagination
    total = query.count()

    # Sorting
    sort_column = getattr(Transaction, filters.sort_by, Transaction.date)
    order_func = desc if filters.sort_order == "desc" else asc
    query = query.order_by(order_func(sort_column))

    # Pagination
    offset = (filters.page - 1) * filters.page_size
    items = query.offset(offset).limit(filters.page_size).all()

    return PaginatedTransactions(
        items=[TransactionOut.model_validate(item) for item in items],
        total=total,
        page=filters.page,
        page_size=filters.page_size,
        total_pages=math.ceil(total / filters.page_size) if total > 0 else 0,
    )


def get_transaction_by_id(db: Session, transaction_id: str) -> Optional[Transaction]:
    """Fetch a single transaction by ID."""
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()


def update_transaction(db: Session, transaction_id: str, data: TransactionUpdate) -> Transaction:
    """Update an existing transaction."""
    txn = get_transaction_by_id(db, transaction_id)
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(txn, key, value)

    db.commit()
    db.refresh(txn)
    return txn


def delete_transaction(db: Session, transaction_id: str) -> dict:
    """Delete a transaction by ID."""
    txn = get_transaction_by_id(db, transaction_id)
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    db.delete(txn)
    db.commit()
    return {"detail": "Transaction deleted successfully"}
