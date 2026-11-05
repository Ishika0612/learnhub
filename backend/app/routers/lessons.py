
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.postgres import get_db
from app.models.course import Course, CourseStatus
from app.models.enrollment import Enrollment
from app.models.lesson import Lesson
from app.models.user import InstructorApprovalStatus, User, UserRole
from app.routers.auth import get_current_user, require_approved_instructor
from app.schemas.lesson import LessonCreate, LessonResponse

router = APIRouter(
    prefix="/api/v1",
    tags=["Lessons"],
)


@router.post(
    "/courses/{course_id}/lessons",
    response_model=LessonResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_lesson(
    course_id: int,
    lesson_data: LessonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_approved_instructor),
):
    result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()

    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only add lessons to your own courses",
        )

    lesson = Lesson(
        course_id=course_id,
        **lesson_data.model_dump(),
    )

    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)

    return lesson


@router.get(
    "/courses/{course_id}/lessons",
    response_model=list[LessonResponse],
)
async def list_course_lessons(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if (
        current_user.role == UserRole.INSTRUCTOR
        and current_user.instructor_status != InstructorApprovalStatus.APPROVED
    ):
        raise HTTPException(
            status_code=403,
            detail="Only approved instructors can access instructor features",
        )

    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()

    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    # The course instructor can preview their own curriculum.
    is_owner = (
        current_user.role == UserRole.INSTRUCTOR
        and course.instructor_id == current_user.id
    )

    # Other users must be students enrolled in the course.
    if not is_owner:
        if current_user.role != UserRole.STUDENT:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to view these lessons",
            )

        if course.status != CourseStatus.APPROVED:
            raise HTTPException(
                status_code=404,
                detail="Course not found",
            )

        enrollment_result = await db.execute(
            select(Enrollment).where(
                Enrollment.student_id == current_user.id,
                Enrollment.course_id == course_id,
            )
        )

        if enrollment_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=403,
                detail="Enroll in this course to access its lessons",
            )

    result = await db.execute(
        select(Lesson)
        .where(Lesson.course_id == course_id)
        .order_by(Lesson.position.asc(), Lesson.id.asc())
    )

    return result.scalars().all()

@router.patch(
    "/lessons/{lesson_id}",
    response_model=LessonResponse,
)
async def update_lesson(
    lesson_id: int,
    lesson_data: LessonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_approved_instructor),
):
    result = await db.execute(
        select(Lesson)
        .join(Course, Course.id == Lesson.course_id)
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()

    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if lesson.course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only edit lessons in your own courses",
        )

    for field, value in lesson_data.model_dump().items():
        if field == "video_url" and value is not None:
            value = str(value)
        setattr(lesson, field, value)

    await db.commit()
    await db.refresh(lesson)

    return lesson


@router.delete("/lessons/{lesson_id}", status_code=204)
async def delete_lesson(
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_approved_instructor),
):
    result = await db.execute(
        select(Lesson)
        .join(Course, Course.id == Lesson.course_id)
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()

    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if lesson.course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete lessons from your own courses",
        )

    await db.delete(lesson)
    await db.commit()
