from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class GoogleAuthSync(BaseModel):
    token: str
    refresh_token: Optional[str] = None

class CalendarSyncRequest(GoogleAuthSync):
    summary: str
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None

class DriveUploadRequest(GoogleAuthSync):
    filename: str
    content: str  # Assuming text content for now (e.g. transcript)
    mime_type: Optional[str] = "text/plain"
    parent_id: Optional[str] = None

class BatchSyncResult(BaseModel):
    success: bool
    link: Optional[str] = None
    error: Optional[str] = None
