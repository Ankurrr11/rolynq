import sqlite3
conn = sqlite3.connect('instance/rolynq.db')
cursor = conn.cursor()
cursor.execute("SELECT description FROM job_record WHERE company='NxtWave' AND title='Chief of Staff'")
row = cursor.fetchone()
if row:
    print(f"LEN: {len(row[0])}")
    print(row[0])
else:
    print("Not found")
conn.close()
