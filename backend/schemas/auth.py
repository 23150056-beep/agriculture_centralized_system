from datetime import datetime
from pydantic import BaseModel, EmailStr
from models.user import UserRole, FarmerStatus


# MODULE 1: Farmer Registration & Eligibility Management
class UserRegister(BaseModel):
    email: str
    name: str
    password: str
    role: UserRole = UserRole.farmer
    phone: str | None = None
    address: str | None = None
    farmer_id_number: str | None = None
    farm_location: str | None = None
    farm_size: float | None = None
    crop_types: str | None = None


class FarmerProfileUpdate(BaseModel):
    """Update farmer profile and eligibility information"""
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    farmer_id_number: str | None = None
    farm_location: str | None = None
    farm_size: float | None = None
    farm_size_unit: str | None = None
    crop_types: str | None = None


class FarmerInsuranceUpdate(BaseModel):
    """Insurance validation"""
    has_insurance: bool
    insurance_provider: str | None = None
    insurance_policy_number: str | None = None
    insurance_expiry_date: datetime | None = None


class FarmerEligibilityUpdate(BaseModel):
    """Update farmer eligibility status (Admin/Officer only)"""
    eligibility_status: FarmerStatus
    documents_verified: bool = False
    profile_notes: str | None = None
    rejection_reason: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    phone: str | None
    address: str | None
    farmer_id_number: str | None = None
    farm_location: str | None = None
    farm_size: float | None = None
    eligibility_status: FarmerStatus | None = None
    has_insurance: bool | None = None
    insurance_validated: bool | None = None
    documents_verified: bool | None = None

    class Config:
        from_attributes = True

