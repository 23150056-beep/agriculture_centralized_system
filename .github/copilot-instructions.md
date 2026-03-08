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

---

## UI Design Brain — Component Knowledge

> Sourced from [carmahhawwari/ui-design-brain](https://github.com/carmahhawwari/ui-design-brain) (MIT). Apply whenever building or editing any UI.

### Design Philosophy
1. **Restraint over decoration.** Fewer elements, highly refined. White space is a feature.
2. **Typography carries hierarchy.** Maximize weight contrast between headings and labels.
3. **One strong color moment.** Neutral palette first; introduce one confident accent.
4. **Spacing is structure.** Use an 8 px grid. Tighter gaps group related elements; generous gaps let content breathe.
5. **Accessibility is non-negotiable.** WCAG AA contrast. Focus indicators. Semantic HTML. Keyboard navigation.
6. **No generic AI aesthetics.** Avoid: purple-on-white gradients, Inter/Roboto defaults, evenly-spaced card grids, cookie-cutter layouts.

**Quality bar:** Clean visual rhythm, obvious interactive affordances (hover/focus/active), graceful edge cases (empty states, loading, error), responsive without breakpoint artifacts.

### Design Direction for This Project
Use **Enterprise / Corporate** style (information-dense, compact spacing, fully keyboard-navigable) with **Modern SaaS** influence (neutral palette, `bg-green-700` accent, 8 px grid, generous white space).

### Workflow — Before Writing UI Code
1. **Identify components** needed from the request (use aliases below)
2. **Apply best practices** for each component
3. **Follow this project's design system**: `bg-green-950` sidebar · `bg-green-700` buttons · `bg-slate-100` page bg · `bg-white border border-slate-200 shadow-sm rounded-xl` cards · `bg-slate-50 border-b border-slate-200` table headers · `text-xs font-semibold text-slate-500 uppercase tracking-wide` column labels · Inter font
4. **Generate production-ready code**: React + Tailwind CSS, mobile-first, semantic HTML

### Component Quick Reference (60 components)

| Component | Key rule |
|-----------|----------|
| **Button** | Verb-first labels ("Save changes"); one primary per section; 44 px min touch target; loading spinner + disable during async; `bg-green-700 hover:bg-green-800` primary |
| **Card** | Media → title → meta → action hierarchy; shadow OR border, not both; `bg-white border border-slate-200 shadow-sm rounded-xl` |
| **Modal / Dialog** | Trap focus; X + Cancel + Escape to close; return focus to trigger on close; semi-transparent backdrop |
| **Drawer** | Right for detail panels, left for navigation; 320–480 px desktop, full-width mobile; dim backdrop |
| **Table** | Sticky header; right-align numbers; sortable column indicators; `bg-slate-50` header; `text-xs font-semibold uppercase tracking-wide text-slate-500` th; horizontal scroll on mobile |
| **Form** | Single-column layout; labels above inputs; inline validation on blur (not keystroke); disable/show errors on submit |
| **Text input** | Use correct input types (email, tel, number); placeholder is format hint only, never label replacement; show inline errors below with red border |
| **Select** | Placeholder "Select an option…" when no value; group long lists with optgroups |
| **Tabs** | 2–7 tabs; active bottom-border/fill indicator; arrow keys between tabs; accordion on mobile |
| **Badge** | 1–2 words; pill shape for status; limited semantic color palette; `bg-X-100 text-X-700` pattern |
| **Alert** | Semantic colors: red=error, amber=warning, green=success, blue=info; icon + color (not color alone); max 2 sentences |
| **Toast** | Auto-dismiss 4–6 s; allow manual dismiss; stack newest on top; bottom-right position; undo action for destructive ops |
| **Navigation** | 5–7 items max; clear active state; icon + label for scannability; keyboard-navigable |
| **Empty state** | Illustration/icon + helpful headline + primary CTA; positive framing ("No farmers yet", not "You have no farmers") |
| **Skeleton** | Match actual layout shape; shimmer animation; show after 300 ms; prefer over spinners for predictable layouts |
| **Spinner** | Show after ~300 ms delay; size proportional to context (inline 16 px, button 20 px, page 40+ px); `aria-label="Loading"` |
| **Pagination** | Show first/last + window around current; ellipsis for skipped pages; Previous/Next buttons; current page clearly selected |
| **Dropdown menu** | 7±2 items max; keyboard nav (arrows + Enter + Escape); destructive actions last in red, separated |
| **Popover** | Trigger on click (not hover) for accessibility; dismiss on outside click or Escape; subtle caret pointing to trigger |
| **Tooltip** | Supplementary info only; trigger hover on desktop; show after ~300 ms delay; single sentence max |
| **Breadcrumbs** | Full hierarchy path; current page is last item, not a link; subtle separator (/ or ›) |
| **Progress bar** | Determinate when measurable, indeterminate when unknown; include percentage label; smooth animation |
| **Accordion** | Chevron right-aligned; short ease-out transition 150–250 ms; allow multiple open unless space-critical |
| **Combobox / Autocomplete** | Suggestions after 1–2 characters; highlight matched text; debounce 200–300 ms |
| **Checkbox** | Multi-select use case; align to first line of label; support indeterminate state; 44 px touch target |
| **Radio button** | Mutually exclusive choices; pre-select sensible default; stack vertically for 3+ options |
| **Toggle / Switch** | Binary on/off with immediate effect; label describes what it controls, not "On/Off"; use checkbox instead inside Save-required forms |
| **Segmented control** | 2–5 segments; equal-width; animated selection indicator; sentence-case labels |
| **Search input** | Magnifying glass icon inside field; Cmd/Ctrl+K global shortcut; clear button once text entered; debounce 200–300 ms |
| **Datepicker** | Allow manual text entry + calendar selection; disable out-of-range dates; keyboard-navigable calendar grid |
| **File upload** | Drag-and-drop zone; show accepted types + size limits; per-file progress bar; allow cancellation |
| **Avatar** | Three sizes: 24–32/40–48/64–80 px; fallback: image → initials → icon; lazy load with shimmer placeholder |
| **Stepper (quantity)** | +/- buttons + direct number input; disable button at min/max; sensible step value |
| **Tree view** | 16–24 px indentation per level; chevron toggles; keyboard: arrows + Enter + +/-; lazy-load deep nodes |
| **Slider** | Show current value in tooltip or label; 44 px touch target for thumb; pair with text input for precision |
| **Skeleton** | Muted light gray, shimmer pulse; match layout shape closely; avoid for loads < 300 ms |

### Anti-Patterns — Never Generate These
- Rainbow badges (every status a different bright color with no semantic meaning)
- Modal inside modal (use a page or drawer for complex flows)
- Disabled submit with no explanation of what's missing
- Spinner for predictable layouts (use skeleton screens)
- "Click here" or "Learn more" link text (describe the destination)
- Hamburger menu on desktop (use visible navigation)
- Auto-advancing carousels (let users control navigation)
- Placeholder-only form fields (always use visible labels)
- Equal-weight buttons (establish primary/secondary/tertiary hierarchy)
- Tiny text under 12 px (body text minimum 14 px, prefer 16 px)
