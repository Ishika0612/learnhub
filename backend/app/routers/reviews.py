
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.models.course import Course, CourseStatus
from app.models.enrollment import Enrollment
from app.models.review import CourseReview
from app.models.user import User, UserRole
from app.routers.auth import get_current_user
from app.schemas.review import (
    CourseRatingResponse,
    ReviewCreate,
    ReviewResponse,
    ReviewUpdate,
)

router = APIRouter(prefix="/reviews", tags=["Course Reviews"])


@router.post(
    "/courses/{course_id}",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_review(
    course_id: int,
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=403,
            detail="Only students can review courses",
        )

    course_result = await db.execute(
        select(Course).where(
            Course.id == course_id,
            Course.status == CourseStatus.APPROVED,
        )
    )
    course = course_result.scalar_one_or_none()

    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment_result = await db.execute(
        select(Enrollment).where(
            Enrollment.course_id == course_id,
            Enrollment.student_id == current_user.id,
        )
    )
    if enrollment_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=403,
            detail="Enroll in the course before reviewing it",
        )

    existing_result = await db.execute(
        select(CourseReview).where(
            CourseReview.course_id == course_id,
            CourseReview.student_id == current_user.id,
        )
    )
    if existing_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=409,
            detail="You have already reviewed this course",
        )

    review = CourseReview(
        student_id=current_user.id,
        course_id=course_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return {
        **ReviewResponse.model_validate(review).model_dump(),
        "student_name": current_user.full_name,
        "student_profile_picture_url": current_user.profile_picture_url,
    }


@router.get(
    "/courses/{course_id}",
    response_model=list[ReviewResponse],
)
async def get_course_reviews(
    course_id: int,
    db: AsyncSession = Depends(get_db),
):
    course_result = await db.execute(
        select(Course).where(
            Course.id == course_id,
            Course.status == CourseStatus.APPROVED,
        )
    )
    if course_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Course not found")

    result = await db.execute(
        select(CourseReview, User.full_name, User.profile_picture_url)
        .join(User, User.id == CourseReview.student_id)
        .where(CourseReview.course_id == course_id)
        .order_by(CourseReview.created_at.desc())
    )
    return [
        {
            **ReviewResponse.model_validate(review).model_dump(),
            "student_name": student_name,
            "student_profile_picture_url": profile_picture_url,
        }
        for review, student_name, profile_picture_url in result.all()
    ]


@router.patch(
    "/{review_id}",
    response_model=ReviewResponse,
)
async def update_review(
    review_id: int,
    data: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Students only")

    result = await db.execute(
        select(CourseReview).where(
            CourseReview.id == review_id,
            CourseReview.student_id == current_user.id,
        )
    )
    review = result.scalar_one_or_none()

    if review is None:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    changes = data.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one field to update",
        )

    for field, value in changes.items():
        setattr(review, field, value)

    await db.commit()
    await db.refresh(review)

    return {
        **ReviewResponse.model_validate(review).model_dump(),
        "student_name": current_user.full_name,
        "student_profile_picture_url": current_user.profile_picture_url,
    }


@router.delete(
    "/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Students only")

    result = await db.execute(
        select(CourseReview).where(
            CourseReview.id == review_id,
            CourseReview.student_id == current_user.id,
        )
    )
    review = result.scalar_one_or_none()

    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")

    await db.delete(review)
    await db.commit()


@router.get(
    "/courses/{course_id}/rating",
    response_model=CourseRatingResponse,
)
async def get_course_rating(
    course_id: int,
    db: AsyncSession = Depends(get_db),
):
    course_result = await db.execute(
        select(Course).where(
            Course.id == course_id,
            Course.status == CourseStatus.APPROVED,
        )
    )
    if course_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Course not found")

    result = await db.execute(
        select(
            func.coalesce(func.avg(CourseReview.rating), 0),
            func.count(CourseReview.id),
        ).where(CourseReview.course_id == course_id)
    )
    average_rating, total_reviews = result.one()

    return CourseRatingResponse(
        course_id=course_id,
        average_rating=round(float(average_rating), 2),
        total_reviews=total_reviews,
    )
