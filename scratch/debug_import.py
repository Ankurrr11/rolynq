import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app import app
    print("Successfully imported app!")
except Exception as e:
    import traceback
    traceback.print_exc()
