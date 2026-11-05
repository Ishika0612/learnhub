
from sqlalchemy import text

from app.db.postgres import Base, engine
from app.models.user import User  # noqa: F401
from app.models.course import Course


async def create_tables() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        await connection.execute(
            text(
                "ALTER TABLE users "
                "ADD COLUMN IF NOT EXISTS instructor_status VARCHAR(16)"
            )
        )
        await connection.execute(
            text(
                "ALTER TABLE users "
                "ADD COLUMN IF NOT EXISTS instructor_rejection_reason TEXT"
            )
        )
        await connection.execute(
            text(
                "UPDATE users "
                "SET instructor_status = 'approved' "
                "WHERE role::text IN ('INSTRUCTOR', 'instructor') "
                "AND instructor_status IS NULL"
            )
        )
