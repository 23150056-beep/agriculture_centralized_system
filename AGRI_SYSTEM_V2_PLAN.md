# Agricultural Intervention Distribution System — v2 Development Plan
> Capstone Project | FastAPI + React + MySQL/MariaDB  
> Use this file as your Copilot context. Keep it open in VS Code while coding each phase.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack Changes](#2-tech-stack-changes)
3. [Folder Structure](#3-folder-structure)
4. [Phase 1 — Foundation & Database Migration](#4-phase-1--foundation--database-migration)
5. [Phase 2 — Core Logic Upgrades](#5-phase-2--core-logic-upgrades)
6. [Phase 3 — Analytics & Reporting](#6-phase-3--analytics--reporting)
7. [Phase 4 — Testing & Polish](#7-phase-4--testing--polish)
8. [Data Models — Full Schema](#8-data-models--full-schema)
9. [API Endpoint Reference](#9-api-endpoint-reference)
10. [Frontend Pages & Components](#10-frontend-pages--components)
11. [Environment Variables](#11-environment-variables)
12. [Copilot Prompt Starters](#12-copilot-prompt-starters)

---

## 1. Project Overview

### System Name
Agricultural Intervention Distribution System (AIDS) — Version 2

### Purpose
A centralized government web platform for managing farmer eligibility, agricultural product inventory, and transparent distribution of interventions (seeds, fertilizers, pesticides, equipment) to registered beneficiaries.

### Stakeholders
| Role | Access Level | Responsibilities |
|------|-------------|-----------------|
| `farmer` | Read own data | View eligibility, distributions received |
| `officer` | Operational | Manage distributions, update stock, view farmers |
| `admin` | Full control | All operations, user management, system reports |

### Key Improvements from v1
- SQLite → MySQL/MariaDB with Alembic migrations
- Access token only → Access + Refresh token auth
- Manual stock → Automated stock deduction on distribution release
- No audit trail → Full audit log on all sensitive operations
- No file uploads → Farmer document upload system
- No analytics → Full analytics dashboard with Chart.js
- No tests → pytest suite targeting 80%+ service layer coverage
- No pagination → All listings paginated and searchable

---

## 2. Tech Stack Changes

### Backend
| Package | v1 | v2 | Reason |
|---------|----|----|--------|
| Database driver | sqlite | `PyMySQL` | MySQL/MariaDB support |
| Migrations | none | `alembic` | Schema versioning |
| File uploads | none | `python-multipart` | Farmer document uploads |
| Rate limiting | none | `slowapi` | Brute-force protection |
| Testing | none | `pytest`, `pytest-asyncio`, `httpx`, `factory-boy` | Test suite |
| Pydantic | v1 | `pydantic[email]` v2 | Stricter validation |

### `requirements.txt` (v2 complete)
```txt
fastapi
uvicorn[standard]
sqlalchemy
pymysql
alembic
pydantic[email]
python-jose[cryptography]
passlib[bcrypt]
python-multipart
python-dotenv
slowapi
pytest
pytest-asyncio
httpx
factory-boy
```

### Frontend
| Package | v1 | v2 | Reason |
|---------|----|----|--------|
| Charts | none | `chart.js`, `react-chartjs-2` | Analytics dashboard |
| Tables | none | `@tanstack/react-table` | Paginated/searchable tables |
| Forms | manual | `react-hook-form` | Validation + error handling |

### `package.json` additions
```json
"dependencies": {
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "@tanstack/react-table": "^8.10.0",
  "react-hook-form": "^7.47.0"
}
```

---

## 3. Folder Structure

```
Agricultural_centralized_sys/
│
├── backend/
│   ├── alembic/                        # NEW — migration files
│   │   ├── versions/
│   │   └── env.py
│   ├── auth/
│   │   ├── dependencies.py             # UPDATED — refresh token support
│   │   ├── jwt.py                      # UPDATED — access + refresh tokens
│   │   ├── router.py                   # UPDATED — /refresh endpoint added
│   │   └── security.py
│   ├── config/
│   │   ├── database.py                 # UPDATED — MySQL connection string
│   │   └── settings.py                 # UPDATED — env vars expanded
│   ├── middleware/
│   │   └── audit.py                    # NEW — audit log helper
│   ├── models/
│   │   ├── user.py                     # UPDATED — new fields
│   │   ├── product.py                  # UPDATED — new fields
│   │   ├── order.py                    # UPDATED — new fields
│   │   ├── program.py
│   │   ├── audit_log.py                # NEW
│   │   ├── farmer_document.py          # NEW
│   │   └── notification.py             # NEW
│   ├── routers/
│   │   ├── products.py                 # UPDATED — stock automation
│   │   ├── orders.py                   # UPDATED — stock deduction on release
│   │   ├── programs.py
│   │   ├── users.py                    # UPDATED — pagination + file upload
│   │   ├── analytics.py                # NEW
│   │   └── reports.py                  # NEW — CSV export
│   ├── schemas/
│   │   ├── auth.py                     # UPDATED — password policy
│   │   ├── product.py                  # UPDATED
│   │   ├── order.py                    # UPDATED
│   │   ├── audit_log.py                # NEW
│   │   └── analytics.py               # NEW
│   ├── services/
│   │   ├── eligibility_service.py      # NEW — extracted business logic
│   │   ├── stock_service.py            # NEW — automated stock logic
│   │   ├── distribution_service.py     # NEW — lifecycle management
│   │   └── report_service.py           # NEW — CSV generation
│   ├── tests/
│   │   ├── conftest.py                 # NEW — test DB setup
│   │   ├── test_auth.py                # NEW
│   │   ├── test_farmers.py             # NEW
│   │   ├── test_stock.py               # NEW
│   │   ├── test_distributions.py       # NEW
│   │   └── test_audit.py               # NEW
│   ├── uploads/                        # NEW — file storage (gitignored)
│   │   └── documents/
│   ├── main.py                         # UPDATED — rate limiter, new routers
│   └── create_test_users.py
│
├── agri_sys/                           # React frontend
│   └── src/
│       ├── components/
│       │   ├── Layout.jsx              # UPDATED — mobile nav
│       │   ├── ProtectedRoute.jsx
│       │   ├── DataTable.jsx           # NEW — TanStack paginated table
│       │   ├── StockBadge.jsx          # NEW — colored stock status
│       │   ├── AuditLogViewer.jsx      # NEW
│       │   └── DocumentUploader.jsx    # NEW
│       ├── pages/
│       │   ├── Dashboard.jsx           # UPDATED — live charts
│       │   ├── Farmers.jsx             # UPDATED — paginated table
│       │   ├── FarmerDetail.jsx        # UPDATED — docs upload
│       │   ├── Inventory.jsx           # UPDATED — stock alerts
│       │   ├── Distributions.jsx       # UPDATED
│       │   ├── Programs.jsx
│       │   ├── Analytics.jsx           # NEW — charts page
│       │   ├── Reports.jsx             # NEW — CSV exports
│       │   └── Login.jsx
│       ├── context/
│       │   └── AuthContext.jsx         # UPDATED — refresh token logic
│       └── services/
│           └── api.js                  # UPDATED — auto token refresh
│
├── docker-compose.yml                  # UPDATED — MySQL service added
├── .env                                # UPDATED — new variables
├── .env.example                        # NEW
└── AGRI_SYSTEM_V2_PLAN.md             # THIS FILE
```

---

## 4. Phase 1 — Foundation & Database Migration

### 4.1 MySQL Connection — `backend/config/database.py`
```python
# backend/config/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .settings import settings

# MySQL connection with utf8mb4 for full Unicode support (names, addresses)
SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    f"?charset=utf8mb4"
)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,       # reconnects dropped connections
    pool_recycle=3600,        # recycle connections every hour
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 4.2 Settings — `backend/config/settings.py`
```python
# backend/config/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DB_USER: str = "root"
    DB_PASSWORD: str = "password"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "agri_db"

    # JWT
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    APP_ENV: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    UPLOAD_DIR: str = "uploads/documents"
    MAX_UPLOAD_SIZE_MB: int = 5

    class Config:
        env_file = ".env"

settings = Settings()
```

### 4.3 Alembic Setup
```bash
# Run once in /backend directory
pip install alembic
alembic init alembic

# After editing alembic/env.py to import your models:
alembic revision --autogenerate -m "initial_schema_v2"
alembic upgrade head

# Every time you change a model:
alembic revision --autogenerate -m "describe_your_change"
alembic upgrade head
```

### 4.4 `alembic/env.py` key edit
```python
# In alembic/env.py — add these lines after imports
import sys
sys.path.insert(0, '/path/to/your/backend')

from config.database import Base
from models import user, product, order, program, audit_log, farmer_document, notification

target_metadata = Base.metadata
```

### 4.5 Refresh Token — `backend/auth/jwt.py`
```python
# backend/auth/jwt.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from config.settings import settings

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": expire, "type": "access"}, settings.SECRET_KEY, settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({**data, "exp": expire, "type": "refresh"}, settings.SECRET_KEY, settings.ALGORITHM)

def verify_token(token: str, token_type: str = "access") -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except JWTError:
        return None
```

### 4.6 Auth Router — add `/refresh` endpoint
```python
# Add to backend/auth/router.py

@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    payload = verify_token(refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    new_access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": new_access_token, "token_type": "bearer"}
```

### 4.7 Rate Limiting — `backend/main.py`
```python
# backend/main.py — add rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Agricultural Intervention System v2")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# In auth/router.py, add to login and register:
@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, ...):
    ...
```

### 4.8 Password Policy — `backend/schemas/auth.py`
```python
# backend/schemas/auth.py
from pydantic import BaseModel, field_validator
import re

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "farmer"

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        return v

    @field_validator("username")
    @classmethod
    def username_clean(cls, v):
        return v.strip()[:100]
```

---

## 5. Phase 2 — Core Logic Upgrades

### 5.1 Audit Log Model — `backend/models/audit_log.py`
```python
# backend/models/audit_log.py
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=True)
    action          = Column(String(50), nullable=False)   # e.g. "create", "update", "delete", "release", "approve"
    resource_type   = Column(String(50), nullable=False)   # e.g. "farmer", "product", "distribution"
    resource_id     = Column(Integer, nullable=True)
    old_value       = Column(Text, nullable=True)          # JSON string of before state
    new_value       = Column(Text, nullable=True)          # JSON string of after state
    ip_address      = Column(String(50), nullable=True)
    description     = Column(String(255), nullable=True)   # human-readable summary
    timestamp       = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="audit_logs")
```

### 5.2 Audit Helper — `backend/middleware/audit.py`
```python
# backend/middleware/audit.py
import json
from sqlalchemy.orm import Session
from models.audit_log import AuditLog

def log_action(
    db: Session,
    user_id: int,
    action: str,
    resource_type: str,
    resource_id: int = None,
    old_value: dict = None,
    new_value: dict = None,
    ip_address: str = None,
    description: str = None,
):
    """Call this after every sensitive create/update/delete/release operation."""
    entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        old_value=json.dumps(old_value) if old_value else None,
        new_value=json.dumps(new_value) if new_value else None,
        ip_address=ip_address,
        description=description,
    )
    db.add(entry)
    # Note: do NOT commit here — let the caller's transaction commit everything together

# Usage example in a router:
# log_action(db, current_user.id, "update", "farmer", farmer.id,
#            old_value={"eligibility": old_status}, new_value={"eligibility": new_status})
```

### 5.3 Stock Service — `backend/services/stock_service.py`
```python
# backend/services/stock_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.product import Product, StockStatus
from middleware.audit import log_action

def deduct_stock(db: Session, product_id: int, quantity: int, user_id: int) -> Product:
    """
    Atomically deduct stock when a distribution is released.
    Raises HTTPException if insufficient stock.
    Called inside the distribution release endpoint — within the same db transaction.
    """
    product = db.query(Product).filter(Product.id == product_id).with_for_update().first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock_quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {product.stock_quantity}, Requested: {quantity}"
        )

    old_qty = product.stock_quantity
    product.stock_quantity -= quantity
    product.total_distributed = (product.total_distributed or 0) + quantity

    # Update stock status based on new quantity
    if product.stock_quantity <= 0:
        product.stock_status = StockStatus.out_of_stock
    elif product.stock_quantity <= product.reorder_level:
        product.stock_status = StockStatus.low_stock
    else:
        product.stock_status = StockStatus.in_stock

    log_action(
        db, user_id, "stock_deduction", "product", product_id,
        old_value={"stock_quantity": old_qty, "status": old_qty},
        new_value={"stock_quantity": product.stock_quantity, "status": product.stock_status.value},
        description=f"Deducted {quantity} units via distribution release"
    )

    return product


def adjust_stock(db: Session, product_id: int, quantity: int, user_id: int, reason: str = "") -> Product:
    """Manually adjust stock level (admin restocking). quantity can be positive or negative."""
    product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    old_qty = product.stock_quantity
    product.stock_quantity += quantity
    if product.stock_quantity < 0:
        raise HTTPException(status_code=400, detail="Adjustment would result in negative stock")

    # Recalculate status
    if product.stock_quantity <= 0:
        product.stock_status = StockStatus.out_of_stock
    elif product.stock_quantity <= product.reorder_level:
        product.stock_status = StockStatus.low_stock
    else:
        product.stock_status = StockStatus.in_stock

    log_action(db, user_id, "stock_adjustment", "product", product_id,
               old_value={"stock_quantity": old_qty},
               new_value={"stock_quantity": product.stock_quantity},
               description=reason or f"Manual adjustment of {quantity:+d} units")
    return product
```

### 5.4 Distribution Release — `backend/routers/orders.py` key section
```python
# In orders.py — update the release/status-change endpoint

@router.patch("/{order_id}/release")
def release_distribution(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["officer", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Distribution not found")
    if order.status == "released":
        raise HTTPException(status_code=400, detail="Already released")

    try:
        # Deduct stock — this validates availability and updates product status
        deduct_stock(db, order.product_id, order.quantity, current_user.id)

        old_status = order.status
        order.status = "released"
        order.released_by = current_user.id
        order.released_at = datetime.utcnow()

        log_action(db, current_user.id, "release", "distribution", order.id,
                   old_value={"status": old_status},
                   new_value={"status": "released"},
                   description=f"Distribution released to farmer ID {order.farmer_id}")

        db.commit()
        db.refresh(order)
        return order

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Release failed: {str(e)}")
```

### 5.5 Farmer Document Model — `backend/models/farmer_document.py`
```python
# backend/models/farmer_document.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

class FarmerDocument(Base):
    __tablename__ = "farmer_documents"

    id            = Column(Integer, primary_key=True, index=True)
    farmer_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename      = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_path     = Column(String(500), nullable=False)
    file_type     = Column(String(50), nullable=False)   # "pdf", "jpg", "png"
    file_size_kb  = Column(Integer, nullable=True)
    uploaded_by   = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at   = Column(DateTime, default=datetime.utcnow)
    is_verified   = Column(Boolean, default=False)
    verified_by   = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at   = Column(DateTime, nullable=True)

    farmer   = relationship("User", foreign_keys=[farmer_id])
    uploader = relationship("User", foreign_keys=[uploaded_by])
```

### 5.6 File Upload Endpoint — `backend/routers/users.py`
```python
# Add to users.py

import os, uuid, shutil
from fastapi import UploadFile, File
from config.settings import settings

ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png"}
MAX_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

@router.post("/{farmer_id}/documents")
async def upload_farmer_document(
    farmer_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, and PNG files are allowed")

    # Read and check size
    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    # Save to disk
    ext = file.filename.rsplit(".", 1)[-1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    save_dir = os.path.join(settings.UPLOAD_DIR, str(farmer_id))
    os.makedirs(save_dir, exist_ok=True)
    save_path = os.path.join(save_dir, unique_name)

    with open(save_path, "wb") as f:
        f.write(contents)

    # Save record to DB
    doc = FarmerDocument(
        farmer_id=farmer_id,
        filename=unique_name,
        original_name=file.filename,
        file_path=save_path,
        file_type=ext,
        file_size_kb=len(contents) // 1024,
        uploaded_by=current_user.id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
```

---

## 6. Phase 3 — Analytics & Reporting

### 6.1 Analytics Router — `backend/routers/analytics.py`
```python
# backend/routers/analytics.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from config.database import get_db
from auth.dependencies import get_current_user
from models.user import User, EligibilityStatus
from models.product import Product, StockStatus
from models.order import Order
from models.program import Program

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def get_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Main dashboard KPIs"""
    return {
        "total_farmers": db.query(User).filter(User.role == "farmer").count(),
        "approved_farmers": db.query(User).filter(
            User.role == "farmer", User.eligibility_status == EligibilityStatus.approved
        ).count(),
        "pending_farmers": db.query(User).filter(
            User.role == "farmer", User.eligibility_status == EligibilityStatus.pending
        ).count(),
        "total_products": db.query(Product).count(),
        "low_stock_products": db.query(Product).filter(
            Product.stock_status == StockStatus.low_stock
        ).count(),
        "out_of_stock_products": db.query(Product).filter(
            Product.stock_status == StockStatus.out_of_stock
        ).count(),
        "total_distributions": db.query(Order).count(),
        "released_distributions": db.query(Order).filter(Order.status == "released").count(),
        "active_programs": db.query(Program).filter(Program.status == "active").count(),
    }

@router.get("/distributions/by-month")
def distributions_by_month(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Returns distribution counts grouped by month for past 12 months — for bar/line chart"""
    results = db.query(
        func.date_format(Order.created_at, "%Y-%m").label("month"),
        func.count(Order.id).label("count")
    ).group_by("month").order_by("month").limit(12).all()
    return [{"month": r.month, "count": r.count} for r in results]

@router.get("/products/low-stock")
def low_stock_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """All products at or below reorder level, sorted by urgency"""
    products = db.query(Product).filter(
        Product.stock_status.in_([StockStatus.low_stock, StockStatus.out_of_stock])
    ).order_by(Product.stock_quantity.asc()).all()
    return products

@router.get("/programs/{program_id}/summary")
def program_summary(program_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Per-program statistics for reporting"""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    distributions = db.query(Order).filter(Order.program_id == program_id).all()
    total_qty = sum(d.quantity for d in distributions)
    unique_farmers = len(set(d.farmer_id for d in distributions))

    return {
        "program": program,
        "total_distributions": len(distributions),
        "total_quantity_distributed": total_qty,
        "unique_farmers_reached": unique_farmers,
        "released_count": sum(1 for d in distributions if d.status == "released"),
    }
```

### 6.2 CSV Export — `backend/services/report_service.py`
```python
# backend/services/report_service.py
import csv, io
from sqlalchemy.orm import Session
from models.order import Order
from models.user import User
from models.product import Product

def generate_distributions_csv(
    db: Session,
    program_id: int = None,
    start_date: str = None,
    end_date: str = None
) -> str:
    """Returns CSV string of filtered distributions"""
    query = db.query(Order)
    if program_id:
        query = query.filter(Order.program_id == program_id)
    if start_date:
        query = query.filter(Order.created_at >= start_date)
    if end_date:
        query = query.filter(Order.created_at <= end_date)

    orders = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Distribution ID", "Distribution Code", "Farmer Name",
        "Product Name", "Quantity", "Status", "Created At", "Released At"
    ])

    for o in orders:
        farmer = db.query(User).filter(User.id == o.farmer_id).first()
        product = db.query(Product).filter(Product.id == o.product_id).first()
        writer.writerow([
            o.id, o.distribution_code,
            f"{farmer.first_name} {farmer.last_name}" if farmer else "N/A",
            product.name if product else "N/A",
            o.quantity, o.status,
            o.created_at.strftime("%Y-%m-%d") if o.created_at else "",
            o.released_at.strftime("%Y-%m-%d") if o.released_at else "",
        ])

    return output.getvalue()
```

### 6.3 CSV Export Endpoint — `backend/routers/reports.py`
```python
# backend/routers/reports.py
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
from config.database import get_db
from auth.dependencies import get_current_user
from services.report_service import generate_distributions_csv

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/distributions")
def export_distributions_csv(
    program_id: int = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    csv_data = generate_distributions_csv(db, program_id, start_date, end_date)
    return StreamingResponse(
        io.StringIO(csv_data),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=distributions_report.csv"}
    )
```

---

## 7. Phase 4 — Testing & Polish

### 7.1 Test Configuration — `backend/tests/conftest.py`
```python
# backend/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.database import Base, get_db
from main import app

# Use in-memory SQLite for tests (fast, isolated)
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def admin_token(client):
    client.post("/auth/register", json={
        "username": "admin", "email": "admin@test.com",
        "password": "admin1234", "role": "admin"
    })
    r = client.post("/auth/login", data={"username": "admin", "password": "admin1234"})
    return r.json()["access_token"]

@pytest.fixture
def farmer_token(client):
    client.post("/auth/register", json={
        "username": "farmer1", "email": "farmer@test.com",
        "password": "farmer1234", "role": "farmer"
    })
    r = client.post("/auth/login", data={"username": "farmer1", "password": "farmer1234"})
    return r.json()["access_token"]
```

### 7.2 Auth Tests — `backend/tests/test_auth.py`
```python
# backend/tests/test_auth.py

def test_register_success(client):
    r = client.post("/auth/register", json={
        "username": "newuser", "email": "new@test.com",
        "password": "secure123", "role": "farmer"
    })
    assert r.status_code == 200

def test_login_returns_token(client):
    client.post("/auth/register", json={
        "username": "u1", "email": "u1@t.com", "password": "pass1234", "role": "farmer"
    })
    r = client.post("/auth/login", data={"username": "u1", "password": "pass1234"})
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_login_wrong_password(client):
    client.post("/auth/register", json={
        "username": "u2", "email": "u2@t.com", "password": "correct1", "role": "farmer"
    })
    r = client.post("/auth/login", data={"username": "u2", "password": "wrongpass"})
    assert r.status_code == 401

def test_farmer_cannot_access_admin_route(client, farmer_token):
    r = client.get("/users/", headers={"Authorization": f"Bearer {farmer_token}"})
    assert r.status_code == 403

def test_weak_password_rejected(client):
    r = client.post("/auth/register", json={
        "username": "weak", "email": "w@t.com", "password": "abc", "role": "farmer"
    })
    assert r.status_code == 422  # Pydantic validation error
```

### 7.3 Stock Tests — `backend/tests/test_stock.py`
```python
# backend/tests/test_stock.py

def test_release_deducts_stock(client, admin_token):
    # Create product with 100 stock
    product_r = client.post("/products/", json={
        "name": "Rice Seeds", "category": "seeds",
        "stock_quantity": 100, "reorder_level": 10, "unit": "kg"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    product_id = product_r.json()["id"]

    # Create distribution for 30 units
    order_r = client.post("/orders/", json={
        "product_id": product_id, "farmer_id": 1,
        "quantity": 30, "status": "approved"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    order_id = order_r.json()["id"]

    # Release it
    client.patch(f"/orders/{order_id}/release",
                 headers={"Authorization": f"Bearer {admin_token}"})

    # Check stock is now 70
    p = client.get(f"/products/{product_id}",
                   headers={"Authorization": f"Bearer {admin_token}"}).json()
    assert p["stock_quantity"] == 70

def test_release_fails_on_insufficient_stock(client, admin_token):
    product_r = client.post("/products/", json={
        "name": "Fertilizer", "category": "fertilizers",
        "stock_quantity": 5, "reorder_level": 2, "unit": "bag"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    product_id = product_r.json()["id"]

    order_r = client.post("/orders/", json={
        "product_id": product_id, "farmer_id": 1, "quantity": 50
    }, headers={"Authorization": f"Bearer {admin_token}"})
    order_id = order_r.json()["id"]

    r = client.patch(f"/orders/{order_id}/release",
                     headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 400
    assert "Insufficient stock" in r.json()["detail"]

def test_low_stock_status_set_correctly(client, admin_token):
    product_r = client.post("/products/", json={
        "name": "Pesticide", "category": "pesticides",
        "stock_quantity": 12, "reorder_level": 10, "unit": "liter"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    product_id = product_r.json()["id"]

    # Distribute 3 — leaves 9, which is below reorder_level of 10
    order_r = client.post("/orders/", json={
        "product_id": product_id, "farmer_id": 1, "quantity": 3
    }, headers={"Authorization": f"Bearer {admin_token}"})
    client.patch(f"/orders/{order_r.json()['id']}/release",
                 headers={"Authorization": f"Bearer {admin_token}"})

    p = client.get(f"/products/{product_id}",
                   headers={"Authorization": f"Bearer {admin_token}"}).json()
    assert p["stock_status"] == "low_stock"
```

### 7.4 Pagination Pattern (all list endpoints)
```python
# Apply this pattern to ALL list endpoints in every router

@router.get("/")
def list_farmers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User).filter(User.role == "farmer")

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            User.first_name.ilike(search_term) |
            User.last_name.ilike(search_term) |
            User.email.ilike(search_term)
        )

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "items": items
    }
```

---

## 8. Data Models — Full Schema

### Updated `User` model fields
```python
# Additional fields to add to existing User model
refresh_token       = Column(String(500), nullable=True)      # hashed refresh token
last_login          = Column(DateTime, nullable=True)
failed_login_count  = Column(Integer, default=0)
is_locked           = Column(Boolean, default=False)
# Existing eligibility fields remain unchanged
```

### Updated `Product` model fields
```python
# Additional fields to add to existing Product model
total_distributed   = Column(Integer, default=0)              # running total of units released
last_restocked_at   = Column(DateTime, nullable=True)
# Ensure reorder_level exists and stock_status is enforced via service layer
```

### Updated `Order` model fields
```python
# Additional fields to add to existing Order model
released_by         = Column(Integer, ForeignKey("users.id"), nullable=True)
released_at         = Column(DateTime, nullable=True)
notes               = Column(Text, nullable=True)
cancellation_reason = Column(String(255), nullable=True)
```

### New `Notification` model
```python
# backend/models/notification.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from config.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    title       = Column(String(100), nullable=False)
    message     = Column(String(500), nullable=False)
    type        = Column(String(30), default="info")  # "info", "warning", "alert"
    is_read     = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.utcnow)
```

### Entity Relationship Summary
```
User (farmer) ──< FarmerDocument
User (farmer) ──< Order/Distribution >── Product
User (officer) ──< Order (released_by)
Program ──< Order/Distribution
Product ──< Order/Distribution
User ──< AuditLog
User ──< Notification
```

---

## 9. API Endpoint Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Register new user |
| POST | `/auth/login` | None | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | None | Exchange refresh token for new access token |
| GET | `/auth/me` | Required | Get current user profile |

### Farmers / Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/?page=&limit=&search=` | Officer/Admin | Paginated farmer list |
| GET | `/users/{id}` | Auth | Get farmer profile |
| PATCH | `/users/{id}/eligibility` | Officer/Admin | Update eligibility status |
| POST | `/users/{id}/documents` | Officer/Admin | Upload farmer document |
| GET | `/users/{id}/documents` | Auth | List farmer documents |

### Inventory / Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products/?page=&search=&status=` | Auth | Paginated product list |
| POST | `/products/` | Admin | Create product |
| PATCH | `/products/{id}` | Admin | Update product |
| POST | `/products/{id}/adjust-stock` | Admin | Manual stock adjustment |

### Distributions / Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders/?page=&program_id=&status=` | Auth | Paginated distribution list |
| POST | `/orders/` | Officer/Admin | Create distribution record |
| PATCH | `/orders/{id}/release` | Officer/Admin | Release + auto-deduct stock |
| PATCH | `/orders/{id}/cancel` | Admin | Cancel with reason |

### Programs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/programs/` | Auth | List programs |
| POST | `/programs/` | Admin | Create program |
| PATCH | `/programs/{id}` | Admin | Update program |

### Analytics (New)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/overview` | Officer/Admin | Dashboard KPIs |
| GET | `/analytics/distributions/by-month` | Officer/Admin | Monthly chart data |
| GET | `/analytics/products/low-stock` | Officer/Admin | Stock alerts list |
| GET | `/analytics/programs/{id}/summary` | Officer/Admin | Per-program stats |

### Reports (New)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reports/distributions` | Officer/Admin | CSV export with filters |

### Audit Log (New)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/audit/?resource_type=&user_id=&page=` | Admin | Paginated audit log |

---

## 10. Frontend Pages & Components

### Dashboard — `src/pages/Dashboard.jsx`
**Data:** Fetch from `GET /analytics/overview` on mount  
**Charts:**
- Donut chart — farmer eligibility status breakdown (approved/pending/rejected)
- Bar chart — distributions per month (last 12 months) from `/analytics/distributions/by-month`
- Metric cards — total farmers, active programs, released distributions, low-stock alerts
- Alert panel — products from `/analytics/products/low-stock`

### Farmer Detail — `src/pages/FarmerDetail.jsx`
**New section:** Document management  
- List existing documents with type badge, upload date, verified status
- File input for uploading new documents (PDF/JPG/PNG)
- Officer can mark documents as verified

### Inventory Page — `src/pages/Inventory.jsx`
**Updated:**
- `StockBadge` component shows colored badge (green = in stock, amber = low, red = out)
- Low-stock row highlighted in amber
- "Adjust Stock" modal for admin

### Analytics Page — `src/pages/Analytics.jsx` (New)
**Charts:**
- Bar chart — top 5 most distributed products
- Line chart — distributions over time
- Table — program budget utilization
- All using `react-chartjs-2`

### Frontend Auth Context — `src/context/AuthContext.jsx`
```jsx
// Key addition: auto-refresh on 401 response
// In api.js — add an Axios interceptor

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const { data } = await axios.post("/auth/refresh", { refresh_token: refreshToken });
        localStorage.setItem("token", data.access_token);
        error.config.headers["Authorization"] = `Bearer ${data.access_token}`;
        return api(error.config);
      } catch {
        // Refresh also failed — log out
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 11. Environment Variables

### `.env` (development)
```env
# Database
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agri_db

# JWT
SECRET_KEY=your_very_long_random_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# App
APP_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
UPLOAD_DIR=uploads/documents
MAX_UPLOAD_SIZE_MB=5
```

### `.env.example` (commit this, not `.env`)
```env
DB_USER=
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agri_db
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
APP_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
UPLOAD_DIR=uploads/documents
MAX_UPLOAD_SIZE_MB=5
```

### `.gitignore` additions
```
.env
uploads/
*.db
__pycache__/
.pytest_cache/
alembic/versions/*.py  # optional — keep if you want migration history tracked
```

### `docker-compose.yml` (updated with MySQL)
```yaml
version: "3.8"
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: agri_db
      MYSQL_USER: agri_user
      MYSQL_PASSWORD: agri_pass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    env_file:
      - .env
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./agri_sys
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

## 12. Copilot Prompt Starters

> Copy-paste these directly into GitHub Copilot Chat when working on each section.

### Database & Setup
```
Using the database.py and settings.py structure in this project, generate the Alembic env.py configuration that imports all models from the models/ directory.
```
```
Generate an Alembic migration for adding the audit_logs, farmer_documents, and notifications tables based on the SQLAlchemy models defined in this project.
```

### Services
```
Based on the stock_service.py pattern in this project, generate a distribution_service.py that handles the full lifecycle: pending → approved → released, with stock deduction on release and audit logging.
```
```
Using the existing User and Order models in this project, generate an eligibility_service.py that manages status transitions (pending → approved/rejected → inactive) with audit log calls.
```

### Testing
```
Based on the conftest.py fixture setup and the existing test_stock.py tests in this project, generate test_distributions.py covering: create distribution, approve, release, cancel, and duplicate release prevention.
```
```
Generate test_auth.py covering: successful registration, duplicate email rejection, wrong password, expired token, role-based endpoint access (farmer vs officer vs admin).
```

### Analytics
```
Based on the existing SQLAlchemy models in this project (Order, Product, User, Program), generate the full analytics.py router with overview, distributions-by-month, low-stock, and program-summary endpoints.
```

### Frontend
```
Using the existing api.js service and AuthContext in this project, add an Axios response interceptor that automatically retries requests using the refresh token when a 401 is received, and redirects to /login if the refresh also fails.
```
```
Based on the analytics overview endpoint response shape in this project, generate a Dashboard.jsx page that displays metric cards for farmer counts, stock alerts, and distribution totals, plus a Chart.js bar chart for monthly distributions.
```
```
Generate a DocumentUploader.jsx component that accepts PDF/JPG/PNG files up to 5MB, shows a preview of the file name, and posts to /users/{farmerId}/documents using the existing api.js service.
```

### Reports
```
Generate a Reports.jsx page with date range pickers and a program dropdown that calls GET /reports/distributions with query parameters and triggers a file download of the returned CSV.
```

---

## Implementation Checklist

### Phase 1 — Foundation
- [ ] `requirements.txt` updated with new packages
- [ ] `config/database.py` — MySQL connection string
- [ ] `config/settings.py` — all new env vars
- [ ] `.env` and `.env.example` created
- [ ] Alembic initialized and first migration run
- [ ] `auth/jwt.py` — refresh token functions added
- [ ] `auth/router.py` — `/refresh` endpoint added
- [ ] `schemas/auth.py` — password policy validator
- [ ] `main.py` — rate limiter attached to login/register
- [ ] `main.py` — CORS origins from env var

### Phase 2 — Core Logic
- [ ] `models/audit_log.py` created
- [ ] `models/farmer_document.py` created
- [ ] `models/notification.py` created
- [ ] `middleware/audit.py` — `log_action()` helper
- [ ] `services/stock_service.py` — `deduct_stock()` and `adjust_stock()`
- [ ] `routers/orders.py` — release endpoint with stock deduction + rollback
- [ ] `routers/users.py` — file upload endpoint
- [ ] All existing update/delete endpoints call `log_action()`
- [ ] Alembic migration run for new tables

### Phase 3 — Analytics
- [ ] `routers/analytics.py` — all 4 endpoints
- [ ] `services/report_service.py` — CSV generator
- [ ] `routers/reports.py` — CSV export endpoint
- [ ] `main.py` — new routers registered
- [ ] Frontend: Dashboard.jsx updated with charts
- [ ] Frontend: Analytics.jsx page created
- [ ] Frontend: Reports.jsx page with download button
- [ ] Frontend: `package.json` updated, charts installed

### Phase 4 — Testing & Polish
- [ ] `tests/conftest.py` — fixtures setup
- [ ] `tests/test_auth.py` — all auth scenarios
- [ ] `tests/test_stock.py` — deduction, insufficient, status update
- [ ] `tests/test_distributions.py` — lifecycle transitions
- [ ] `tests/test_audit.py` — log entries created correctly
- [ ] All list endpoints have `page`, `limit`, `search` params
- [ ] Frontend: `DataTable.jsx` component with pagination
- [ ] Frontend: all listing pages use paginated table
- [ ] Frontend: mobile nav hamburger menu
- [ ] Frontend: form validation with `react-hook-form`
- [ ] Axios interceptor for token auto-refresh

---

*Last updated for v2 — Capstone build*  
*Stack: FastAPI · SQLAlchemy · MySQL/MariaDB · Alembic · React · Vite · Tailwind CSS · Chart.js*
