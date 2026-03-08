from datetime import datetime
from pydantic import BaseModel
from models.order import DistributionStatus


# MODULE 3: Distribution & Program Management (CORE)
class OrderCreate(BaseModel):
    """Create new distribution/release record"""
    buyer_id: int  # farmer_id (recipient)
    product_id: int  # supply/item being distributed
    quantity: float
    program_id: int | None = None
    distribution_location: str | None = None
    notes: str | None = None


class OrderUpdateStatus(BaseModel):
    """Update distribution status"""
    status: DistributionStatus
    distribution_date: datetime | None = None
    release_date: datetime | None = None
    notes: str | None = None


class DistributionRelease(BaseModel):
    """Record item release to farmer"""
    release_date: datetime
    distribution_location: str
    farmer_signature: str | None = None
    officer_signature: str | None = None
    verification_code: str | None = None
    notes: str | None = None


class OrderOut(BaseModel):
    id: int
    distribution_code: str
    buyer_id: int  # farmer_id
    product_id: int
    quantity: float
    unit: str | None
    program_id: int | None
    officer_id: int | None
    status: DistributionStatus
    distribution_date: datetime | None
    release_date: datetime | None
    total_price: float | None
    notes: str | None
    distribution_location: str | None
    verification_code: str | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class DistributionReport(BaseModel):
    """Distribution report summary"""
    total_distributions: int
    pending_distributions: int
    completed_distributions: int
    total_farmers_served: int
    total_items_distributed: float
    distributions_by_program: dict | None = None
    distributions_by_officer: dict | None = None

