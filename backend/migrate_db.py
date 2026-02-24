import sqlite3
import os

db_path = "f:/Intelligent Physics/backend/physics.db"

def migrate():
    if not os.path.exists(db_path):
        print("Database not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if role column exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "role" not in columns:
        print("Adding role column...")
        cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student'")
        print("Role column added.")
    else:
        print("Role column already exists.")

    # Ensure admin role for 'raakul'
    cursor.execute("UPDATE users SET role = 'admin' WHERE email = 'raakul'")
    if cursor.rowcount > 0:
        print("Updated 'raakul' to admin.")
    else:
        print("'raakul' user not found in DB.")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
