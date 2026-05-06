"""Create Notion database for ankur.hunt. Usage: python create_notion_db.py <parent_page_id>"""
import os, sys
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

def main():
    from notion_client import Client
    token = os.getenv("NOTION_TOKEN")
    if not token: print("Error: NOTION_TOKEN not set"); sys.exit(1)
    if len(sys.argv) < 2: print("Usage: python create_notion_db.py <parent_page_id>"); sys.exit(1)
    db = Client(auth=token).databases.create(
        parent={"type":"page_id","page_id":sys.argv[1]},
        title=[{"type":"text","text":{"content":"ankur.hunt Pipeline"}}],
        properties={
            "Name":{"title":{}},"Company":{"rich_text":{}},
            "Score":{"number":{"format":"number"}},
            "Status":{"select":{"options":[{"name":"Hot Lead","color":"green"},{"name":"Warm","color":"yellow"},{"name":"Monitor","color":"gray"},{"name":"Applied","color":"blue"}]}},
            "Location":{"rich_text":{}},
            "Action":{"select":{"options":[{"name":"apply","color":"green"},{"name":"email","color":"blue"},{"name":"save","color":"yellow"},{"name":"skip","color":"gray"}]}},
        })
    print(f"\nDatabase created! ID: {db['id']}\nAdd to .env: NOTION_DATABASE_ID={db['id']}")

if __name__ == "__main__": main()
