import enum
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Enum as SAEnum, DateTime, func
from sqlalchemy.orm import relationship
from config.database import Base


# MODULE 2: Inventory & Stock Monitoring
class SupplyCategory(str, enum.Enum):
    seeds = "seeds"
    fertilizers = "fertilizers"
    pesticides = "pesticides"
    equipment = "equipment"
    livestock = "livestock"
    feeds = "feeds"
    irrigation = "irrigation"
    other = "other"


class SupplyStatus(str, enum.Enum):
    in_stock = "in_stock"
    low_stock = "low_stock"
    out_of_stock = "out_of_stock"
    expired = "expired"


class Product(Base):
    """Renamed to track government intervention supplies/inventory"""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String, default=SupplyCategory.other.value)
    
    # Stock Monitoring
    current_stock = Column(Float, nullable=False, default=0)
    initial_stock = Column(Float, nullable=False, default=0)
    reorder_level = Column(Float, nullable=False, default=0)  # Low stock alert threshold
    unit = Column(String, default="kg")
    status = Column(String, default=SupplyStatus.in_stock.value)
    
    # Supply Details
    supplier_name = Column(String, nullable=True)
    batch_number = Column(String, nullable=True, index=True)
    manufacture_date = Column(DateTime(timezone=True), nullable=True)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    
    # Pricing (optional - for tracking costs)
    unit_cost = Column(Float, nullable=True)
    
    # Tracking
    received_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # officer id
    storage_location = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    received_by_officer = relationship("User", foreign_keys=[received_by], backref="received_supplies")
