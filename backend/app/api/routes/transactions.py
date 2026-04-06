from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.schemas.transaction import (
    PaginatedTransactions,
    TransactionCreate,
    TransactionFilter,
    TransactionOut,
    TransactionUpdate,
)
from app.services.transaction_service import (
    create_transaction,
    delete_transaction,
    get_transaction_by_id,
    get_transactions,
    update_transaction,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/", response_model=PaginatedTransactions)
def list_transactions(
    type: Optional[str] = Query(None, pattern=r"^(income|expense)$"),
    category: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("date", pattern=r"^(date|amount|category|created_at)$"),
    sort_order: str = Query("desc", pattern=r"^(asc|desc)$"),
    current_user: User = Depends(require_role("analyst", "admin")),
    db: Session = Depends(get_db),
):
    """
    List transactions with filtering, pagination, and sorting.
    Accessible by Analyst and Admin roles.
    """
    filters = TransactionFilter(
        type=type,
        category=category,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return get_transactions(db, filters)


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: str,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Fetch one transaction by id. Admin only."""
    txn = get_transaction_by_id(db, transaction_id)
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    return txn


@router.post("/", response_model=TransactionOut, status_code=201)
def add_transaction(
    data: TransactionCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Create a new financial transaction. Admin only."""
    return create_transaction(db, data, user_id=current_user.id)


@router.put("/{transaction_id}", response_model=TransactionOut)
def edit_transaction(
    transaction_id: str,
    data: TransactionUpdate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Update an existing transaction. Admin only."""
    return update_transaction(db, transaction_id, data)


@router.delete("/{transaction_id}")
def remove_transaction(
    transaction_id: str,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Delete a transaction. Admin only."""
    return delete_transaction(db, transaction_id)
