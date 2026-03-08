# Quick Start Guide - Agricultural Intervention Distribution System
## Get Started in 15 Minutes

This guide will help you start using the **Agricultural Intervention Distribution System** - a centralized platform for managing farmer registration, inventory monitoring, and distribution programs for government agricultural interventions.

---

## 🎯 SYSTEM OVERVIEW

### Three Core Modules:

**🔵 Module 1: Farmer Registration & Eligibility Management**
- Centralized farmer registration with comprehensive profiling
- Insurance validation and tracking
- Eligibility status management (pending, approved, rejected)
- Document verification and file systemization

**🔵 Module 2: Inventory & Stock Monitoring**
- Real-time monitoring of intervention supplies (seeds, fertilizers, equipment, etc.)
- Automatic stock tracking with low-stock alerts
- Batch tracking with expiry date monitoring
- Auto stock deduction on distribution

**🔵 Module 3: Distribution & Program Management (CORE)**
- Fast transaction processing for item releases
- Track farmer recipients with digital records
- Program-based distribution monitoring
- Officer assignment and accountability
- Comprehensive distribution reports

---

## 🚀 IMMEDIATE FIRST STEPS

### Step 1: Setup Backend (5 minutes)

The backend is already configured with three modules. Start the server:

```bash
cd backend
# Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Start the server
uvicorn main:app --reload
```

Open browser: http://localhost:8000/docs

You'll see the updated API with endpoints for:
- `/auth/farmers` - Farmer management
- `/products` - Inventory & stock monitoring  
- `/distributions` - Distribution management
- `/programs` - Program management

### Step 2: Setup Frontend (3 minutes)

```bash
cd agri_sys
npm install
npm run dev
```

Open: http://localhost:5173

---

## 👥 USER ROLES & ACCESS

### 1. Admin
- Full system access
- Manage all farmers, inventory, distributions, and programs
- View all reports and analytics

### 2. Officer (Distribution Officer)
- Review and approve farmer registrations
- Manage inventory and stock
- Create and process distributions
- Manage programs
- Monitor assigned distributions

### 3. Farmer
- Register and complete profile
- View eligibility status
- Track received distributions
- View program information

---

## 📋 KEY FEATURES BY MODULE

### Module 1: Farmer Registration & Eligibility

**Farmer Registration:**
- Comprehensive profile with farm details
- Government-issued farmer ID tracking
- Farm location and size information
- Crop type specifications

**Insurance Management:**
- Insurance provider tracking
- Policy number and expiry date
- Validation workflow by officers
- Validation status indicators

**Eligibility Management:**
- Three-stage approval process (Pending → Approved/Rejected)
- Document verification checklist
- Approval/rejection notes
- Rejection reason tracking

**Key Endpoints:**
```
POST   /auth/register                  - Register new farmer
PUT    /auth/farmers/{id}/profile      - Update farmer profile
PUT    /auth/farmers/{id}/insurance    - Update insurance info
PUT    /auth/farmers/{id}/eligibility  - Approve/reject farmer
GET    /auth/farmers                   - List all farmers
```

### Module 2: Inventory & Stock Monitoring

**Real-time Stock Tracking:**
- Current stock vs. initial stock monitoring
- Reorder level alerts
- Stock status indicators (In Stock, Low Stock, Out of Stock)
- Automatic status updates

**Supply Categories:**
- Seeds, Fertilizers, Pesticides
- Equipment, Livestock, Feeds
- Irrigation supplies, and more

**Batch Management:**
- Batch number tracking
- Manufacture and expiry dates
- Supplier information
- Storage location tracking

**Key Endpoints:**
```
GET    /products/                      - List all inventory
GET    /products/summary               - Stock summary stats
POST   /products/                      - Add new supply
PUT    /products/{id}                  - Update inventory
POST   /products/{id}/adjust-stock     - Manual stock adjustment
```

### Module 3: Distribution & Program Management

**Distribution Records:**
- Unique distribution codes
- Farmer recipient tracking
- Item and quantity recording
- Program association
- Officer assignment
- Status workflow (Pending → Approved → Released → Completed)

**Program Management:**
- Program types (Emergency Relief, Seasonal Support, Subsidy, etc.)
- Budget and beneficiary tracking
- Start/end date management
- Coordinator information
- Geographic coverage

**Distribution Reports:**
- Total distributions by program
- Beneficiary statistics
- Items distributed tracking
- Officer performance metrics

**Key Endpoints:**
```
GET    /distributions/                 - List distributions
POST   /distributions/                 - Create distribution
PATCH  /distributions/{id}/status      - Update status
POST   /distributions/{id}/release     - Record item release
GET    /distributions/report           - Generate reports
GET    /programs/                      - List programs
POST   /programs/                      - Create program
GET    /programs/{id}/summary          - Program statistics
```

---

## 🎨 FRONTEND PAGES

### 1. Dashboard (`/`)
**All Users:**
- Role-specific overview
- Key statistics and metrics
- Module-based organization

**Admin/Officer View:**
- Farmer statistics (registered, pending approval)
- Inventory alerts (low stock, out of stock)
- Distribution status (pending, completed)

**Farmer View:**
- Personal distribution history
- Eligibility status
- Pending distributions

### 2. Farmers Page (`/farmers`) - Admin/Officer Only
- List all registered farmers
- Filter by eligibility status (All, Pending, Approved, Rejected)
- Review farmer profiles
- Validate insurance information
- Approve/reject eligibility
- Add review notes

### 3. Inventory Page (`/inventory`) - Admin/Officer Only
- View all intervention supplies
- Filter by stock status (All, Low Stock, Out of Stock)
- Add new supplies
- Update stock levels
- View batch and expiry information
- Storage location tracking

### 4. Distributions Page (`/distributions`) - All Users
**Officer/Admin:**
- Create new distributions
- Select eligible farmers
- Choose items and quantities
- Assign to programs
- Update distribution status
- Track all distributions

**Farmer:**
- View personal distributions
- Track status
- View distribution codes

### 5. Programs Page (`/programs`) - Admin/Officer Only
- Create and manage intervention programs
- View program statistics
- Track beneficiaries and budget
- Monitor distributions by program
- Program timeline management

---

## 🔄 TYPICAL WORKFLOWS

### Workflow 1: Farmer Registration & Approval

1. **Farmer Registers:**
   - Goes to `/register`
   - Fills in profile (name, email, farmer ID, farm details)
   - Status: `pending`

2. **Officer Reviews:**
   - Goes to `/farmers`
   - Filters for `pending` farmers
   - Reviews farmer profile
   - Validates insurance if provided
   - Verifies documents
   - Approves or rejects with notes

3. **Farmer is Notified:**
   - Status changes to `approved` or `rejected`
   - Can view status on dashboard

### Workflow 2: Inventory Management

1. **Officer Adds Supply:**
   - Goes to `/inventory`
   - Clicks "Add Supply"
   - Enters: name, category, initial stock, reorder level
   - Adds supplier, batch info, storage location
   - System sets status to "In Stock"

2. **System Monitors Stock:**
   - Auto-updates status when stock falls below reorder level
   - Shows "Low Stock" alert
   - Shows "Out of Stock" when quantity ≤ 0

3. **Officer Adjusts Stock:**
   - Can manually adjust for new shipments
   - Can add adjustment notes
   - System tracks all changes

### Workflow 3: Distribution Processing

1. **Officer Creates Distribution:**
   - Goes to `/distributions`
   - Clicks "New Distribution"
   - Selects eligible farmer
   - Chooses inventory item
   - Sets quantity
   - Assigns to program (optional)
   - System generates distribution code
   - **Auto stock deduction happens**

2. **Officer Processes Distribution:**
   - Updates status: Pending → Approved
   - Records release date and location
   - Captures signatures (optional)
   - Status: Released

3. **Officer Completes:**
   - Status: Completed
   - Farmer can view in their dashboard
   - Statistics updated

### Workflow 4: Program Management

1. **Admin Creates Program:**
   - Goes to `/programs`
   - Creates new program (e.g., "2026 Seed Distribution")
   - Sets budget, target beneficiaries
   - Assigns coordinator
   - Status: Planned

2. **Program Activation:**
   - Changes status to: Active
   - Officers create distributions under this program

3. **Program Monitoring:**
   - View statistics: total distributions, beneficiaries served
   - Track budget utilization
   - Generate reports

4. **Program Completion:**
   - Status: Completed
   - Final reports generated
   - Data archived

---

## 🔧 CONFIGURATION

### Backend Configuration

**Database Connection** (`.env`):
```
DATABASE_URL=postgresql://user:password@localhost/agri_distribution
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Default User Roles:**
- `farmer` - Default for new registrations
- `officer` - For distribution officers
- `admin` - Full system access

### Frontend Configuration

**API Base URL** (`src/services/api.js`):
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000',
});
```

---

## 📊 DATABASE MODELS

### User Model (Enhanced)
```python
- Basic fields: id, email, name, role, phone, address
- Farmer profile: farmer_id_number, farm_location, farm_size, crop_types
- Eligibility: eligibility_status, documents_verified, approved_by
- Insurance: has_insurance, provider, policy_number, expiry_date, validated
```

### Product Model (Inventory)
```python
- Basic: id, name, description, category, unit
- Stock: current_stock, initial_stock, reorder_level, status
- Supply details: supplier_name, batch_number, manufacture_date, expiry_date
- Tracking: received_by, storage_location, notes
```

### Order Model (Distribution)
```python
- IDs: id, distribution_code, buyer_id, product_id, program_id, officer_id
- Quantity: quantity, unit
- Status: status, distribution_date, release_date
- Tracking: location, verification_code, signatures, notes
```

### Program Model
```python
- Basic: id, program_code, name, description, program_type, status
- Period: start_date, end_date
- Budget: budget, currency, target_beneficiaries, actual_beneficiaries
- Management: coordinator_name, implementing_agency
```

---

## 🚨 TROUBLESHOOTING

### Backend Won't Start

```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt --upgrade

# Check for port conflicts
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows
```

### Database Connection Failed

```bash
# Test PostgreSQL is running
psql -U postgres

# Check connection string in .env
# Make sure username, password, host, database name are correct
```

### Frontend Won't Start

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite

# Try different port
npm run dev -- --port 5174
```

### Import Errors

```bash
# Backend
pip install [missing-package]

# Frontend
npm install [missing-package]
```

### Module Import Issues

If you get "Module not found" errors:

```bash
# Backend - ensure you're in the backend folder
cd backend
# Make sure virtual environment is activated
python -c "import sys; print(sys.prefix)"  # Should show venv path

# Frontend
cd agri_sys
npm install
```

---

## 📊 TESTING THE SYSTEM

### Create Test Users

```python
# In Python shell or create a seed script
# After activating venv:
python

from models.user import User, UserRole, FarmerStatus
from config.database import SessionLocal
from auth.security import hash_password

db = SessionLocal()

# Create admin
admin = User(
    email="admin@agri.gov",
    name="System Admin",
    hashed_password=hash_password("admin123"),
    role=UserRole.admin.value
)
db.add(admin)

# Create officer
officer = User(
    email="officer@agri.gov",
    name="Distribution Officer",
    hashed_password=hash_password("officer123"),
    role=UserRole.officer.value
)
db.add(officer)

# Create farmer
farmer = User(
    email="farmer@example.com",
    name="John Farmer",
    hashed_password=hash_password("farmer123"),
    role=UserRole.farmer.value,
    farmer_id_number="FRM-2026-001",
    farm_location="Region A",
    farm_size=5.5,
    eligibility_status=FarmerStatus.approved.value
)
db.add(farmer)

db.commit()
print("Test users created!")
```

### Test Data Flow

1. **Login as Officer:**
   - Email: `officer@agri.gov`
   - Password: `officer123`

2. **Add Inventory:**
   - Go to `/inventory`
   - Add: "Hybrid Seeds", 1000kg, reorder level: 100kg

3. **Approve Farmer:**
   - Go to `/farmers`
   - Review pending farmers
   - Approve eligible farmers

4. **Create Program:**
   - Go to `/programs`
   - Create: "2026 Seed Distribution Program"

5. **Create Distribution:**
   - Go to `/distributions`
   - Select approved farmer
   - Select inventory item
   - Assign to program
   - Submit

6. **Login as Farmer:**
   - Email: `farmer@example.com`
   - Password: `farmer123`
   - View distributions on dashboard

---

## 🎯 NEXT STEPS

### Immediate Improvements:
1. Add file upload for farmer documents
2. Implement signature capture for distributions
3. Add email notifications
4. Generate PDF reports
5. Add export to Excel functionality

### Advanced Features:
1. Real-time notifications (WebSocket)
2. Mobile app (React Native)
3. SMS notifications for farmers
4. Geolocation tracking
5. QR code verification
6. Analytics dashboard
7. Multi-language support

---

## 📈 SYSTEM METRICS TO TRACK

- Total farmers registered
- Farmers pending approval
- Total inventory items
- Low stock alerts
- Out of stock items
- Total distributions
- Distributions by program
- Beneficiaries served
- Budget utilization
- Officer performance

---

## 🔒 SECURITY BEST PRACTICES

1. **Environment Variables:**
   - Never commit `.env` files
   - Use strong SECRET_KEY
   - Rotate keys regularly

2. **Password Policy:**
   - Minimum 8 characters
   - Require strong passwords in production

3. **Access Control:**
   - Role-based permissions enforced
   - Token expiration configured
   - Refresh token implementation (TODO)

4. **Data Validation:**
   - Input validation on all endpoints
   - Sanitize user inputs
   - Prevent SQL injection (using ORM)

---

## 📞 SUPPORT & RESOURCES

### Documentation:
- FastAPI: https://fastapi.tiangolo.com
- React: https://react.dev
- SQLAlchemy: https://docs.sqlalchemy.org
- TailwindCSS: https://tailwindcss.com

### Community:
- Stack Overflow
- GitHub Issues
- Discord communities

---

## 🎉 CONGRATULATIONS!

You now have a fully functional Agricultural Intervention Distribution System with:

✅ **Module 1:** Farmer registration and eligibility management  
✅ **Module 2:** Inventory and stock monitoring  
✅ **Module 3:** Distribution and program management  

The system includes:
- Role-based access control
- Real-time stock tracking
- Comprehensive farmer profiling
- Program-based distributions
- Officer accountability
- Reporting and analytics

**Ready to deploy? Check deployment guides for production setup!**

---

**Built with ❤️ for agricultural development**
