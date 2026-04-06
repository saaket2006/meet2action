import os
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta

from app.schemas.google import CalendarSyncRequest, BatchSyncResult, GoogleAuthSync
from app.services.calendar_service import get_calendar_service, create_event, list_calendars
from core.logger import get_logger

logger = get_logger("GoogleRouter")
router = APIRouter(prefix="/api/google", tags=["Google Integration"])

# Use environment variables added by the user
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
TOKEN_URI = "https://oauth2.googleapis.com/token"

import dateparser

@router.post("/sync-calendar", response_model=BatchSyncResult)
async def sync_to_calendar(request: CalendarSyncRequest):
    """
    Syncs a meeting summary as a calendar event using user's access token.
    """
    try:
        # Robustly parse the dates from the AI summary
        parsed_start = dateparser.parse(request.start_time, settings={'PREFER_DATES_FROM': 'future'})
        if not parsed_start:
             # Fallback to tomorrow if parsing fails
             parsed_start = datetime.now() + timedelta(days=1)
        
        parsed_end = None
        if request.end_time:
            parsed_end = dateparser.parse(request.end_time)
        
        if not parsed_end:
            parsed_end = parsed_start + timedelta(hours=1)

        # Safety conversion to ISO string for Google API
        start_iso = parsed_start.isoformat() if hasattr(parsed_start, 'isoformat') else str(parsed_start)
        end_iso = parsed_end.isoformat() if hasattr(parsed_end, 'isoformat') else str(parsed_end)

        service = get_calendar_service(
            access_token=request.token,
            refresh_token=request.refresh_token,
            token_uri=TOKEN_URI,
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET
        )
        
        event = create_event(
            service, 
            summary=request.summary, 
            description=request.description, 
            start_time=start_iso, 
            end_time=end_iso
        )


        
        return BatchSyncResult(success=True, link=event.get("htmlLink"))
    except Exception as e:
        logger.error(f"Calendar sync failed: {str(e)}")
        return BatchSyncResult(success=False, error=str(e))

@router.post("/list-calendars")
async def get_calendars(request: GoogleAuthSync):
    """
    Fetches the list of user's calendars.
    """
    try:
        service = get_calendar_service(
            access_token=request.token,
            refresh_token=request.refresh_token,
            token_uri=TOKEN_URI,
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET
        )
        calendars = list_calendars(service)
        return {"success": True, "calendars": calendars}
    except Exception as e:
        logger.error(f"Failed to list calendars: {str(e)}")
        return {"success": False, "error": str(e)}

