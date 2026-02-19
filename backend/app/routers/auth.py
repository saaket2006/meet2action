import os
from fastapi import APIRouter, Request, Depends, HTTPException, Body
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from app.services.calendar_service import get_calendar_service, create_event
import datetime
import json
from core.logger import get_logger

router = APIRouter()
logger = get_logger("AuthRouter")

# Allow oauthlib to use HTTP for local testing
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
# Allow OAuthlib to relax scope validation
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

CLIENT_SECRETS_FILE = "client_secret.json" # You might need to adjust this if using env vars directly is preferred, but Flow usually likes a file or dictionary.
# Alternatively, constructing client_config from env vars:
client_config = {
    "web": {
        "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
        "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")]
    }
}

SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'openid'
]

from dateutil import parser
from googleapiclient.discovery import build # Ensure this is imported

from typing import Optional

@router.get("/auth/google/login")
async def login(request: Request, summary: Optional[str] = None, deadline: Optional[str] = None):
    logger.info(f"Login endpoint hit. Summary: {summary}, Deadline: {deadline}")
    # Check if env vars are loaded
    if not os.environ.get("GOOGLE_CLIENT_ID") or not os.environ.get("GOOGLE_CLIENT_SECRET"):
        logger.error("Google client ID or secret not set in environment variables.")
        raise HTTPException(status_code=500, detail="Server configuration error: Google credentials missing.")

    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")
    )

    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )

    request.session['state'] = state
    if summary:
        request.session['pending_event_summary'] = summary
    if deadline:
        request.session['pending_event_deadline'] = deadline

    return RedirectResponse(authorization_url)

@router.get("/auth/google/callback")
async def callback(request: Request):
    # ... (existing state check) ...
    state = request.session.get('state')
    if not state:
        logger.error("State not found in session")
        return HTMLResponse(content="<h1>Error: Session expired or invalid state. Please try again.</h1>", status_code=400)
    
    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        state=state,
        redirect_uri=os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")
    )
    
    try:
        # Use the authorization response URL to fetch the token
        flow.fetch_token(authorization_response=str(request.url))
        credentials = flow.credentials
        request.session['credentials'] = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        
        # Fetch User Info
        try:
            user_info_service = build('oauth2', 'v2', credentials=credentials)
            user_info = user_info_service.userinfo().get().execute()
            request.session['user_info'] = {
                'name': user_info.get('name'),
                'email': user_info.get('email'),
                'picture': user_info.get('picture')
            }
            logger.info(f"Authentication successful for user: {user_info.get('email')}")
        except Exception as e:
            logger.error(f"Failed to fetch user info: {e}")
            # Non-critical, continue
        
        # Check for pending event
        # ... (rest of callback) ...
        pending_event = request.session.pop('pending_event', None)
        event_link = None
        message = "Authentication successful! You can now use calendar features."
        
        if pending_event:
            # ... (event creation logic) ...
             logger.info(f"Processing pending event: {pending_event}")
             try:
                service = get_calendar_service(
                    access_token=credentials.token,
                    refresh_token=credentials.refresh_token,
                    token_uri=credentials.token_uri,
                    client_id=credentials.client_id,
                    client_secret=credentials.client_secret
                )
                
                # Parse deadline
                logger.debug(f"Raw deadline string: {pending_event['deadline']}")
                try:
                    start_time = parser.parse(pending_event['deadline'])
                    logger.debug(f"Parsed start_time: {start_time}")
                except Exception as parse_error:
                    logger.warning(f"Date parsing failed for '{pending_event['deadline']}', defaulting to tomorrow. Error: {parse_error}")
                    start_time = datetime.datetime.utcnow() + datetime.timedelta(days=1)

                if start_time.tzinfo is None:
                     start_time = start_time.replace(tzinfo=datetime.timezone.utc)
                
                event = create_event(
                    service,
                    pending_event['summary'],
                    f"Action item from Meet2Action. Deadline: {pending_event['deadline']}",
                    start_time
                )
                event_link = event.get('htmlLink')
                # Redirect directly to the event
                return RedirectResponse(event_link)
             except Exception as e:
                logger.error(f"Failed to create pending event: {e}")
                # Fallback to home if event creation fails
                return RedirectResponse("http://localhost:3000")

        # No pending event, just redirect home
        return RedirectResponse("http://localhost:3000")

    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        return HTMLResponse(content=f"<h1 class='error'>Authentication failed: {e}</h1>", status_code=500)

@router.post("/auth/calendar/create-event")
async def create_event_direct(request: Request, event_data: dict = Body(...)):
    creds_data = request.session.get('credentials')
    if not creds_data:
        raise HTTPException(status_code=401, detail="Not authenticated")

    summary = event_data.get('summary')
    deadline = event_data.get('deadline')
    
    if not summary:
        raise HTTPException(status_code=400, detail="Summary is required")

    try:
        service = get_calendar_service(
            access_token=creds_data['token'],
            refresh_token=creds_data['refresh_token'],
            token_uri=creds_data['token_uri'],
            client_id=creds_data['client_id'],
            client_secret=creds_data['client_secret']
        )
        
        # Parse deadline
        try:
            if deadline:
                start_time = parser.parse(deadline)
            else:
                start_time = datetime.datetime.utcnow() + datetime.timedelta(days=1)
        except Exception:
            start_time = datetime.datetime.utcnow() + datetime.timedelta(days=1)

        if start_time.tzinfo is None:
             start_time = start_time.replace(tzinfo=datetime.timezone.utc)
        
        event = create_event(
            service,
            summary,
            f"Action item from Meet2Action. Deadline: {deadline}",
            start_time
        )
        return {"message": "Event created", "link": event.get('htmlLink')}
    except Exception as e:
        logger.error(f"Failed to create event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/auth/google/test-calendar")
async def test_calendar(request: Request):
    creds_data = request.session.get('credentials')
    if not creds_data:
        return RedirectResponse("/auth/google/login")
    
    try:
        service = get_calendar_service(
            access_token=creds_data['token'],
            refresh_token=creds_data['refresh_token'],
            token_uri=creds_data['token_uri'],
            client_id=creds_data['client_id'],
            client_secret=creds_data['client_secret']
        )
        
        # Create a test event
        now = datetime.datetime.utcnow()
        event = create_event(
            service, 
            "Test Event from Meet2Action", 
            "This is a test event created via API", 
            now
        )
        return {"message": "Event created", "link": event.get('htmlLink')}
    except Exception as e:
        return {"error": str(e)}

@router.get("/auth/status")
async def auth_status(request: Request):
    creds = request.session.get('credentials')
    user_info = request.session.get('user_info')
    
    return {
        "isAuthenticated": bool(creds), 
        "user": user_info if creds else None
    }

@router.get("/auth/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out successfully"}
