from fastapi import APIRouter, Depends, HTTPException, Header
from app.services.firebase_service import verify_token
from core.logger import get_logger

router = APIRouter()
logger = get_logger("AuthRouter")

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split("Bearer ")[1]
    decoded_token = verify_token(token)
    
    if not decoded_token:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
    
    return decoded_token

@router.get("/auth/test-firebase")
async def test_auth(user: dict = Depends(get_current_user)):
    """
    Test endpoint to verify Firebase token is being passed and verified.
    """
    return {"message": "Firebase authentication confirmed", "user_email": user.get('email')}

@router.get("/auth/status")
async def auth_status():
    """
    Status endpoint. For Firebase, the true status is determined by tokens on the frontend.
    This remains for compatibility with existing components if needed.
    """
    return {"message": "Firebase Auth is configured on the backend."}
