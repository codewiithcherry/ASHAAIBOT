from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from services.chatbot import ChatbotService
from services.job_scraper import JobScraper
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import JWTError, jwt
from data_storage import get_users, save_user, get_user, get_sessions, save_session
import json

load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ashaaibot.vercel.app/"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Constants ---
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "a_very_secret_key_please_change") # Use env var in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- In-Memory Database (Replace with real DB for production) ---
fake_users_db: Dict[str, Dict[str, Any]] = {}

# --- OAuth2 Scheme ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# --- Pydantic Models ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    hashed_password: str

class User(UserBase):
    id: str # Using email as ID for simplicity here
    disabled: Optional[bool] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None # Made optional as frontend sends it but service adds it too

class ChatRequest(BaseModel):
    messages: List[Message]
    user_input: str

class ChatResponse(BaseModel):
    response: str
    conversation_history: List[Message]
    status: str

class SessionRequest(BaseModel):
    mentorName: str
    date: str
    time: str

# --- Utility Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(token_data.email)
    if user is None:
        raise credentials_exception
    # You might want to check if the user is active/disabled here
    # if user.disabled:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return User(id=token_data.email, email=token_data.email, full_name=user.get("full_name"))


# --- FastAPI App ---
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize services
chatbot_service = ChatbotService()
job_scraper = JobScraper()

# In-memory storage for scheduled sessions
scheduled_sessions = []

# --- Authentication Endpoints ---
@app.post("/api/auth/register", response_model=User)
async def register_user(user_in: UserCreate):
    print(f"Registration attempt received for email: {user_in.email}")
    
    # Check if user already exists
    if get_user(user_in.email):
        print(f"Email already registered: {user_in.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        print("Hashing password...")
        hashed_password = get_password_hash(user_in.password)
        user_db_data = {
            "email": user_in.email,
            "full_name": user_in.full_name,
            "hashed_password": hashed_password,
            "disabled": False
        }
        save_user(user_in.email, user_db_data)
        print(f"Successfully registered user: {user_in.email}")
        return User(id=user_in.email, email=user_in.email, full_name=user_in.full_name)
    except Exception as e:
        print(f"Error during registration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/api/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    # The Depends(get_current_user) handles token validation and fetching user
    return current_user

# --- Existing Endpoints (Chat & Jobs) ---
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest): # Consider adding current_user: User = Depends(get_current_user) if chats should be user-specific
    try:
        # Convert messages Pydantic models to dicts for the service
        conversation_history = [msg.model_dump() for msg in request.messages]

        result = chatbot_service.generate_response(
            conversation_history=conversation_history,
            user_input=request.user_input
        )

        # Convert response dicts back to Message models
        response_messages = [Message(**msg) for msg in result["conversation_history"]]

        return ChatResponse(
            response=result["response"],
            conversation_history=response_messages,
            status=result["status"]
        )

    except Exception as e:
        print(f"Error in /api/chat: {e}") # Added print for debugging
        # Consider more specific error handling or logging
        raise HTTPException(status_code=500, detail="Internal server error during chat processing")


@app.get("/api/jobs")
async def get_jobs(query: str = None, location: str = None): # Consider adding current_user: User = Depends(get_current_user) if access should be restricted
    try:
        jobs = job_scraper.search_jobs(query, location)
        return {"jobs": jobs}
    except Exception as e:
        print(f"Error in /api/jobs: {e}") # Added print for debugging
        raise HTTPException(status_code=500, detail="Internal server error during job search")

@app.post("/api/schedule-session")
async def schedule_session(session: SessionRequest):
    try:
        # Validate date format
        datetime.strptime(session.date, '%Y-%m-%d')
        
        # Save session to persistent storage
        session_data = {
            "mentorName": session.mentorName,
            "date": session.date,
            "time": session.time,
            "status": "scheduled"
        }
        save_session(session_data)
        
        return {"message": "Session scheduled successfully"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scheduled-sessions")
async def get_scheduled_sessions():
    return get_sessions()

# --- Main Execution ---
if __name__ == "__main__":
    import uvicorn
    # Ensure JWT_SECRET_KEY is set, generate one if not for local dev
    if not os.getenv("JWT_SECRET_KEY"):
        print("WARNING: JWT_SECRET_KEY not set, using default. SET THIS IN YOUR .env FILE FOR PRODUCTION.")
        # You might want to generate and save a key to .env here automatically for dev
    uvicorn.run(app, host="0.0.0.0", port=8000) 
