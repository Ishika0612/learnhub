
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.db.init_db import create_tables
from app.routers.auth import router as auth_router
from app.routers.profile import router as profile_router
from app.routers.courses import router as courses_router
from app.routers.admin_courses import router as admin_courses_router
from app.routers.admin_instructors import router as admin_instructors_router
from app.routers import enrollments
from app.routers import lessons
from app.routers import lesson_progress
from app.routers import dashboard
from app.routers import reviews

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(
    title="LearnHub API",
    description="Backend API for the LearnHub LMS",
    version="1.0.0",
    lifespan=lifespan,
)

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(courses_router)
app.include_router(admin_courses_router)
app.include_router(admin_instructors_router)
app.include_router(enrollments.router)
app.include_router(lessons.router)
app.include_router(lesson_progress.router)
app.include_router(dashboard.router)
app.include_router(
    reviews.router,
    prefix="/api/v1",
)

@app.get("/")
async def root():
    return {"message": "Welcome to LearnHub API"}


@app.get("/api/v1/health")
async def health_check():
    return {
        "success": True,
        "message": "LearnHub API is running",
        "status": "healthy",
    }


@app.get("/api/v1/health/database")
async def database_health(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT 1"))
    return {
        "success": result.scalar_one() == 1,
        "database": "postgresql",
        "status": "connected",
    }
