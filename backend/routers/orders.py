from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import secrets
from config.database import get_db
from models.order import Order, DistributionStatus
from models.product import Product, SupplyStatus
from models.user import User, UserRole, FarmerStatus
from schemas.order import OrderCreate, OrderUpdateStatus, OrderOut, DistributionRelease, DistributionReport
from auth.dependencies import get_current_user

router = APIRouter(prefix="/distributions", tags=["Distribution Management"])


# MODULE 3: Distribution & Program Management (CORE MODULE)
@router.get("/", response_model=list[OrderOut])
def list_distributions(
    skip: int = 0,
    limit: int = 50,
    status: DistributionStatus | None = None,
    program_id: int | None = None,
    farmer_id: int | None = None,
    officer_id: int | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List distributions with filtering options"""
    q = db.query(Order)
    
    # Role-based filtering
    if user.role == UserRole.farmer.value:
        # Farmers see only their distributions
        q = q.filter(Order.buyer_id == user.id)
    elif user.role == UserRole.officer.value:
        # Officers see distributions they manage
        q = q.filter(Order.officer_id == user.id)
    # Admins see all
    
    if status:
        q = q.filter(Order.status == status.value)
    
    if program_id:
        q = q.filter(Order.program_id == program_id)
    
    if farmer_id and user.role in [UserRole.admin.value, UserRole.officer.value]:
        q = q.filter(Order.buyer_id == farmer_id)
    
    if officer_id and user.role == UserRole.admin.value:
        q = q.filter(Order.officer_id == officer_id)
    
    return q.offset(skip).limit(limit).all()


@router.get("/report", response_model=DistributionReport)
def get_distribution_report(
    program_id: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate distribution report (Officer/Admin only)"""
    if user.role not in [UserRole.admin.value, UserRole.officer.value]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    q = db.query(Order)
    
    if program_id:
        q = q.filter(Order.program_id == program_id)
    
    if start_date:
        q = q.filter(Order.created_at >= start_date)
    
    if end_date:
        q = q.filter(Order.created_at <= end_date)
    
    total_distributions = q.count()
    pending_distributions = q.filter(Order.status == DistributionStatus.pending.value).count()
    completed_distributions = q.filter(Order.status == DistributionStatus.completed.value).count()
    total_farmers_served = db.query(func.count(func.distinct(Order.buyer_id))).filter(Order.id.in_([o.id for o in q.all()])).scalar() or 0
    total_items = q.with_entities(func.sum(Order.quantity)).scalar() or 0
    
    # Distributions by program
    distributions_by_program = {}
    if not program_id:
        program_stats = db.query(
            Order.program_id,
            func.count(Order.id)
        ).group_by(Order.program_id).all()
        distributions_by_program = {str(pid): count for pid, count in program_stats if pid}
    
    # Distributions by officer
    officer_stats = db.query(
        Order.officer_id,
        func.count(Order.id)
    ).group_by(Order.officer_id).all()
    distributions_by_officer = {str(oid): count for oid, count in officer_stats if oid}
    
    return DistributionReport(
        total_distributions=total_distributions,
        pending_distributions=pending_distributions,
        completed_distributions=completed_distributions,
        total_farmers_served=total_farmers_served,
        total_items_distributed=total_items,
        distributions_by_program=distributions_by_program if distributions_by_program else None,
        distributions_by_officer=distributions_by_officer if distributions_by_officer else None,
    )


@router.post("/", response_model=OrderOut, status_code=201)
def create_distribution(
    data: OrderCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create new distribution record (Officer/Admin only)"""
    if user.role not in [UserRole.admin.value, UserRole.officer.value]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Validate farmer eligibility
    farmer = db.query(User).filter(
        User.id == data.buyer_id,
        User.role == UserRole.farmer.value
    ).first()
    
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    if farmer.eligibility_status != FarmerStatus.approved.value:
        raise HTTPException(status_code=400, detail="Farmer is not eligible for distribution")
    
    # Validate product/supply availability
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if data.quantity > product.current_stock:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Generate distribution code
    distribution_code = f"DIST-{datetime.now().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
    
    # Create distribution
    order = Order(
        distribution_code=distribution_code,
        buyer_id=data.buyer_id,
        product_id=data.product_id,
        quantity=data.quantity,
        unit=product.unit,
        program_id=data.program_id,
        officer_id=user.id,
        status=DistributionStatus.pending.value,
        distribution_location=data.distribution_location,
        notes=data.notes,
    )
    
    # Auto stock deduction
    product.current_stock -= data.quantity

    # Auto-update product status after deduction
    if product.current_stock <= 0:
        product.status = SupplyStatus.out_of_stock.value
    elif product.current_stock <= product.reorder_level:
        product.status = SupplyStatus.low_stock.value
    else:
        product.status = SupplyStatus.in_stock.value

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.patch("/{distribution_id}/status", response_model=OrderOut)
def update_distribution_status(
    distribution_id: int,
    data: OrderUpdateStatus,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update distribution status"""
    order = db.query(Order).filter(Order.id == distribution_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Distribution not found")
    
    # Authorization check
    if user.role == UserRole.officer.value and order.officer_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    elif user.role == UserRole.farmer.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    order.status = data.status.value
    if data.distribution_date:
        order.distribution_date = data.distribution_date
    if data.release_date:
        order.release_date = data.release_date
    if data.notes:
        order.notes = data.notes
    
    db.commit()
    db.refresh(order)
    return order


@router.post("/{distribution_id}/release", response_model=OrderOut)
def release_distribution(
    distribution_id: int,
    data: DistributionRelease,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record item release to farmer (Officer/Admin only)"""
    if user.role not in [UserRole.admin.value, UserRole.officer.value]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    order = db.query(Order).filter(Order.id == distribution_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Distribution not found")
    
    # Update distribution
    order.status = DistributionStatus.released.value
    order.release_date = data.release_date
    order.distribution_location = data.distribution_location
    order.farmer_signature = data.farmer_signature
    order.officer_signature = data.officer_signature
    order.verification_code = data.verification_code or secrets.token_hex(4).upper()
    if data.notes:
        order.notes = data.notes
    
    db.commit()
    db.refresh(order)
    return order


@router.get("/{distribution_id}", response_model=OrderOut)
def get_distribution(
    distribution_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get distribution details"""
    order = db.query(Order).filter(Order.id == distribution_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Distribution not found")
    
    # Authorization check
    if user.role == UserRole.farmer.value and order.buyer_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    elif user.role == UserRole.officer.value and order.officer_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return order
