
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.models.course import Course, CourseStatus
from app.models.user import User, UserRole
from app.routers.auth import get_current_user
from app.schemas.course import CourseResponse, CourseReviewRequest

router = APIRouter(
    prefix="/api/v1/admin/courses",
    tags=["Admin Course Approval"],
)


async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only administrators can review courses",
        )
    return current_user


@router.get("", response_model=list[CourseResponse])
async def list_pending_courses(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(
        select(Course, User.full_name, User.profile_picture_url)
        .join(User, User.id == Course.instructor_id)
        .where(Course.status == CourseStatus.PENDING)
        .order_by(Course.created_at.desc())
    )
    return [
        {
            **CourseResponse.model_validate(course).model_dump(),
            "instructor_name": instructor_name,
            "instructor_profile_picture_url": profile_picture_url,
        }
        for course, instructor_name, profile_picture_url in result.all()
    ]


@router.patch("/{course_id}/approve", response_model=CourseResponse)
async def approve_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()

    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.status != CourseStatus.PENDING:
        raise HTTPException(
            status_code=409,
            detail="Only pending courses can be approved",
        )

    course.status = CourseStatus.APPROVED
    course.rejection_reason = None

    await db.commit()
    await db.refresh(course)
    return course


@router.patch("/{course_id}/reject", response_model=CourseResponse)
async def reject_course(
    course_id: int,
    review: CourseReviewRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    reason = (review.rejection_reason or "").strip()

    if not reason:
        raise HTTPException(
            status_code=422,
            detail="A rejection reason is required",
        )

    result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()

    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.status != CourseStatus.PENDING:
        raise HTTPException(
            status_code=409,
            detail="Only pending courses can be rejected",
        )

    course.status = CourseStatus.REJECTED
    course.rejection_reason = reason

    await db.commit()
    await db.refresh(course)
    return course
