import requests
import json

# Test user credentials
TEST_USER = {
    "email": "test@example.com",
    "password": "test123",
    "full_name": "Test User"
}

# API endpoints
BASE_URL = "http://localhost:8000"
REGISTER_URL = f"{BASE_URL}/api/auth/register"
LOGIN_URL = f"{BASE_URL}/api/auth/token"

def test_auth():
    print("Testing authentication flow...")
    
    # Register user
    print("\n1. Registering user...")
    try:
        register_response = requests.post(
            REGISTER_URL,
            json=TEST_USER,
            headers={"Content-Type": "application/json"}
        )
        print(f"Register response status: {register_response.status_code}")
        print(f"Register response: {register_response.text}")
    except Exception as e:
        print(f"Error during registration: {str(e)}")
        return

    # Login user
    print("\n2. Logging in user...")
    try:
        login_data = {
            "username": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        login_response = requests.post(
            LOGIN_URL,
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        print(f"Login response status: {login_response.status_code}")
        print(f"Login response: {login_response.text}")
    except Exception as e:
        print(f"Error during login: {str(e)}")
        return

if __name__ == "__main__":
    test_auth() 