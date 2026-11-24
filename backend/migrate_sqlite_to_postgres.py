
import sqlite3
from pathlib import Path

from database import get_connection


TABLES = [
    "projects",
    "brand_voices",
    "history",
    "scheduled_posts",
    "documents",
]


def migrate():
    sqlite_path = Path(__file__).with_name("writara.db")

    if not sqlite_path.exists():
        raise FileNotFoundError(f"SQLite database not found: {sqlite_path}")

    sqlite_conn = sqlite3.connect(str(sqlite_path))
    sqlite_conn.row_factory = sqlite3.Row

    pg_conn = None

    try:
        pg_conn = get_connection()
        cursor = pg_conn.cursor()

        # Read source record counts.
        source_counts = {}

        for table in TABLES:
            source_counts[table] = sqlite_conn.execute(
                f'SELECT COUNT(*) FROM "{table}"'
            ).fetchone()[0]

        # Safety check: destination must be empty.
        # This prevents accidentally merging into existing data.
        for table in TABLES:
            cursor.execute(f'SELECT COUNT(*) FROM "{table}"')
            existing_count = cursor.fetchone()[0]

            if existing_count != 0:
                raise RuntimeError(
                    f"Supabase table '{table}' already contains "
                    f"{existing_count} records. Migration stopped."
                )

        print("Starting SQLite to Supabase migration...\n")

        # Copy records in dependency-safe order.
        for table in TABLES:
            source_rows = sqlite_conn.execute(
                f'SELECT * FROM "{table}"'
            ).fetchall()

            if not source_rows:
                print(f"{table}: 0 records to migrate")
                continue

            columns = [
                column[1]
                for column in sqlite_conn.execute(
                    f'PRAGMA table_info("{table}")'
                ).fetchall()
            ]

            column_sql = ", ".join(f'"{column}"' for column in columns)
            placeholders = ", ".join(["?"] * len(columns))

            insert_sql = (
                f'INSERT INTO "{table}" ({column_sql}) '
                f'VALUES ({placeholders}) '
                f'ON CONFLICT ("id") DO NOTHING'
            )

            inserted = 0

            for row in source_rows:
                values = tuple(row[column] for column in columns)
                cursor.execute(insert_sql, values)
                inserted += cursor.rowcount

            print(f"{table}: {inserted} records copied")

        # Verify every destination table before committing.
        print("\nVerifying migration...")

        destination_counts = {}

        for table in TABLES:
            cursor.execute(f'SELECT COUNT(*) FROM "{table}"')
            destination_counts[table] = cursor.fetchone()[0]

            if destination_counts[table] != source_counts[table]:
                raise RuntimeError(
                    f"Count mismatch in {table}: "
                    f"SQLite={source_counts[table]}, "
                    f"Supabase={destination_counts[table]}"
                )

        # Commit only after every count matches.
        pg_conn.commit()

        print("\nMigration completed successfully!")
        print("\nFinal record counts:")

        for table in TABLES:
            print(
                f"{table}: "
                f"SQLite={source_counts[table]}, "
                f"Supabase={destination_counts[table]}"
            )

        print(
            "\nTotal records migrated:",
            sum(destination_counts.values())
        )

    except Exception:
        if pg_conn is not None:
            pg_conn.rollback()

        print("\nMigration failed. PostgreSQL transaction rolled back.")
        raise

    finally:
        if pg_conn is not None:
            pg_conn.close()

        sqlite_conn.close()


if __name__ == "__main__":
    migrate()
