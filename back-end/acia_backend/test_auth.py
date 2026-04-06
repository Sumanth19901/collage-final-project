import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/auth"

def test_auth():
    with open("auth_out.txt", "w") as f:
        f.write("Testing Registration...\n")
        reg_data = {
            "username": "testusery@example.com",
            "email": "testusery@example.com",
            "password": "testpassword123",
            "fullName": "Test User Y"
        }
        try:
            res = requests.post(f"{BASE_URL}/register/", json=reg_data)
            f.write(f"Register status: {res.status_code}\n")
            f.write(f"Register response: {res.text}\n")
            
            # Test duplicate
            f.write("\nTesting Duplicate Registration...\n")
            res2 = requests.post(f"{BASE_URL}/register/", json=reg_data)
            f.write(f"Duplicate status: {res2.status_code}\n")
            f.write(f"Duplicate response: {res2.text}\n")
            
        except Exception as e:
            f.write(f"Failed to connect to server: {e}\n")
            return
            
        f.write("\nTesting Login...\n")
        login_data = {
            "email": "testusery@example.com",
            "password": "testpassword123"
        }
        res = requests.post(f"{BASE_URL}/login/", json=login_data)
        f.write(f"Login status: {res.status_code}\n")
        f.write(f"Login response: {res.text}\n")

if __name__ == "__main__":
    test_auth()
