import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import json

from config import settings
from database import get_db
from models import User
from schemas import FirebaseUser

# Initialize Firebase
try:
    # Parse the JSON string into a dict
    cred_dict = json.loads(settings.FIREBASE_CREDENTIALS)
    cred = credentials.Certificate(cred_dict)

    # Initialize app with the credentials dict
    firebase_admin.initialize_app(cred)
    print("Firebase initialized successfully ✅")

except Exception as e:
    print("Firebase initialization failed - check credentials:", e)

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    try:
        # Verify Firebase token
        decoded_token = auth.verify_id_token(credentials.credentials)
        firebase_uid = decoded_token['uid']
        
        # Get user from database
        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def get_teacher_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Teacher access required")
    return current_user

def get_student_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    return current_user