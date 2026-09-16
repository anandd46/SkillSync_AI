"""Audit logging service."""
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Any

logger = logging.getLogger(__name__)


async def log_action(
    db: AsyncSession,
    user_id: Optional[int],
    action: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    old_value: Optional[Any] = None,
    new_value: Optional[Any] = None,
):
    """Log an audit action."""
    try:
        from app.models.system import AuditLog
        log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value,
        )
        db.add(log)
        # Don't commit here — let the parent transaction commit
    except Exception as e:
        logger.warning("Failed to create audit log: %s", e)
