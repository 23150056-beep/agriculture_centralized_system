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
    
    stream = io.StringIO(csv_data)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=distributions_report.csv"
    return response