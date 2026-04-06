from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    net_balance: Decimal
    total_transactions: int


class CategoryTotal(BaseModel):
    category: str
    total: Decimal
    type: str
    count: int


class MonthlyTrend(BaseModel):
    month: str  # "YYYY-MM"
    income: Decimal
    expenses: Decimal
    net: Decimal


class RecentTransaction(BaseModel):
    id: str
    amount: Decimal
    type: str
    category: str
    date: date
    notes: Optional[str]

    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    category_totals: list[CategoryTotal]
    monthly_trends: list[MonthlyTrend]
    recent_transactions: list[RecentTransaction]
