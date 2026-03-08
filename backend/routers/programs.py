from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from config.database import get_db
from models.program import Program, ProgramStatus
from models.order import Order
from models.user import User, UserRole
from schemas.program import ProgramCreate, ProgramUpdate, ProgramOut, ProgramSummary
from auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/programs", tags=["Program Management"])


# MODULE 3: Distribution & Program Management
@router.get("/", response_model=list[ProgramOut])
def list_programs(
    skip: int = 0,
    limit: int = 50,
    status: ProgramStatus | None = None,
    program_type: str | None = None,
    active_only: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all agricultural intervention programs"""
    q = db.query(Program)
    
    if status:
        q = q.filter(Program.status == status.value)
    
    if program_type:
        q = q.filter(Program.program_type == program_type)
    
    if active_only:
        q = q.filter(Program.is_active == True, Program.status == ProgramStatus.active.value)
    
    return q.offset(skip).limit(limit).all()


@router.get("/{program_id}", response_model=ProgramOut)
def get_program(
    program_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get program details"""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program


@router.get("/{program_id}/summary", response_model=ProgramSummary)
def get_program_summary(
    program_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get program statistics and summary"""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    # Get distribution statistics
    total_distributions = db.query(func.count(Order.id)).filter(Order.program_id == program_id).scalar() or 0
    
    total_beneficiaries = db.query(func.count(func.distinct(Order.buyer_id))).filter(
        Order.program_id == program_id
    ).scalar() or 0
    
    total_items = db.query(func.sum(Order.quantity)).filter(Order.program_id == program_id).scalar() or 0
    
    budget_utilized = db.query(func.sum(Order.total_price)).filter(Order.program_id == program_id).scalar() or 0
    
    return ProgramSummary(
        program_id=program.id,
        program_name=program.name,
        total_distributions=total_distributions,
        total_beneficiaries=total_beneficiaries,
        total_items_distributed=total_items,
        budget_utilized=budget_utilized,
    )


@router.post("/", response_model=ProgramOut, status_code=201)
def create_program(
    data: ProgramCreate,
    user: User = Depends(require_role(UserRole.admin, UserRole.officer)),
    db: Session = Depends(get_db),
):
    """Create new agricultural intervention program (Admin/Officer only)"""
    # Check if program_code is unique
    if db.query(Program).filter(Program.program_code == data.program_code).first():
        raise HTTPException(status_code=400, detail="Program code already exists")
    
    program = Program(**data.model_dump())
    db.add(program)
    db.commit()
    db.refresh(program)
    return program


@router.put("/{program_id}", response_model=ProgramOut)
def update_program(
    program_id: int,
    data: ProgramUpdate,
    user: User = Depends(require_role(UserRole.admin, UserRole.officer)),
    db: Session = Depends(get_db),
):
    """Update program information"""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(program, key, val)
    
    db.commit()
    db.refresh(program)
    return program


@router.delete("/{program_id}", status_code=204)
def delete_program(
    program_id: int,
    user: User = Depends(require_role(UserRole.admin)),
    db: Session = Depends(get_db),
):
    """Delete program (Admin only)"""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    # Check if program has distributions
    has_distributions = db.query(Order).filter(Order.program_id == program_id).first()
    if has_distributions:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete program with existing distributions. Set to inactive instead.",
        )
    
    db.delete(program)
    db.commit()
