import sqlite3
import os

db_path = 'physics.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT email, hashed_password FROM users")
    users = cursor.fetchall()
    print("Users in 'users' table:")
    for u in users:
        has_pw = "YES" if u[1] else "NO"
        print(f" - {u[0]}: Password Set: {has_pw}")
    conn.close()
else:
    print(f"Error: {db_path} not found.")
