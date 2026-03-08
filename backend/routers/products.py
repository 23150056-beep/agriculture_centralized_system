from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from config.database import get_db
from models.product import Product, SupplyStatus
from models.user import User, UserRole
from schemas.product import ProductCreate, ProductUpdate, ProductOut, StockAdjustment, StockSummary
from auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/products", tags=["Inventory & Stock Monitoring"])


# MODULE 2: Inventory & Stock Monitoring
@router.get("/", response_model=list[ProductOut])
def list_products(
    skip: int = 0,
    limit: int = 50,
    category: str | None = None,
    status: SupplyStatus | None = None,
    low_stock: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List intervention supplies with filtering options"""
    q = db.query(Product)
    
    if category:
        q = q.filter(Product.category == category)
    
    if status:
        q = q.filter(Product.status == status.value)
    
    if low_stock:
        q = q.filter(Product.current_stock <= Product.reorder_level)
    
    return q.offset(skip).limit(limit).all()


@router.get("/summary", response_model=StockSummary)
def get_stock_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get overall stock monitoring summary"""
    if user.role not in [UserRole.admin.value, UserRole.officer.value]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_items = db.query(func.count(Product.id)).scalar()
    low_stock_items = db.query(func.count(Product.id)).filter(
        Product.current_stock <= Product.reorder_level,
        Product.current_stock > 0
    ).scalar()
    out_of_stock_items = db.query(func.count(Product.id)).filter(Product.current_stock <= 0).scalar()
    expired_items = db.query(func.count(Product.id)).filter(
        Product.expiry_date < datetime.utcnow()
    ).scalar()
    
    # Calculate total value
    total_value = db.query(func.sum(Product.current_stock * Product.unit_cost)).filter(
        Product.unit_cost.isnot(None)
    ).scalar() or 0
    
    return StockSummary(
        total_items=total_items or 0,
        low_stock_items=low_stock_items or 0,
        out_of_stock_items=out_of_stock_items or 0,
        expired_items=expired_items or 0,
        total_value=total_value,
    )


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get supply/inventory item details"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductOut, status_code=201)
def create_product(
    data: ProductCreate,
    user: User = Depends(require_role(UserRole.officer, UserRole.admin)),
    db: Session = Depends(get_db),
):
    """Add new intervention supply to inventory (Officer/Admin only)"""
    # Set current_stock to initial_stock if not provided
    product_data = data.model_dump()
    if product_data.get("current_stock") is None:
        product_data["current_stock"] = product_data["initial_stock"]
    
    product = Product(
        **product_data,
        received_by=user.id,
        status=SupplyStatus.in_stock.value,
    )
    
    # Auto-update status based on stock level
    if product.current_stock <= 0:
        product.status = SupplyStatus.out_of_stock.value
    elif product.current_stock <= product.reorder_level:
        product.status = SupplyStatus.low_stock.value
    
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    data: ProductUpdate,
    user: User = Depends(require_role(UserRole.officer, UserRole.admin)),
    db: Session = Depends(get_db),
):
    """Update supply/inventory information"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(product, key, val)
    
    # Auto-update status based on stock level
    if product.current_stock <= 0:
        product.status = SupplyStatus.out_of_stock.value
    elif product.current_stock <= product.reorder_level:
        product.status = SupplyStatus.low_stock.value
    else:
        product.status = SupplyStatus.in_stock.value
    
    db.commit()
    db.refresh(product)
    return product


@router.post("/{product_id}/adjust-stock", response_model=ProductOut)
def adjust_stock(
    product_id: int,
    data: StockAdjustment,
    user: User = Depends(require_role(UserRole.officer, UserRole.admin)),
    db: Session = Depends(get_db),
):
    """Manual stock adjustment (incoming supplies or corrections)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Adjust stock
    product.current_stock += data.adjustment_quantity
    
    # Update notes
    adjustment_note = f"Stock adjusted by {data.adjustment_quantity} {product.unit}. Reason: {data.reason}"
    if data.notes:
        adjustment_note += f". Notes: {data.notes}"
    
    if product.notes:
        product.notes += f"\n{adjustment_note}"
    else:
        product.notes = adjustment_note
    
    # Auto-update status
    if product.current_stock <= 0:
        product.status = SupplyStatus.out_of_stock.value
    elif product.current_stock <= product.reorder_level:
        product.status = SupplyStatus.low_stock.value
    else:
        product.status = SupplyStatus.in_stock.value
    
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    user: User = Depends(require_role(UserRole.admin)),
    db: Session = Depends(get_db),
):
    """Delete supply/inventory item (Admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
