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

    # Check if created_at column exists in quiz_results
    cursor.execute("PRAGMA table_info(quiz_results)")
    qr_columns = [col[1] for col in cursor.fetchall()]

    if "created_at" not in qr_columns:
        print("Adding created_at column to quiz_results...")
        cursor.execute("ALTER TABLE quiz_results ADD COLUMN created_at TEXT DEFAULT '2026-02-24'")
        print("created_at column added to quiz_results.")
    else:
        print("created_at column already exists in quiz_results.")

    if "approval_status" not in columns:
        print("Adding approval_status column to users...")
        cursor.execute("ALTER TABLE users ADD COLUMN approval_status TEXT DEFAULT 'approved'")
        print("approval_status column added to users.")
    else:
        print("approval_status column already exists in users.")

    # Check for question option_e
    cursor.execute("PRAGMA table_info(questions)")
    q_columns = [col[1] for col in cursor.fetchall()]
    if "option_e" not in q_columns:
        print("Adding option_e column to questions...")
        cursor.execute("ALTER TABLE questions ADD COLUMN option_e TEXT")
        print("option_e column added.")

    # Check for quiz class_name
    cursor.execute("PRAGMA table_info(quizzes)")
    quiz_cols = [col[1] for col in cursor.fetchall()]
    if "class_name" not in quiz_cols:
        print("Adding class_name column to quizzes...")
        cursor.execute("ALTER TABLE quizzes ADD COLUMN class_name TEXT")
        print("class_name column added.")
        
    if "is_published" not in quiz_cols:
        print("Adding is_published column to quizzes...")
        cursor.execute("ALTER TABLE quizzes ADD COLUMN is_published INTEGER DEFAULT 0")
        print("is_published column added.")
        
    if "scheduled_time" not in quiz_cols:
        print("Adding scheduled_time column to quizzes...")
        cursor.execute("ALTER TABLE quizzes ADD COLUMN scheduled_time TEXT")
        print("scheduled_time column added.")
        
    if "duration_minutes" not in quiz_cols:
        print("Adding duration_minutes column to quizzes...")
        cursor.execute("ALTER TABLE quizzes ADD COLUMN duration_minutes INTEGER DEFAULT 30")
        print("duration_minutes column added.")
        
    if "expiry_mode" not in quiz_cols:
        print("Adding expiry_mode column to quizzes...")
        cursor.execute("ALTER TABLE quizzes ADD COLUMN expiry_mode TEXT DEFAULT 'end_time'")
        print("expiry_mode column added.")
        
    if "expiry_days" not in quiz_cols:
        print("Adding expiry_days column to quizzes...")
        cursor.execute("ALTER TABLE quizzes ADD COLUMN expiry_days INTEGER DEFAULT 1")
        print("expiry_days column added.")

    # Check if paper_type exists in study_papers
    cursor.execute("PRAGMA table_info(study_papers)")
    papers_columns = [col[1] for col in cursor.fetchall()]
    
    if "paper_type" not in papers_columns:
        print("Adding paper_type column to study_papers...")
        cursor.execute("ALTER TABLE study_papers ADD COLUMN paper_type TEXT DEFAULT 'Other'")
        print("paper_type column added.")
    
    if "scheme_url" not in papers_columns:
        print("Adding scheme_url column to study_papers...")
        cursor.execute("ALTER TABLE study_papers ADD COLUMN scheme_url TEXT")
        print("scheme_url column added.")

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='announcements'")
    if not cursor.fetchone():
        print("Creating announcements table...")
        cursor.execute('''
            CREATE TABLE announcements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR,
                content TEXT,
                image_url VARCHAR,
                class_name VARCHAR,
                created_at VARCHAR
            )
        ''')
        print("announcements table created.")

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='class_recordings'")
    if not cursor.fetchone():
        print("Creating class_recordings table...")
        cursor.execute('''
            CREATE TABLE class_recordings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR,
                description TEXT,
                video_url VARCHAR,
                class_name VARCHAR,
                subject VARCHAR DEFAULT "Physics",
                recorded_at VARCHAR
            )
        ''')
        print("class_recordings table created.")

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sliders'")
    if not cursor.fetchone():
        print("Creating sliders table...")
        cursor.execute('''
            CREATE TABLE sliders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR NOT NULL,
                subtitle VARCHAR,
                image_url VARCHAR NOT NULL,
                button_text VARCHAR,
                button_link VARCHAR,
                is_active BOOLEAN DEFAULT 1,
                order_index INTEGER DEFAULT 0
            )
        ''')
        print("sliders table created.")

    # Check and add visibility column to study_papers, announcements, class_recordings
    tables_to_check = ['study_papers', 'announcements', 'class_recordings']
    for table in tables_to_check:
        cursor.execute(f"PRAGMA table_info({table})")
        cols = [col[1] for col in cursor.fetchall()]
        if "visibility" not in cols:
            print(f"Adding visibility column to {table}...")
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN visibility TEXT DEFAULT 'both'")
            print(f"visibility column added to {table}.")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
