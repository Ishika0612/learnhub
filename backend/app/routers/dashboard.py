
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.dashboard import (
    StudentCourseItem,
    StudentDashboardResponse,
)

from app.db.postgres import get_db
from app.models.course import Course, CourseStatus
from app.models.enrollment import Enrollment
from app.models.user import User, UserRole
from app.routers.auth import get_current_user, require_approved_instructor
from app.schemas.dashboard import InstructorDashboardResponse

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/instructor",
    response_model=InstructorDashboardResponse,
)
async def instructor_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_approved_instructor),
):
    # Count this instructor's courses by approval status.
    course_counts_result = await db.execute(
        select(
            func.count(Course.id),
            func.count(Course.id).filter(
                Course.status == CourseStatus.APPROVED
            ),
            func.count(Course.id).filter(
                Course.status == CourseStatus.PENDING
            ),
            func.count(Course.id).filter(
                Course.status == CourseStatus.REJECTED
            ),
        ).where(Course.instructor_id == current_user.id)
    )

    (
        total_courses,
        approved_courses,
        pending_courses,
        rejected_courses,
    ) = course_counts_result.one()

    # Count enrollments only for this instructor's courses.
    enrollment_result = await db.execute(
        select(
            func.count(Enrollment.id),
            func.coalesce(func.avg(Enrollment.progress), 0.0),
        )
        .join(Course, Course.id == Enrollment.course_id)
        .where(Course.instructor_id == current_user.id)
    )

    total_enrollments, average_progress = enrollment_result.one()

    return InstructorDashboardResponse(
        total_courses=total_courses,
        approved_courses=approved_courses,
        pending_courses=pending_courses,
        rejected_courses=rejected_courses,
        total_enrollments=total_enrollments,
        average_progress=round(float(average_progress), 2),
    )

@router.get(
    "/student",
    response_model=StudentDashboardResponse,
)
async def student_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=403,
            detail="Only students can access this dashboard",
        )

    result = await db.execute(
        select(Enrollment, Course, User.full_name, User.profile_picture_url)
        .join(Course, Course.id == Enrollment.course_id)
        .join(User, User.id == Course.instructor_id)
        .where(Enrollment.student_id == current_user.id)
        .order_by(Enrollment.enrolled_at.desc())
    )

    rows = result.all()

    courses = [
        StudentCourseItem(
            enrollment_id=enrollment.id,
            course_id=course.id,
            title=course.title,
            subtitle=course.subtitle,
            category=course.category,
            level=course.level,
            thumbnail_url=course.thumbnail_url,
            instructor_id=course.instructor_id,
            instructor_name=instructor_name,
            instructor_profile_picture_url=profile_picture_url,
            progress=enrollment.progress,
            enrolled_at=enrollment.enrolled_at,
        )
        for enrollment, course, instructor_name, profile_picture_url in rows
    ]

    total = len(courses)
    completed = sum(1 for course in courses if course.progress == 100)
    in_progress = sum(
        1 for course in courses
        if 0 < course.progress < 100
    )
    average = (
        round(sum(course.progress for course in courses) / total, 2)
        if total else 0.0
    )

    return StudentDashboardResponse(
        total_enrollments=total,
        completed_courses=completed,
        in_progress_courses=in_progress,
        average_progress=average,
        courses=courses,
    )
