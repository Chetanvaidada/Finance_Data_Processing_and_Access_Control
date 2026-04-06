from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.dashboard import (
    CategoryTotal,
    DashboardResponse,
    DashboardSummary,
    MonthlyTrend,
    RecentTransaction,
)
from app.services.dashboard_service import (
    get_category_totals,
    get_full_dashboard,
    get_monthly_trends,
    get_recent_transactions,
    get_summary,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get financial summary (income, expenses, balance). All authenticated users."""
    return get_summary(db)


@router.get("/trends", response_model=list[MonthlyTrend])
def dashboard_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get monthly income/expense trends. All authenticated users."""
    return get_monthly_trends(db)


@router.get("/categories", response_model=list[CategoryTotal])
def dashboard_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get category-wise totals. All authenticated users."""
    return get_category_totals(db)


@router.get("/recent", response_model=list[RecentTransaction])
def dashboard_recent(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get recent transactions. All authenticated users."""
    return get_recent_transactions(db)


@router.get("/", response_model=DashboardResponse)
def dashboard_full(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get full dashboard data in a single request. All authenticated users."""
    return get_full_dashboard(db)
