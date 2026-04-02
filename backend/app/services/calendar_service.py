import os
import datetime
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from core.logger import get_logger

logger = get_logger("CalendarService")

def get_calendar_service(access_token, refresh_token, token_uri, client_id, client_secret):
    """
    Builds and returns an authorized Calendar API service.
    """
    try:
        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri=token_uri,
            client_id=client_id,
            client_secret=client_secret,
            scopes=['https://www.googleapis.com/auth/calendar']
        )
        
        service = build('calendar', 'v3', credentials=creds)
        return service
    except Exception as e:
        logger.error(f"Error building calendar service: {e}")
        raise

def create_event(service, summary, description, start_time, end_time=None):
    """
    Creates an event in the user's primary calendar.
    :param service: Authorized Calendar API service instance.
    :param summary: Title of the event.
    :param description: Description of the event.
    :param start_time: datetime object for when the event starts.
    :param end_time: datetime object for when the event ends (defaults to 1 hour after start).
    :return: The created event object.
    """
    if end_time is None:
        end_time = start_time + datetime.timedelta(hours=1)
        
    event = {
        'summary': summary,
        'description': description,
        'start': {
            'dateTime': start_time.isoformat(),
            'timeZone': 'UTC', # Adjust as necessary or get from user preference
        },
        'end': {
            'dateTime': end_time.isoformat(),
            'timeZone': 'UTC',
        },
    }
    
    try:
        event_result = service.events().insert(calendarId='primary', body=event).execute()
        logger.info(f"Event created: {event_result.get('htmlLink')}")
        return event_result
    except Exception as e:
        logger.error(f"Error creating event: {e}")
        raise

def list_calendars(service):
    """
    Lists the calendars available in the user's Google account.
    """
    try:
        calendar_list = service.calendarList().list().execute()
        calendars = []
        for entry in calendar_list.get('items', []):
            calendars.append({
                'id': entry.get('id'),
                'summary': entry.get('summary'),
                'primary': entry.get('primary', False),
                'accessRole': entry.get('accessRole')
            })
        return calendars
    except Exception as e:
        logger.error(f"Error listing calendars: {e}")
        raise
