from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.product import Product, SupplyStatus
from middleware.audit import log_action

def deduct_stock(db: Session, product_id: int, quantity: float, user_id: int) -> Product:
    """Deduct stock from intervention supplies automatically when distribution is released."""
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    old_stock = product.current_stock
    
    if old_stock < quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient stock for product. Available: {old_stock}")
        
    # Deduct stock
    product.current_stock -= quantity
    
    # Update status based on reorder level
    if product.current_stock == 0:
        product.status = SupplyStatus.out_of_stock.value
    elif product.current_stock <= product.reorder_level:
        product.status = SupplyStatus.low_stock.value
    
    db.commit()
    db.refresh(product)
    
    log_action(
        db=db,
        user_id=user_id,
        action="deduct_stock",
        entity_type="product",
        entity_id=product.id,
        old_value={"current_stock": old_stock, "status": product.status},
        new_value={"current_stock": product.current_stock, "status": product.status},
        description=f"Stock deducted by {quantity} for distribution."
    )
    db.commit() # commit audit log
    
    return product

def adjust_stock(db: Session, product_id: int, quantity: float, user_id: int, reason: str = "") -> Product:
    """Manually adjust stock level (admin restocking). quantity can be positive or negative."""
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    old_stock = product.current_stock
    
    product.current_stock += quantity
    if product.current_stock < 0:
         product.current_stock = 0
         
    # Update status based on reorder level
    if product.current_stock == 0:
        product.status = SupplyStatus.out_of_stock.value
    elif product.current_stock <= product.reorder_level:
        product.status = SupplyStatus.low_stock.value
    else:
        product.status = SupplyStatus.in_stock.value
        
    db.commit()
    db.refresh(product)
    
    log_action(
        db=db,
        user_id=user_id,
        action="adjust_stock",
        entity_type="product",
        entity_id=product.id,
        old_value={"current_stock": old_stock},
        new_value={"current_stock": product.current_stock},
        description=f"Manual stock adjustment ({quantity}). Reason: {reason}"
    )
    db.commit()
    
    return product
