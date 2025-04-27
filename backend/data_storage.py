import json
import os
from typing import Dict, Any

DATA_DIR = "data"
USERS_FILE = os.path.join(DATA_DIR, "users.json")
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")

def ensure_data_dir():
    """Ensure the data directory exists"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

def load_data(file_path: str) -> Dict[str, Any]:
    """Load data from a JSON file"""
    ensure_data_dir()
    if not os.path.exists(file_path):
        return {}
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}

def save_data(file_path: str, data: Dict[str, Any]):
    """Save data to a JSON file"""
    ensure_data_dir()
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

# User management functions
def get_users() -> Dict[str, Dict[str, Any]]:
    """Get all users"""
    return load_data(USERS_FILE)

def save_user(email: str, user_data: Dict[str, Any]):
    """Save a user"""
    users = get_users()
    users[email] = user_data
    save_data(USERS_FILE, users)

def get_user(email: str) -> Dict[str, Any]:
    """Get a specific user"""
    users = get_users()
    return users.get(email)

# Session management functions
def get_sessions() -> list:
    """Get all scheduled sessions"""
    return load_data(SESSIONS_FILE).get("sessions", [])

def save_session(session_data: Dict[str, Any]):
    """Save a new session"""
    sessions = get_sessions()
    sessions.append(session_data)
    save_data(SESSIONS_FILE, {"sessions": sessions}) 