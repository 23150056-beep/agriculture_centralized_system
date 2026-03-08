"""
List all user accounts in the database
"""

from config.database import SessionLocal
from models.user import User

db = SessionLocal()

try:
    users = db.query(User).all()
    
    print("\n" + "="*90)
    print("                    ALL USER ACCOUNTS IN DATABASE")
    print("="*90 + "\n")
    
    # Group by role
    roles = {'admin': [], 'officer': [], 'farmer': []}
    for user in users:
        roles.get(user.role, []).append(user)
    
    # Display Admin accounts
    if roles['admin']:
        print("👤 ADMINISTRATOR ACCOUNTS:")
        print("-" * 90)
        for user in roles['admin']:
            print(f"   Email:    {user.email}")
            print(f"   Name:     {user.name}")
            print(f"   Phone:    {user.phone or 'N/A'}")
            print(f"   Password: admin123  (default)")
            print()
    
    # Display Officer accounts
    if roles['officer']:
        print("👮 OFFICER ACCOUNTS:")
        print("-" * 90)
        for user in roles['officer']:
            print(f"   Email:    {user.email}")
            print(f"   Name:     {user.name}")
            print(f"   Phone:    {user.phone or 'N/A'}")
            print(f"   Password: officer123  (default)")
            print()
    
    # Display Farmer accounts
    if roles['farmer']:
        print("🌾 FARMER ACCOUNTS:")
        print("-" * 90)
        for user in roles['farmer']:
            status_emoji = "✓" if user.eligibility_status == "approved" else "⏳" if user.eligibility_status == "pending" else "✗"
            print(f"   Email:       {user.email}")
            print(f"   Name:        {user.name}")
            print(f"   Farmer ID:   {user.farmer_id_number or 'N/A'}")
            print(f"   Status:      {status_emoji} {user.eligibility_status or 'N/A'}")
            print(f"   Farm Size:   {user.farm_size or 'N/A'} hectares")
            print(f"   Crops:       {user.crop_types or 'N/A'}")
            print(f"   Insurance:   {'✓ Validated' if user.insurance_validated else '✗ Not Validated'}")
            print(f"   Password:    farmer123  (default)")
            print()
    
    print("="*90)
    print(f"TOTAL ACCOUNTS: {len(users)} ({len(roles['admin'])} admin, {len(roles['officer'])} officers, {len(roles['farmer'])} farmers)")
    print("="*90)
    print("\n🔑 LOGIN URL: http://localhost:5175/login")
    print("="*90 + "\n")
    
finally:
    db.close()
