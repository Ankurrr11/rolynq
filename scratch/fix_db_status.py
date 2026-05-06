import sqlite3
import os

db_path = 'instance/rolynq.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE job_record ADD COLUMN status TEXT DEFAULT 'interested'")
        conn.commit()
        print("Successfully added status column to job_record table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column status already exists.")
        else:
            print(f"Error: {e}")
    conn.close()
else:
    print(f"Database not found at {db_path}")
