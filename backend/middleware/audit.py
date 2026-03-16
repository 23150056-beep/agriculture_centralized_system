from sqlalchemy.orm import Session
from models.audit_log import AuditLog

def log_action(
    db: Session,
    user_id: int,
    action: str,
    entity_type: str,
    entity_id: int,
    old_value: dict = None,
    new_value: dict = None,
    description: str = None,
):
    """Call this after every sensitive create/update/delete/release operation."""
    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_value=old_value,
        new_value=new_value,
        description=description,
    )
    db.add(audit_entry)
    # Note: do NOT commit here — let the caller's transaction commit everything together
