from fastapi import APIRouter, Depends, HTTPException, Header
from app.services.google_auth_service import verify_google_token
from core.logger import get_logger

router = APIRouter()
logger = get_logger("AuthRouter")

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split("Bearer ")[1]
    decoded_token = verify_google_token(token)
    
    if not decoded_token:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    
    return decoded_token

@router.get("/auth/test-google")
async def test_auth(user: dict = Depends(get_current_user)):
    """
    Test endpoint to verify Google token is being passed and verified.
    """
    return {"message": "Google authentication confirmed", "user_email": user.get('email')}

@router.get("/auth/status")
async def auth_status():
    """
    Status endpoint.
    """
    return {"message": "Google OAuth is configured on the backend."}

