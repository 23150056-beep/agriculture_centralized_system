import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, Enum as SAEnum, DateTime, func
from config.database import Base


class UserRole(str, enum.Enum):
    farmer = "farmer"
    officer = "officer"  # Distribution officer
    admin = "admin"


class FarmerStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    inactive = "inactive"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.farmer.value, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # MODULE 1: Farmer Registration & Eligibility Fields
    farmer_id_number = Column(String, unique=True, nullable=True, index=True)  # Government-issued farmer ID
    farm_location = Column(String, nullable=True)
    farm_size = Column(Float, nullable=True)  # in hectares
    farm_size_unit = Column(String, default="hectares", nullable=True)
    crop_types = Column(Text, nullable=True)  # JSON or comma-separated
    eligibility_status = Column(String, default=FarmerStatus.pending.value, nullable=True)
    
    # Insurance Information
    has_insurance = Column(Boolean, default=False)
    insurance_provider = Column(String, nullable=True)
    insurance_policy_number = Column(String, nullable=True)
    insurance_expiry_date = Column(DateTime(timezone=True), nullable=True)
    insurance_validated = Column(Boolean, default=False)
    insurance_validated_at = Column(DateTime(timezone=True), nullable=True)
    insurance_validated_by = Column(Integer, nullable=True)  # officer user_id
    
    # File Systemization
    documents_verified = Column(Boolean, default=False)
    documents_path = Column(Text, nullable=True)  # JSON array of document paths
    profile_notes = Column(Text, nullable=True)
    approved_by = Column(Integer, nullable=True)  # officer/admin user_id
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
