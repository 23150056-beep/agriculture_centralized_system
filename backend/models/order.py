import enum
from sqlalchemy import Column, Integer, Float, String, Text, ForeignKey, Enum as SAEnum, DateTime, func
from sqlalchemy.orm import relationship
from config.database import Base


# MODULE 3: Distribution & Program Management (CORE)
class DistributionStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    released = "released"
    completed = "completed"
    cancelled = "cancelled"


class Order(Base):
    """Renamed to track Distribution/Release transactions to farmers"""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    distribution_code = Column(String, unique=True, nullable=False, index=True)
    
    # Farmer Recipient (renamed from buyer)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # farmer_id
    
    # Item Being Distributed (intervention supply)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=True)
    
    # Program Association
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=True)
    
    # Distribution Officer
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Transaction Details
    status = Column(String, default=DistributionStatus.pending.value)
    distribution_date = Column(DateTime(timezone=True), nullable=True)
    release_date = Column(DateTime(timezone=True), nullable=True)  # When item was physically released
    
    # Tracking
    total_price = Column(Float, nullable=True)  # Optional: track value
    notes = Column(Text, nullable=True)
    farmer_signature = Column(String, nullable=True)  # Path to signature file
    officer_signature = Column(String, nullable=True)
    verification_code = Column(String, nullable=True)  # For verification
    
    # Location
    distribution_location = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    farmer = relationship("User", foreign_keys=[buyer_id], backref="distributions")
    product = relationship("Product", backref="distributions")
    program = relationship("Program", backref="distributions")
    officer = relationship("User", foreign_keys=[officer_id], backref="managed_distributions")
