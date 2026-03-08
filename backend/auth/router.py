from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from config.database import get_db
from models.user import User, UserRole, FarmerStatus
from schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserOut,
    FarmerProfileUpdate,
    FarmerInsuranceUpdate,
    FarmerEligibilityUpdate,
)
from auth.security import hash_password, verify_password
from auth.jwt import create_access_token
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """MODULE 1: Centralized farmer registration"""
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if farmer_id_number is unique
    if data.farmer_id_number:
        if db.query(User).filter(User.farmer_id_number == data.farmer_id_number).first():
            raise HTTPException(status_code=400, detail="Farmer ID number already registered")
    
    user = User(
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
        role=data.role,
        phone=data.phone,
        address=data.address,
        farmer_id_number=data.farmer_id_number,
        farm_location=data.farm_location,
        farm_size=data.farm_size,
        crop_types=data.crop_types,
        eligibility_status=FarmerStatus.pending.value if data.role == UserRole.farmer else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


# MODULE 1: Farmer Profile & Eligibility Management
@router.put("/farmers/{farmer_id}/profile", response_model=UserOut)
def update_farmer_profile(
    farmer_id: int,
    data: FarmerProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update farmer profiling information"""
    farmer = db.query(User).filter(User.id == farmer_id, User.role == UserRole.farmer.value).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    # Authorization: farmer can update own profile, or admin/officer can update any
    if current_user.id != farmer_id and current_user.role not in [UserRole.admin.value, UserRole.officer.value]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(farmer, key, value)
    
    db.commit()
    db.refresh(farmer)
    return farmer


@router.put("/farmers/{farmer_id}/insurance", response_model=UserOut)
def update_farmer_insurance(
    farmer_id: int,
    data: FarmerInsuranceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update and validate insurance information"""
    farmer = db.query(User).filter(User.id == farmer_id, User.role == UserRole.farmer.value).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    # Authorization
    if current_user.id != farmer_id and current_user.role not in [UserRole.admin.value, UserRole.officer.value]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    farmer.has_insurance = data.has_insurance
    farmer.insurance_provider = data.insurance_provider
    farmer.insurance_policy_number = data.insurance_policy_number
    farmer.insurance_expiry_date = data.insurance_expiry_date
    
    # Officers/admins can validate insurance
    if current_user.role in [UserRole.admin.value, UserRole.officer.value]:
        farmer.insurance_validated = True
        farmer.insurance_validated_at = datetime.now(timezone.utc)
        farmer.insurance_validated_by = current_user.id
    
    db.commit()
    db.refresh(farmer)
    return farmer


@router.put("/farmers/{farmer_id}/eligibility", response_model=UserOut)
def update_farmer_eligibility(
    farmer_id: int,
    data: FarmerEligibilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update farmer eligibility status (Admin/Officer only)"""
    if current_user.role not in [UserRole.admin.value, UserRole.officer.value]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    farmer = db.query(User).filter(User.id == farmer_id, User.role == UserRole.farmer.value).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    farmer.eligibility_status = data.eligibility_status.value
    farmer.documents_verified = data.documents_verified
    farmer.profile_notes = data.profile_notes
    farmer.approved_by = current_user.id
    farmer.approved_at = datetime.now(timezone.utc)
    
    if data.eligibility_status == FarmerStatus.rejected:
        farmer.rejection_reason = data.rejection_reason
    
    db.commit()
    db.refresh(farmer)
    return farmer


@router.get("/farmers", response_model=list[UserOut])
def list_farmers(
    status: FarmerStatus | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all farmers with optional status filter (Admin/Officer only)"""
    if current_user.role not in [UserRole.admin.value, UserRole.officer.value]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(User).filter(User.role == UserRole.farmer.value)
    if status:
        query = query.filter(User.eligibility_status == status.value)
    
    return query.all()


@router.get("/farmers/{farmer_id}", response_model=UserOut)
def get_farmer(
    farmer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get farmer details"""
    if current_user.role not in [UserRole.admin.value, UserRole.officer.value] and current_user.id != farmer_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    farmer = db.query(User).filter(User.id == farmer_id, User.role == UserRole.farmer.value).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    return farmer
