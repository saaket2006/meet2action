from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class GoogleAuthSync(BaseModel):
    token: str
    refresh_token: Optional[str] = None

class CalendarSyncRequest(GoogleAuthSync):
    summary: str
    description: Optional[str] = None
    start_time: str
    end_time: Optional[str] = None




class BatchSyncResult(BaseModel):
    success: bool
    link: Optional[str] = None
    error: Optional[str] = None

