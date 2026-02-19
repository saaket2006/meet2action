import requests
import sys

print("Starting test...", file=sys.stderr)
try:
    print("Sending request...", file=sys.stderr)
    response = requests.get("http://127.0.0.1:8000/auth/status", timeout=5)
    print(f"Status Code: {response.status_code}", file=sys.stderr)
    print(f"Response: {response.text}", file=sys.stderr)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
print("Test finished.", file=sys.stderr)
