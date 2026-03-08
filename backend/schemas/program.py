from datetime import datetime
from pydantic import BaseModel
from models.program import ProgramStatus, ProgramType


# MODULE 3: Distribution & Program Management
class ProgramCreate(BaseModel):
    """Create new agricultural intervention program"""
    program_code: str
    name: str
    description: str | None = None
    program_type: ProgramType = ProgramType.other
    start_date: datetime
    end_date: datetime | None = None
    budget: float | None = None
    currency: str = "USD"
    target_beneficiaries: int | None = None
    target_regions: str | None = None  # JSON string
    coordinator_name: str | None = None
    coordinator_contact: str | None = None
    implementing_agency: str | None = None
    notes: str | None = None


class ProgramUpdate(BaseModel):
    """Update program information"""
    name: str | None = None
    description: str | None = None
    program_type: ProgramType | None = None
    status: ProgramStatus | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    budget: float | None = None
    target_beneficiaries: int | None = None
    actual_beneficiaries: int | None = None
    target_regions: str | None = None
    coordinator_name: str | None = None
    coordinator_contact: str | None = None
    implementing_agency: str | None = None
    is_active: bool | None = None
    notes: str | None = None


class ProgramOut(BaseModel):
    id: int
    program_code: str
    name: str
    description: str | None
    program_type: ProgramType
    status: ProgramStatus
    start_date: datetime
    end_date: datetime | None
    budget: float | None
    currency: str | None
    target_beneficiaries: int | None
    actual_beneficiaries: int
    target_regions: str | None
    coordinator_name: str | None
    coordinator_contact: str | None
    implementing_agency: str | None
    is_active: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class ProgramSummary(BaseModel):
    """Summary statistics for a program"""
    program_id: int
    program_name: str
    total_distributions: int
    total_beneficiaries: int
    total_items_distributed: float
    budget_utilized: float | None
