import sqlite3
import os

db_path = 'physics.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, role, class_name FROM users")
    users = cursor.fetchall()
    print("Users in 'users' table:")
    for u in users:
        print(f" - {u[0]}: {u[1]} (Role: {u[2]}, Class: {u[3]})")
    conn.close()
else:
    print(f"Error: {db_path} not found.")
