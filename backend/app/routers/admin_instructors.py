from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.models.user import InstructorApprovalStatus, User, UserRole
from app.routers.auth import get_current_user
from app.schemas.user import (
    InstructorApplicationResponse,
    InstructorApplicationReview,
)

router = APIRouter(
    prefix="/api/v1/admin/instructors",
    tags=["Admin Instructor Approval"],
)


async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only administrators can review instructor applications",
        )
    return current_user


@router.get("", response_model=list[InstructorApplicationResponse])
async def list_pending_instructors(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(
        select(User)
        .where(
            User.role == UserRole.INSTRUCTOR,
            User.instructor_status == InstructorApprovalStatus.PENDING,
        )
        .order_by(User.created_at.desc())
    )
    return result.scalars().all()


@router.patch(
    "/{instructor_id}/approve",
    response_model=InstructorApplicationResponse,
)
async def approve_instructor(
    instructor_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    instructor = await _get_pending_instructor(instructor_id, db)
    instructor.instructor_status = InstructorApprovalStatus.APPROVED
    instructor.instructor_rejection_reason = None
    await db.commit()
    await db.refresh(instructor)
    return instructor


@router.patch(
    "/{instructor_id}/reject",
    response_model=InstructorApplicationResponse,
)
async def reject_instructor(
    instructor_id: int,
    review: InstructorApplicationReview,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    reason = (review.rejection_reason or "").strip()
    if not reason:
        raise HTTPException(
            status_code=422,
            detail="A rejection reason is required",
        )

    instructor = await _get_pending_instructor(instructor_id, db)
    instructor.instructor_status = InstructorApprovalStatus.REJECTED
    instructor.instructor_rejection_reason = reason
    await db.commit()
    await db.refresh(instructor)
    return instructor


async def _get_pending_instructor(
    instructor_id: int,
    db: AsyncSession,
) -> User:
    result = await db.execute(
        select(User).where(
            User.id == instructor_id,
            User.role == UserRole.INSTRUCTOR,
        ).with_for_update()
    )
    instructor = result.scalar_one_or_none()
    if instructor is None:
        raise HTTPException(status_code=404, detail="Instructor application not found")
    if instructor.instructor_status != InstructorApprovalStatus.PENDING:
        raise HTTPException(
            status_code=409,
            detail="Only pending instructor applications can be reviewed",
        )
    return instructor
