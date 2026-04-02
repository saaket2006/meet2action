import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from core.logger import get_logger

logger = get_logger("DriveService")

def get_drive_service(access_token, refresh_token, token_uri, client_id, client_secret):
    """
    Builds and returns an authorized Drive API service.
    """
    try:
        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri=token_uri,
            client_id=client_id,
            client_secret=client_secret,
            scopes=['https://www.googleapis.com/auth/drive.file']
        )
        
        service = build('drive', 'v3', credentials=creds)
        return service
    except Exception as e:
        logger.error(f"Error building drive service: {e}")
        raise

def upload_file(service, file_path, name=None, mime_type=None, parent_id=None):
    """
    Uploads a file to Google Drive.
    :param service: Authorized Drive API service instance.
    :param file_path: Local path to the file to upload.
    :param name: Optional name for the file on Drive (defaults to local file name).
    :param mime_type: Optional MIME type for the file.
    :param parent_id: Optional ID of the parent folder.
    :return: The uploaded file metadata.
    """
    if name is None:
        name = os.path.basename(file_path)
        
    file_metadata = {'name': name}
    if parent_id:
        file_metadata['parents'] = [parent_id]
        
    media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
    
    try:
        file = service.files().create(body=file_metadata,
                                    media_body=media,
                                    fields='id, webViewLink').execute()
        logger.info(f"File uploaded: {file.get('webViewLink')}")
        return file
    except Exception as e:
        logger.error(f"Error uploading file to Drive: {e}")
        raise
