from decimal import Decimal

from sqlalchemy import case, extract, func
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.dashboard import (
    CategoryTotal,
    DashboardResponse,
    DashboardSummary,
    MonthlyTrend,
    RecentTransaction,
)


def get_summary(db: Session) -> DashboardSummary:
    """Calculate total income, total expenses, and net balance."""
    result = db.query(
        func.coalesce(
            func.sum(case((Transaction.type == "income", Transaction.amount), else_=0)), 0
        ).label("total_income"),
        func.coalesce(
            func.sum(case((Transaction.type == "expense", Transaction.amount), else_=0)), 0
        ).label("total_expenses"),
        func.count(Transaction.id).label("total_transactions"),
    ).first()

    total_income = Decimal(str(result.total_income))
    total_expenses = Decimal(str(result.total_expenses))

    return DashboardSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=total_income - total_expenses,
        total_transactions=result.total_transactions,
    )


def get_category_totals(db: Session) -> list[CategoryTotal]:
    """Get totals grouped by category and type."""
    results = (
        db.query(
            Transaction.category,
            Transaction.type,
            func.sum(Transaction.amount).label("total"),
            func.count(Transaction.id).label("count"),
        )
        .group_by(Transaction.category, Transaction.type)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return [
        CategoryTotal(
            category=row.category,
            type=row.type,
            total=Decimal(str(row.total)),
            count=row.count,
        )
        for row in results
    ]


def get_monthly_trends(db: Session) -> list[MonthlyTrend]:
    """Get income and expense totals grouped by month."""
    results = (
        db.query(
            extract("year", Transaction.date).label("year"),
            extract("month", Transaction.date).label("month"),
            func.coalesce(
                func.sum(case((Transaction.type == "income", Transaction.amount), else_=0)), 0
            ).label("income"),
            func.coalesce(
                func.sum(case((Transaction.type == "expense", Transaction.amount), else_=0)), 0
            ).label("expenses"),
        )
        .group_by(
            extract("year", Transaction.date),
            extract("month", Transaction.date),
        )
        .order_by(
            extract("year", Transaction.date),
            extract("month", Transaction.date),
        )
        .all()
    )

    return [
        MonthlyTrend(
            month=f"{int(row.year)}-{int(row.month):02d}",
            income=Decimal(str(row.income)),
            expenses=Decimal(str(row.expenses)),
            net=Decimal(str(row.income)) - Decimal(str(row.expenses)),
        )
        for row in results
    ]


def get_recent_transactions(db: Session, limit: int = 10) -> list[RecentTransaction]:
    """Get the N most recent transactions."""
    results = (
        db.query(Transaction)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .limit(limit)
        .all()
    )

    return [RecentTransaction.model_validate(txn) for txn in results]


def get_full_dashboard(db: Session) -> DashboardResponse:
    """Aggregate all dashboard data into a single response."""
    return DashboardResponse(
        summary=get_summary(db),
        category_totals=get_category_totals(db),
        monthly_trends=get_monthly_trends(db),
        recent_transactions=get_recent_transactions(db),
    )
