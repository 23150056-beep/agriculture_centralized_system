from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from config.database import get_db
from auth.dependencies import get_current_user
from models.user import User, FarmerStatus, UserRole
from models.product import Product, SupplyStatus
from models.order import Order, DistributionStatus
from models.program import Program

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
def get_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Main dashboard KPIs"""
    total_farmers = db.query(User).filter(
        User.role == UserRole.farmer.value).count()
    approved_farmers = db.query(User).filter(
        User.role == UserRole.farmer.value, User.eligibility_status == FarmerStatus.approved.value).count()

    total_products = db.query(Product).count()
    low_stock_products = db.query(Product).filter(
        Product.status == SupplyStatus.low_stock.value).count()
    out_of_stock_products = db.query(Product).filter(
        Product.status == SupplyStatus.out_of_stock.value).count()

    total_distributions = db.query(Order).count()
    completed_distributions = db.query(Order).filter(
        Order.status == DistributionStatus.completed.value).count()

    total_programs = db.query(Program).count()

    return {
        "farmers": {
            "total": total_farmers,
            "approved": approved_farmers,
            "pending": total_farmers - approved_farmers
        },
        "inventory": {
            "total_products": total_products,
            "low_stock": low_stock_products,
            "out_of_stock": out_of_stock_products
        },
        "distributions": {
            "total": total_distributions,
            "completed": completed_distributions,
            "pending": total_distributions - completed_distributions
        },
        "programs": {
            "total": total_programs
        }
    }


@router.get("/distributions/by-month")
def distributions_by_month(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Returns distribution counts grouped by month for past 12 months — for bar/line chart"""
    # SQLite uses strftime instead of date_format
    results = db.query(
        func.strftime("%Y-%m", Order.created_at).label("month"),
        func.count(Order.id).label("count")
    ).group_by("month").order_by("month").limit(12).all()

    return [{"month": r.month, "count": r.count} for r in results]


@router.get("/products/low-stock")
def low_stock_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """All products at or below reorder level, sorted by urgency"""
    products = db.query(Product).filter(
        Product.current_stock <= Product.reorder_level
    ).order_by(Product.current_stock.asc()).limit(10).all()

    return products


@router.get("/programs/{program_id}/summary")
def program_summary(program_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Per-program statistics for reporting"""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        return {"error": "Program not found"}

    distributions = db.query(Order).filter(
        Order.program_id == program_id).count()
    completed = db.query(Order).filter(Order.program_id == program_id,
                                       Order.status == DistributionStatus.completed.value).count()
    items_distributed = db.query(func.sum(Order.quantity)).filter(
        Order.program_id == program_id, Order.status == DistributionStatus.completed.value).scalar() or 0
    unique_farmers = db.query(func.count(func.distinct(Order.buyer_id))).filter(
        Order.program_id == program_id).scalar() or 0

    return {
        "program_id": program.id,
        "program_name": program.name,
        "total_distributions": distributions,
        "completed_distributions": completed,
        "total_items_distributed": items_distributed,
        "unique_farmers_served": unique_farmers
    }
