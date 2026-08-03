import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import models

load_dotenv()

SQLITE_URL = "sqlite:///./physics.db"
MYSQL_URL = os.getenv("DATABASE_URL")

if not MYSQL_URL or MYSQL_URL.startswith("sqlite"):
    print("Error: MySQL DATABASE_URL is not configured in backend/.env!")
    exit(1)

print("Starting migration from SQLite to MySQL...")
print(f"Source: {SQLITE_URL}")
print(f"Destination: {MYSQL_URL}")

sqlite_engine = create_engine(SQLITE_URL)
mysql_engine = create_engine(MYSQL_URL)

SqliteSession = sessionmaker(bind=sqlite_engine)
MysqlSession = sessionmaker(bind=mysql_engine)

sqlite_session = SqliteSession()
mysql_session = MysqlSession()

connection = mysql_engine.connect()
transaction = connection.begin()

try:
    # Disable foreign key checks
    connection.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
    
    metadata = models.Base.metadata
    
    # Migrate tables in dependency order
    for table in metadata.sorted_tables:
        table_name = table.name
        print(f"\nMigrating table: {table_name}...")
        
        # Clear default populated rows to prevent duplicates
        connection.execute(text(f"TRUNCATE TABLE {table_name};"))
        
        # Fetch rows from SQLite
        with sqlite_engine.connect() as sqlite_conn:
            rows = sqlite_conn.execute(table.select()).fetchall()
            
        print(f"Found {len(rows)} rows in SQLite.")
        
        if rows:
            insert_data = [dict(row._mapping) for row in rows]
            # Insert rows into MySQL
            connection.execute(table.insert(), insert_data)
            print(f"Successfully migrated {len(insert_data)} records to MySQL.")
            
    # Re-enable foreign key checks
    connection.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
    transaction.commit()
    print("\nMigration completed successfully! All data migrated to MySQL.")
except Exception as e:
    transaction.rollback()
    print(f"\nError during migration: {str(e)}")
finally:
    sqlite_session.close()
    mysql_session.close()
    connection.close()
