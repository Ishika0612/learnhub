
import asyncio
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.models.user import User, UserRole
from app.routers.auth import get_current_user
from app.schemas.profile import (
    ProfileResponse,
    ProfileUpdate,
)

PROFILE_UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads" / "profiles"
MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024
PROFILE_IMAGE_FORMATS = {
    "image/jpeg": (".jpg", lambda data: data.startswith(b"\xff\xd8\xff")),
    "image/png": (
        ".png",
        lambda data: data.startswith(b"\x89PNG\r\n\x1a\n"),
    ),
    "image/webp": (
        ".webp",
        lambda data: (
            len(data) >= 12
            and data.startswith(b"RIFF")
            and data[8:12] == b"WEBP"
        ),
    ),
}

router = APIRouter(
    prefix="/api/v1/profile",
    tags=["Profile"],
)


def _require_profile_role(current_user: User) -> None:
    if current_user.role not in (UserRole.STUDENT, UserRole.INSTRUCTOR):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for student and instructor accounts",
        )


@router.get(
    "/me",
    response_model=ProfileResponse,
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    _require_profile_role(current_user)
    return current_user


@router.patch(
    "/me",
    response_model=ProfileResponse,
)
async def update_my_profile(
    profile_data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_profile_role(current_user)

    updates = profile_data.model_dump(exclude_unset=True)

    if (
        "full_name" in updates
        and updates["full_name"] is not None
        and not updates["full_name"].strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Full name cannot be empty",
        )

    if (
        "phone_number" in updates
        and updates["phone_number"] is not None
        and not updates["phone_number"].strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Phone number cannot be empty",
        )

    for field, value in updates.items():
        if isinstance(value, str):
            value = value.strip()

        if field == "profile_picture_url" and value is not None:
            value = str(value)

        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)

    return current_user


@router.post(
    "/me/photo",
    response_model=ProfileResponse,
)
async def upload_profile_photo(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_profile_role(current_user)

    content_type = request.headers.get("content-type", "").split(";", 1)[0].lower()
    image_format = PROFILE_IMAGE_FORMATS.get(content_type)
    if image_format is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Choose a JPEG, PNG, or WebP image.",
        )

    image_data = bytearray()
    async for chunk in request.stream():
        image_data.extend(chunk)
        if len(image_data) > MAX_PROFILE_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Profile photos must be 5 MB or smaller.",
            )

    extension, is_valid_image = image_format
    if not image_data or not is_valid_image(image_data):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="The uploaded file is not a valid supported image.",
        )

    PROFILE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{current_user.id}-{uuid.uuid4().hex}{extension}"
    image_path = PROFILE_UPLOAD_DIR / filename
    await asyncio.to_thread(image_path.write_bytes, image_data)

    previous_photo = current_user.profile_picture_url
    current_user.profile_picture_url = f"/uploads/profiles/{filename}"
    try:
        await db.commit()
        await db.refresh(current_user)
    except Exception:
        await asyncio.to_thread(image_path.unlink, missing_ok=True)
        raise

    if previous_photo and previous_photo.startswith("/uploads/profiles/"):
        previous_path = PROFILE_UPLOAD_DIR / Path(previous_photo).name
        if previous_path != image_path:
            await asyncio.to_thread(previous_path.unlink, missing_ok=True)

    return current_user


@router.delete(
    "/me/photo",
    response_model=ProfileResponse,
)
async def delete_profile_photo(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_profile_role(current_user)

    previous_photo = current_user.profile_picture_url
    current_user.profile_picture_url = None
    await db.commit()
    await db.refresh(current_user)

    if previous_photo and previous_photo.startswith("/uploads/profiles/"):
        previous_path = PROFILE_UPLOAD_DIR / Path(previous_photo).name
        await asyncio.to_thread(previous_path.unlink, missing_ok=True)

    return current_user
