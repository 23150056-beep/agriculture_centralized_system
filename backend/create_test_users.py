"""
Create test users for the Agricultural Distribution System
Run this script to populate the database with sample accounts
"""

from sqlalchemy.orm import Session
from config.database import SessionLocal, engine, Base
from models.user import User, UserRole, FarmerStatus
from auth.security import hash_password

# Create tables
Base.metadata.create_all(bind=engine)

def create_test_users():
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_admin = db.query(User).filter(User.email == "admin@agri.gov").first()
        if existing_admin:
            print("⚠️  Test users already exist!")
            return
        
        # Create Admin
        admin = User(
            email="admin@agri.gov",
            name="System Administrator",
            hashed_password=hash_password("admin123"),
            role=UserRole.admin.value,
            phone="+1234567890",
            address="Government Office, Capital City"
        )
        db.add(admin)
        print("✓ Created Admin account: admin@agri.gov / admin123")
        
        # Create Officer
        officer = User(
            email="officer@agri.gov",
            name="Distribution Officer",
            hashed_password=hash_password("officer123"),
            role=UserRole.officer.value,
            phone="+1234567891",
            address="Regional Office, District A"
        )
        db.add(officer)
        print("✓ Created Officer account: officer@agri.gov / officer123")
        
        # Create Approved Farmer
        farmer1 = User(
            email="farmer@example.com",
            name="John Farmer",
            hashed_password=hash_password("farmer123"),
            role=UserRole.farmer.value,
            phone="+1234567892",
            address="Farm Location, Region A",
            farmer_id_number="FRM-2026-001",
            farm_location="Region A, District 1",
            farm_size=5.5,
            crop_types="Rice, Corn, Vegetables",
            eligibility_status=FarmerStatus.approved.value,
            documents_verified=True,
            has_insurance=True,
            insurance_provider="National Agri Insurance",
            insurance_policy_number="INS-2026-001",
            insurance_validated=True
        )
        db.add(farmer1)
        print("✓ Created Farmer account (Approved): farmer@example.com / farmer123")
        
        # Create Pending Farmer
        farmer2 = User(
            email="farmer2@example.com",
            name="Maria Grower",
            hashed_password=hash_password("farmer123"),
            role=UserRole.farmer.value,
            phone="+1234567893",
            address="Farm Location, Region B",
            farmer_id_number="FRM-2026-002",
            farm_location="Region B, District 2",
            farm_size=3.2,
            crop_types="Wheat, Soybeans",
            eligibility_status=FarmerStatus.pending.value,
            documents_verified=False,
            has_insurance=False
        )
        db.add(farmer2)
        print("✓ Created Farmer account (Pending): farmer2@example.com / farmer123")
        
        # Create Another Officer
        officer2 = User(
            email="officer2@agri.gov",
            name="Jane Supervisor",
            hashed_password=hash_password("officer123"),
            role=UserRole.officer.value,
            phone="+1234567894",
            address="Regional Office, District B"
        )
        db.add(officer2)
        print("✓ Created Officer account: officer2@agri.gov / officer123")
        
        db.commit()
        
        print("\n" + "="*60)
        print("🎉 TEST USERS CREATED SUCCESSFULLY!")
        print("="*60)
        print("\n📋 Account Summary:\n")
        print("👤 ADMIN ACCOUNTS:")
        print("   Email: admin@agri.gov")
        print("   Password: admin123")
        print("   Access: Full system control\n")
        
        print("👮 OFFICER ACCOUNTS:")
        print("   1. officer@agri.gov / officer123")
        print("   2. officer2@agri.gov / officer123")
        print("   Access: Manage farmers, inventory, distributions\n")
        
        print("🌾 FARMER ACCOUNTS:")
        print("   1. farmer@example.com / farmer123 (✓ Approved)")
        print("   2. farmer2@example.com / farmer123 (⏳ Pending Approval)")
        print("   Access: View personal distributions\n")
        
        print("🌐 Login at: http://localhost:5174/login")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error creating test users: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("\n🔧 Creating test users for Agricultural Distribution System...\n")
    create_test_users()
