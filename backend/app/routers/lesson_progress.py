
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.models.course import Course, CourseStatus
from app.models.enrollment import Enrollment
from app.models.lesson import Lesson
from app.models.lesson_progress import LessonProgress
from app.models.user import User, UserRole
from app.routers.auth import get_current_user
from app.schemas.lesson_progress import (
    LessonCompletionUpdate,
    LessonProgressResponse,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["Lesson Progress"],
)


def require_student(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=403,
            detail="Only students can update lesson progress",
        )
    return current_user


@router.patch(
    "/lessons/{lesson_id}/progress",
    response_model=LessonProgressResponse,
)
async def update_lesson_progress(
    lesson_id: int,
    data: LessonCompletionUpdate,
    db: AsyncSession = Depends(get_db),
    student: User = Depends(require_student),
):
    result = await db.execute(
        select(Lesson)
        .join(Course, Course.id == Lesson.course_id)
        .where(
            Lesson.id == lesson_id,
            Course.status == CourseStatus.APPROVED,
        )
    )
    lesson = result.scalar_one_or_none()

    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")

    enrollment_result = await db.execute(
        select(Enrollment).where(
            Enrollment.student_id == student.id,
            Enrollment.course_id == lesson.course_id,
        )
    )
    enrollment = enrollment_result.scalar_one_or_none()

    if enrollment is None:
        raise HTTPException(
            status_code=403,
            detail="You must be enrolled in this course",
        )

    progress_result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.student_id == student.id,
            LessonProgress.lesson_id == lesson_id,
        )
    )
    progress = progress_result.scalar_one_or_none()

    if progress is None:
        progress = LessonProgress(
            student_id=student.id,
            lesson_id=lesson_id,
            is_completed=data.is_completed,
            completed_at=(
                datetime.now(timezone.utc)
                if data.is_completed
                else None
            ),
        )
        db.add(progress)
    else:
        progress.is_completed = data.is_completed
        progress.completed_at = (
            datetime.now(timezone.utc)
            if data.is_completed
            else None
        )

    await db.flush()

    # Calculate progress using the lessons in this course.
    total_result = await db.execute(
        select(func.count(Lesson.id)).where(
            Lesson.course_id == lesson.course_id
        )
    )
    total_lessons = total_result.scalar_one()

    completed_result = await db.execute(
        select(func.count(LessonProgress.id))
        .join(Lesson, Lesson.id == LessonProgress.lesson_id)
        .where(
            Lesson.course_id == lesson.course_id,
            LessonProgress.student_id == student.id,
            LessonProgress.is_completed.is_(True),
        )
    )
    completed_lessons = completed_result.scalar_one()

    enrollment.progress = (
        round(completed_lessons * 100 / total_lessons)
        if total_lessons > 0
        else 0
    )

    await db.commit()
    await db.refresh(progress)

    return progress


@router.get(
    "/courses/{course_id}/my-lesson-progress",
    response_model=list[LessonProgressResponse],
)
async def get_my_lesson_progress(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    student: User = Depends(require_student),
):
    enrollment_result = await db.execute(
        select(Enrollment).where(
            Enrollment.student_id == student.id,
            Enrollment.course_id == course_id,
        )
    )

    if enrollment_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=403,
            detail="You must be enrolled in this course",
        )

    result = await db.execute(
        select(LessonProgress)
        .join(Lesson, Lesson.id == LessonProgress.lesson_id)
        .where(
            Lesson.course_id == course_id,
            LessonProgress.student_id == student.id,
        )
        .order_by(Lesson.position.asc(), Lesson.id.asc())
    )

    return result.scalars().all()
