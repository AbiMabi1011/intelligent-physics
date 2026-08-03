import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect

load_dotenv()

db_url = os.getenv("DATABASE_URL", "sqlite:///./physics.db")
print("DATABASE_URL:", db_url)

try:
    engine = create_engine(db_url)
    inspector = inspect(engine)
    
    print("\nTables in database:")
    tables = inspector.get_table_names()
    print(tables)
    
    for table in ["quizzes", "questions"]:
        if table in tables:
            print(f"\nColumns in '{table}':")
            for col in inspector.get_columns(table):
                print(f"  {col['name']}: {col['type']}")
        else:
            print(f"\nTable '{table}' does NOT exist!")
            
except Exception as e:
    print("Error:", e)
