import csv
import io
from sqlalchemy.orm import Session
from models.order import Order
from models.user import User
from models.product import Product
from models.program import Program

def generate_distributions_csv(
    db: Session,
    program_id: int | None = None,
    start_date: str = None,
    end_date: str = None
) -> str:
    """Returns CSV string of filtered distributions"""
    q = db.query(
        Order.distribution_code,
        Order.created_at,
        Order.status,
        Order.quantity,
        User.name.label("farmer_name"),
        User.farmer_id_number,
        Product.name.label("product_name"),
        Program.name.label("program_name")
    ).join(User, Order.buyer_id == User.id)\
     .join(Product, Order.product_id == Product.id)\
     .outerjoin(Program, Order.program_id == Program.id)
     
    if program_id:
        q = q.filter(Order.program_id == program_id)
    if start_date:
        q = q.filter(Order.created_at >= start_date)
    if end_date:
        q = q.filter(Order.created_at <= end_date)
        
    records = q.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "Distribution Code", 
        "Date", 
        "Status", 
        "Quantity", 
        "Farmer Name", 
        "Farmer ID", 
        "Product Name", 
        "Program Name"
    ])
    
    # Write rows
    for record in records:
        writer.writerow([
            record.distribution_code,
            record.created_at.strftime("%Y-%m-%d %H:%M:%S") if record.created_at else "",
            record.status,
            record.quantity,
            record.farmer_name,
            record.farmer_id_number,
            record.product_name,
            record.program_name
        ])
        
    return output.getvalue()