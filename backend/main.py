from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config.database import engine, Base
from auth.router import router as auth_router
from routers.products import router as products_router
from routers.orders import router as orders_router
from routers.programs import router as programs_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Agricultural Intervention Distribution System",
    version="2.0.0",
    description="Centralized system for managing farmer registration, inventory, and distribution programs",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(programs_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/")
def root():
    return {
        "message": "Agricultural Intervention Distribution System API",
        "version": "2.0.0",
        "modules": [
            "Module 1: Farmer Registration & Eligibility Management",
            "Module 2: Inventory & Stock Monitoring",
            "Module 3: Distribution & Program Management",
        ],
        "docs": "/docs",
    }
