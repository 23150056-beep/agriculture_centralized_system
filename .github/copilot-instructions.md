# Agricultural Intervention Distribution System — Copilot Instructions

## Project Overview
This is a **centralized government agricultural intervention management system** with three core modules:
1. **Farmer Registration & Eligibility Management** — register farmers, track eligibility/insurance/documents
2. **Inventory & Stock Monitoring** — manage government intervention supplies (seeds, fertilizers, equipment, etc.)
3. **Distribution & Program Management** — distribute supplies to farmers under government programs

---

## Tech Stack

### Backend (`/backend`)
- **FastAPI** 0.115 + **SQLAlchemy** 2 + **Pydantic v2** (pydantic-settings)
- **Authentication**: JWT tokens via `python-jose`, passwords hashed with `passlib[bcrypt]`
- **Database**: SQLite in development (`agri_distribution.db`), PostgreSQL-ready (`psycopg3`)
- **Runs on port 8001**: `uvicorn main:app --reload --port 8001` from `/backend`
- **Structure**: `main.py` → `routers/` (products, orders, programs) + `auth/router.py`, models in `models/`, Pydantic schemas in `schemas/`, config in `config/`

### Frontend (`/agri_sys`)
- **React 19** + **Vite 7** + **React Router v7** + **Tailwind CSS v4**
- **HTTP client**: Axios, base URL `http://localhost:8001`
- **Icons**: Lucide React
- **Notifications**: react-hot-toast (top-right position)
- **Runs on port 5173**: `npm run dev` from `/agri_sys`
- **Structure**: `src/pages/` (Dashboard, Farmers, Products, Orders, Programs, Login, Register), `src/components/` (Layout, ProtectedRoute), `src/context/AuthContext.jsx`, `src/services/api.js`

---

## Data Models

### User (users table)
- Roles: `farmer` | `officer` | `admin`
- Farmer eligibility status: `pending` | `approved` | `rejected` | `inactive`
- Farmer-specific fields: `farmer_id_number`, `farm_location`, `farm_size`, `crop_types`, insurance fields, document verification

### Product (products table) — Intervention Supplies
- Categories: `seeds` | `fertilizers` | `pesticides` | `equipment` | `livestock` | `feeds` | `irrigation` | `other`
- Stock status: `in_stock` | `low_stock` | `out_of_stock` | `expired`
- Fields: `current_stock`, `initial_stock`, `reorder_level`, `unit`, `batch_number`, `expiry_date`

### Order (orders table) — Distribution Transactions
- `buyer_id` = farmer recipient, `product_id` = supply, `program_id` = associated program
- Status: `pending` | `approved` | `released` | `completed` | `cancelled`
- `distribution_code` is unique identifier

### Program (programs table) — Government Intervention Programs
- Types: `emergency_relief` | `seasonal_support` | `subsidy_program` | `disaster_recovery` | `training_program` | `equipment_distribution` | `other`
- Status: `planned` | `active` | `completed` | `suspended` | `cancelled`

---

## Auth & Security
- JWT tokens stored in `localStorage` under key `"token"`
- All API requests send `Authorization: Bearer <token>` via Axios interceptor in `src/services/api.js`
- 401 responses automatically clear token and redirect to `/login`
- Role-based access: farmers can only see/edit their own data; officers manage distributions; admins have full access
- **Never commit `.env`** — it is gitignored. Use `.env.example` as reference.

---

## Frontend Patterns
- Every protected page is wrapped: `<ProtectedRoute><Layout><PageComponent /></Layout></ProtectedRoute>`
- Use `useAuth()` hook from `AuthContext` to get `{ user, loading, login, register, logout }`
- Use `api` (Axios instance from `src/services/api.js`) for all HTTP calls — never use raw `fetch` or a new Axios instance
- Toast notifications: `import toast from 'react-hot-toast'` → `toast.success(...)` / `toast.error(...)`
- Icons: import from `lucide-react`
- Styling: Tailwind CSS utility classes only — no separate CSS files for new components

## Backend Patterns
- Router files live in `backend/routers/` (one per module)
- Always use `Depends(get_db)` for database sessions, `Depends(get_current_user)` for auth
- Return Pydantic `response_model` on every endpoint
- Use `HTTPException` with appropriate status codes for errors
- Settings are loaded via `get_settings()` from `config/settings.py` (cached with `@lru_cache`)
- All new models must be imported in `config/database.py` or `models/__init__.py` so `Base.metadata.create_all()` picks them up

---

## Routes Map
| URL | Page | Description |
|-----|------|-------------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/` | Dashboard | Summary stats |
| `/farmers` | Farmers | Module 1 — farmer management |
| `/inventory` | Products | Module 2 — supply inventory |
| `/distributions` | Orders | Module 3 — distribution transactions |
| `/programs` | Programs | Module 3 — government programs |

---

## Running the Project
```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in SECRET_KEY
uvicorn main:app --reload --port 8001

# Frontend
cd agri_sys
npm install
npm run dev
```
Or use Docker: `docker-compose up` from the root.

---

## Key Reminders
- The `Order` model represents a **distribution transaction**, not a purchase order.
- `Product` represents **government intervention supplies**, not sold goods.
- `buyer_id` in Order = farmer recipient (legacy field name, DO NOT rename without migration).
- Database file (`agri_distribution.db`) is gitignored — never commit it.
- `__pycache__/` and `.pyc` files are gitignored — never commit them.
