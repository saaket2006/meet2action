import urllib.request
import sys

def check_url(url):
    print(f"Checking {url}...", flush=True)
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            print(f"Status: {response.status}", flush=True)
            print(f"Body: {response.read().decode('utf-8')}", flush=True)
    except Exception as e:
        print(f"Error: {e}", flush=True)

if __name__ == "__main__":
    check_url("http://127.0.0.1:8000/health")
    check_url("http://127.0.0.1:8000/auth/status")
