
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.models.course import Course, CourseStatus
from app.models.enrollment import Enrollment
from app.models.user import User, UserRole
from app.routers.auth import get_current_user
from app.schemas.enrollment import EnrollmentResponse, ProgressUpdate

router = APIRouter(
    prefix="/api/v1/enrollments",
    tags=["Enrollments"],
)


def require_student(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can perform this action",
        )
    return current_user


@router.post(
    "/{course_id}",
    response_model=EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def enroll_in_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    student: User = Depends(require_student),
):
    course_result = await db.execute(
        select(Course).where(
            Course.id == course_id,
            Course.status == CourseStatus.APPROVED,
        )
    )
    course = course_result.scalar_one_or_none()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approved course not found",
        )

    existing_result = await db.execute(
        select(Enrollment).where(
            Enrollment.student_id == student.id,
            Enrollment.course_id == course_id,
        )
    )
    existing_enrollment = existing_result.scalar_one_or_none()

    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already enrolled in this course",
        )

    enrollment = Enrollment(
        student_id=student.id,
        course_id=course_id,
        progress=0,
    )

    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)

    return enrollment


@router.get(
    "/me",
    response_model=list[EnrollmentResponse],
)
async def get_my_enrollments(
    db: AsyncSession = Depends(get_db),
    student: User = Depends(require_student),
):
    result = await db.execute(
        select(Enrollment)
        .where(Enrollment.student_id == student.id)
        .order_by(Enrollment.enrolled_at.desc())
    )

    return result.scalars().all()


@router.patch(
    "/{enrollment_id}/progress",
    response_model=EnrollmentResponse,
)
async def update_learning_progress(
    enrollment_id: int,
    progress_data: ProgressUpdate,
    db: AsyncSession = Depends(get_db),
    student: User = Depends(require_student),
):
    result = await db.execute(
        select(Enrollment).where(
            Enrollment.id == enrollment_id,
            Enrollment.student_id == student.id,
        )
    )
    enrollment = result.scalar_one_or_none()

    if enrollment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found",
        )

    enrollment.progress = progress_data.progress

    await db.commit()
    await db.refresh(enrollment)

    return enrollment
