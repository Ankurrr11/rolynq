"""ankur.hunt setup verification. Run: python setup.py"""
import os, sys
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

def ck(label, ok, fix=""):
    c = "[OK]" if ok else "[FAIL]"
    print(f"  {c} {label}")
    if not ok and fix: print(f"    → {fix}")
    return ok

def main():
    print("\n  ankur.hunt setup check\n")
    ok = True
    ok &= ck("SERPAPI_KEY", bool(os.getenv("SERPAPI_KEY")), "https://serpapi.com")
    ok &= ck("GOOGLE_SHEETS_ID", bool(os.getenv("GOOGLE_SHEETS_ID")), "Create sheet at sheets.google.com")
    ok &= ck("NOTION_TOKEN", bool(os.getenv("NOTION_TOKEN")), "https://notion.so/my-integrations")
    ok &= ck("NOTION_DATABASE_ID", bool(os.getenv("NOTION_DATABASE_ID")), "Run: python create_notion_db.py <page_id>")
    ok &= ck("credentials.json", (Path(__file__).parent/"credentials.json").exists(), "Download from Google Cloud Console")
    print(f"\n  {'All good! Run: python app.py' if ok else 'Fix issues above, then run again.'}\n")

if __name__ == "__main__": main()
