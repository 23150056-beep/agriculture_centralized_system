---
name: agri-sys-backend
description: "Apply FastAPI, SQLAlchemy 2, and auth best practices for backend development in the Agri-Sys project."
---

# Agri-Sys Backend Development Guidelines

This skill enforces the architecture, database, and routing patterns for the backend module of the Agricultural Intervention Distribution System (`/backend`).

## Tech Stack Rules

- **Framework:** FastAPI 0.115
- **ORM & Validation:** SQLAlchemy 2 + Pydantic v2 (pydantic-settings)
- **Auth:** JWT via `python-jose`, passwords hashed with `passlib[bcrypt]`
- **DB:** SQLite in dev (`agri_distribution.db`), PostgreSQL-ready (`psycopg3`)

## Code Structure & Routing

- **Routers:** All endpoints must live in `backend/routers/` (one file per module, e.g., `products.py`, `orders.py`).
- **Dependencies:**
  - Always use `Depends(get_db)` to inject database sessions.
  - Always use `Depends(get_current_user)` to enforce authentication on protected endpoints.
- **Responses:** Every endpoint must explicitly define a Pydantic `response_model`.
- **Error Handling:** Use `HTTPException` with appropriate semantic HTTP status codes.

## Database & Models

- **Imports:** All new SQLAlchemy models must be imported in `config/database.py` or `models/__init__.py` so `Base.metadata.create_all()` detects and generates them.
- **Gitignores:** Never commit `agri_distribution.db`, `__pycache__/`, or `.env`.

## Settings & Configuration

- Configuration is loaded via `get_settings()` from `config/settings.py` which uses Python's `@lru_cache` to prevent redundant reads.

## When to Use

Invoke this skill whenever you are:

- Creating a new API endpoint.
- Working on models or schemas (`models/` or `schemas/`).
- Fixing authentication or database connection issues.
