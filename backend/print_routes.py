import sys
import os

# Add the directory containing 'app' to sys.path
# We are in backend/
# app is in backend/app/
# So we need to add backend/ to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

try:
    from app.main import app
    print("SUCCESS: Imported app")
    print("Registered Routes:")
    for route in app.routes:
        if hasattr(route, "path"):
            print(f"- {route.path}")
except ImportError as e:
    print(f"ERROR: Could not import app: {e}")
except Exception as e:
    print(f"ERROR: {e}")
