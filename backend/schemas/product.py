from datetime import datetime
from pydantic import BaseModel
from models.product import SupplyCategory, SupplyStatus


# MODULE 2: Inventory & Stock Monitoring
class ProductCreate(BaseModel):
    """Create new intervention supply/inventory item"""
    name: str
    description: str | None = None
    category: SupplyCategory = SupplyCategory.other
    initial_stock: float
    current_stock: float | None = None  # Defaults to initial_stock
    reorder_level: float = 0
    unit: str = "kg"
    supplier_name: str | None = None
    batch_number: str | None = None
    manufacture_date: datetime | None = None
    expiry_date: datetime | None = None
    unit_cost: float | None = None
    storage_location: str | None = None
    notes: str | None = None


class ProductUpdate(BaseModel):
    """Update supply information"""
    name: str | None = None
    description: str | None = None
    category: SupplyCategory | None = None
    current_stock: float | None = None
    reorder_level: float | None = None
    unit: str | None = None
    status: SupplyStatus | None = None
    storage_location: str | None = None
    notes: str | None = None


class StockAdjustment(BaseModel):
    """Manual stock adjustment (incoming supplies or corrections)"""
    adjustment_quantity: float
    reason: str
    notes: str | None = None


class ProductOut(BaseModel):
    id: int
    name: str
    description: str | None
    category: SupplyCategory
    current_stock: float
    initial_stock: float
    reorder_level: float
    unit: str
    status: SupplyStatus
    supplier_name: str | None
    batch_number: str | None
    manufacture_date: datetime | None
    expiry_date: datetime | None
    unit_cost: float | None
    storage_location: str | None
    received_by: int | None
    notes: str | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class StockSummary(BaseModel):
    """Stock monitoring summary"""
    total_items: int
    low_stock_items: int
    out_of_stock_items: int
    expired_items: int
    total_value: float | None

