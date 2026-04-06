from datetime import date as Date
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    amount: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    type: str = Field(..., pattern=r"^(income|expense)$")
    category: str = Field(..., min_length=1, max_length=100)
    date: Date
    notes: Optional[str] = Field(None, max_length=500)


class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0, max_digits=12, decimal_places=2)
    type: Optional[str] = Field(None, pattern=r"^(income|expense)$")
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    date: Optional[Date] = None
    notes: Optional[str] = Field(None, max_length=500)


class TransactionOut(BaseModel):
    id: str
    user_id: str
    amount: Decimal
    type: str
    category: str
    date: Date
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionFilter(BaseModel):
    """Query parameters for filtering transactions."""
    type: Optional[str] = Field(None, pattern=r"^(income|expense)$")
    category: Optional[str] = None
    date_from: Optional[Date] = None
    date_to: Optional[Date] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: str = Field("date", pattern=r"^(date|amount|category|created_at)$")
    sort_order: str = Field("desc", pattern=r"^(asc|desc)$")


class PaginatedTransactions(BaseModel):
    items: list[TransactionOut]
    total: int
    page: int
    page_size: int
    total_pages: int
