from sqlalchemy import create_engine, text

# Replace with your actual connection string
engine = create_engine("postgresql://postgres:1234@localhost:5432/chronocampus_db")

# Connect
with engine.connect() as conn:
    # Use text() for raw SQL
    result = conn.execute(text("SELECT 1"))
    print(result.fetchone())