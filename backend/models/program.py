import enum
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, func
from config.database import Base


# MODULE 3: Distribution & Program Management
class ProgramStatus(str, enum.Enum):
    planned = "planned"
    active = "active"
    completed = "completed"
    suspended = "suspended"
    cancelled = "cancelled"


class ProgramType(str, enum.Enum):
    emergency_relief = "emergency_relief"
    seasonal_support = "seasonal_support"
    subsidy_program = "subsidy_program"
    disaster_recovery = "disaster_recovery"
    training_program = "training_program"
    equipment_distribution = "equipment_distribution"
    other = "other"


class Program(Base):
    """Government Agricultural Intervention Programs"""
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    program_code = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    program_type = Column(String, default=ProgramType.other.value)
    status = Column(String, default=ProgramStatus.planned.value)
    
    # Program Period
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Budget & Allocation
    budget = Column(Float, nullable=True)
    currency = Column(String, default="USD", nullable=True)
    target_beneficiaries = Column(Integer, nullable=True)
    actual_beneficiaries = Column(Integer, default=0)
    
    # Geographic Coverage
    target_regions = Column(Text, nullable=True)  # JSON array
    
    # Management
    coordinator_name = Column(String, nullable=True)
    coordinator_contact = Column(String, nullable=True)
    implementing_agency = Column(String, nullable=True)
    
    # Status tracking
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
