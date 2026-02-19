import requests

try:
    response = requests.get("http://localhost:8000/auth/google/login?summary=Test&deadline=2024-01-01", allow_redirects=False)
    print(f"Status Code: {response.status_code}")
    print(f"Location: {response.headers.get('Location')}")
    if response.status_code == 307:
        print("Redirect is working correctly.")
    else:
        print("Redirect failed.")
except Exception as e:
    print(f"Error: {e}")
