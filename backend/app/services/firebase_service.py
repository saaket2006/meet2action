
import firebase_admin
from firebase_admin import credentials, auth
import os
from core.logger import get_logger

logger = get_logger("FirebaseAdmin")

# Initialize Firebase Admin
# NOTE: Requires FIREBASE_SERVICE_ACCOUNT_PATH in environment
try:
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully.")
    else:
        # Fallback for dev if path is not set, the verification will fail but app won't crash
        logger.warning("Firebase Admin SDK NOT initialized. Path is missing or incorrect.")
except Exception as e:
    logger.error(f"Error initializing Firebase Admin SDK: {e}")

def verify_token(token: str):
    """
    Verifies the ID token from the frontend and returns user info.
    """
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Failed to verify ID token: {e}")
        return None
