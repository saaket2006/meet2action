import os
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.google import CalendarSyncRequest, DriveUploadRequest, BatchSyncResult, GoogleAuthSync
from app.services.calendar_service import get_calendar_service, create_event, list_calendars
from app.services.drive_service import get_drive_service, upload_file
import tempfile
from core.logger import get_logger

logger = get_logger("GoogleRouter")
router = APIRouter(prefix="/api/google", tags=["Google Integration"])

# Use environment variables added by the user
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
TOKEN_URI = "https://oauth2.googleapis.com/token"

@router.post("/sync-calendar", response_model=BatchSyncResult)
async def sync_to_calendar(request: CalendarSyncRequest):
    """
    Syncs a meeting summary as a calendar event using user's access token.
    """
    try:
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
            start_time=request.start_time, 
            end_time=request.end_time
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

@router.post("/upload-transcript", response_model=BatchSyncResult)
async def upload_meeting_transcript(request: DriveUploadRequest):
    """
    Uploads meeting transcript content to user's Google Drive.
    """
    try:
        service = get_drive_service(
            access_token=request.token,
            refresh_token=request.refresh_token,
            token_uri=TOKEN_URI,
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET
        )
        
        # Save content to a temporary file for backend processing
        with tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix=".txt") as tmp:
            tmp.write(request.content)
            temp_path = tmp.name
        
        try:
            drive_file = upload_file(
                service, 
                file_path=temp_path, 
                name=request.filename, 
                mime_type=request.mime_type
            )
            os.remove(temp_path)
            return BatchSyncResult(success=True, link=drive_file.get("webViewLink"))
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e
            
    except Exception as e:
        logger.error(f"Drive upload failed: {str(e)}")
        return BatchSyncResult(success=False, error=str(e))
