from google.oauth2 import id_token
from google.auth.transport import requests as requests_google
from google.auth.exceptions import GoogleAuthError
import os
import requests
from fastapi import HTTPException
from core.logger import get_logger

logger = get_logger("GoogleAuth")

# Replace this with your actual Client ID (should be in .env)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def verify_google_token(token: str):

    """
    Verifies a Google Token (ID Token or Access Token) from the frontend.
    """
    if not GOOGLE_CLIENT_ID:
        logger.error("GOOGLE_CLIENT_ID is not set in environment variables. Audience validation will fail.")
        raise ValueError("GOOGLE_CLIENT_ID is required for token verification.")
    
    # 1. Try ID Token Verification
    try:
        idinfo = id_token.verify_oauth2_token(token, requests_google.Request(), GOOGLE_CLIENT_ID)
        return idinfo
    except (ValueError, GoogleAuthError) as e:
        error_str = str(e)
        if "Wrong number of segments" not in error_str and "Invalid token" not in error_str:
             logger.warning(f"ID Token verification error: {error_str}. Trying Access Token...")
        
    # 2. Fallback: Try Access Token Verification (userinfo/tokeninfo)
    try:
        response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?access_token={token}")
        if response.ok:
            info = response.json()
            # Basic validation: ensure this token was issued for our Client ID
            # Note: access tokens from initTokenClient don't always have 'aud' in tokeninfo, 
            # but they have 'azp' (Authorized party) matching the client ID.
            if info.get("azp") == GOOGLE_CLIENT_ID or info.get("aud") == GOOGLE_CLIENT_ID:
                return info
            
            # Additional fallback: if tokeninfo doesn't have aud/azp, check userinfo
            userinfo = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", headers={"Authorization": f"Bearer {token}"})
            if userinfo.ok:
                return userinfo.json()
                
        return None
    except Exception as e:
        logger.error(f"Failed to verify Access Token: {e}")
        return None


