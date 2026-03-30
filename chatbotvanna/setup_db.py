import os
import psycopg2
from pathlib import Path
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv(override=True)


def _get_env(primary: str, fallback: str, default: str) -> str:
    value = os.getenv(primary)
    if value:
        return value
    value = os.getenv(fallback)
    if value:
        return value
    return default


def _get_database_url() -> str | None:
    return os.getenv("DATABASE_URL") or os.getenv("HASURA_GRAPHQL_DATABASE_URL")

def setup_database():
    database_url = _get_database_url()

    host = _get_env("POSTGRES_HOST", "DB_HOST", "127.0.0.1")
    port = _get_env("POSTGRES_PORT", "DB_PORT", "5432")
    dbname = _get_env("POSTGRES_DB", "DB_NAME", "internhub")
    user = _get_env("POSTGRES_USER", "DB_USER", "postgres")
    password = _get_env("POSTGRES_PASSWORD", "DB_PASSWORD", "postgres")

    if database_url:
        parsed = urlparse(database_url)
        safe_host = parsed.hostname or host
        safe_port = parsed.port or port
        safe_dbname = (parsed.path or "").lstrip("/") or dbname
        safe_user = parsed.username or user
        print(f"Connecting via DATABASE_URL to database {safe_dbname} at {safe_host}:{safe_port} as {safe_user}...")
    else:
        print(f"Connecting to database {dbname} at {host}:{port} as {user}...")
        print("Connection source: POSTGRES_*/DB_* variables from .env")

    try:
        if database_url:
            conn = psycopg2.connect(database_url)
        else:
            conn = psycopg2.connect(
                host=host,
                port=port,
                dbname=dbname,
                user=user,
                password=password
            )
        conn.autocommit = True
        cursor = conn.cursor()

        print("Connection successful. Reading schema.sql...")
        schema_path = Path(__file__).resolve().parent / "schema.sql"
        with open(schema_path, "r", encoding="utf-8") as f:
            sql_script = f.read()

        print("Executing schema...")
        cursor.execute(sql_script)

        print("Schema applied successfully!")
        
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error setting up database: {e}")
        if "password authentication failed" in str(e):
            print("Hint: credentials in .env do not match PostgreSQL user password.")
            print("Use the same credentials Hasura uses, or set DATABASE_URL/HASURA_GRAPHQL_DATABASE_URL in .env.")
        raise

if __name__ == "__main__":
    setup_database()
