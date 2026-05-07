
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from outreach_engine import generate_outreach

profile = {
    "name": "Ankur",
    "current_role": "APM",
    "key_skills": ["Python", "AI"]
}

job = {
    "title": "Product Manager",
    "company": "Google",
    "description": "Looking for a Product Manager with Python and AI skills."
}

try:
    res = generate_outreach(job, profile, lead_name="John Doe")
    print("SUCCESS")
    print(res)
except Exception as e:
    print(f"FAILED: {e}")
