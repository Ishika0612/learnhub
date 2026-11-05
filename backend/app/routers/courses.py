
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.models.course import Course, CourseStatus
from app.models.user import User
from app.routers.auth import require_approved_instructor
from app.schemas.course import CourseCreate, CourseResponse


router = APIRouter(
    prefix="/api/v1/courses",
    tags=["Courses"],
)


# Create a course (instructors only)
@router.post(
    "",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_course(
    course_data: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_approved_instructor),
):
    course_values = course_data.model_dump()
    if course_values["thumbnail_url"] is not None:
        course_values["thumbnail_url"] = str(course_values["thumbnail_url"])

    course = Course(
        **course_values,
        instructor_id=current_user.id,
        status=CourseStatus.PENDING,
    )

    db.add(course)
    await db.commit()
    await db.refresh(course)

    return course


# List approved courses (public)
@router.get(
    "",
    response_model=list[CourseResponse],
)
@router.get(
    "/",
    response_model=list[CourseResponse],
)
async def list_approved_courses(
    category: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Course, User.full_name, User.profile_picture_url)
        .join(User, User.id == Course.instructor_id)
        .where(Course.status == CourseStatus.APPROVED)
    )

    if category and category.strip():
        query = query.where(
            Course.category.ilike(f"%{category.strip()}%")
        )

    if search and search.strip():
        query = query.where(
            Course.title.ilike(f"%{search.strip()}%")
        )

    result = await db.execute(query.order_by(Course.created_at.desc()))

    return [
        {
            **CourseResponse.model_validate(course).model_dump(),
            "instructor_name": instructor_name,
            "instructor_profile_picture_url": profile_picture_url,
        }
        for course, instructor_name, profile_picture_url in result.all()
    ]


@router.get(
    "/instructor/my-courses",
    response_model=list[CourseResponse],
)
async def list_instructor_courses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_approved_instructor),
):
    result = await db.execute(
        select(Course)
        .where(Course.instructor_id == current_user.id)
        .order_by(Course.created_at.desc())
    )
    return result.scalars().all()


@router.get(
    "/{course_id}",
    response_model=CourseResponse,
)
async def get_instructor_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_approved_instructor),
):
    result = await db.execute(
        select(Course).where(
            Course.id == course_id,
            Course.instructor_id == current_user.id,
        )
    )
    course = result.scalar_one_or_none()

    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    return course


@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course_data: CourseCreate,
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
            detail="You can only update your own courses",
        )

    # Editing a course sends it back for admin review.
    for field, value in course_data.model_dump().items():
        if field == "thumbnail_url" and value is not None:
            value = str(value)
        setattr(course, field, value)

    course.status = CourseStatus.PENDING
    course.rejection_reason = None

    await db.commit()
    await db.refresh(course)

    return course
