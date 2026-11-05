
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class CourseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    subtitle: str | None = Field(default=None, max_length=300)
    description: str = Field(min_length=10)
    category: str = Field(min_length=2, max_length=100)
    level: str = Field(default="Beginner", max_length=50)
    price: Decimal = Field(default=Decimal("0.00"), ge=0)
    thumbnail_url: HttpUrl | None = None


class CourseResponse(BaseModel):
    id: int
    title: str
    subtitle: str | None
    description: str
    category: str
    level: str
    price: Decimal
    thumbnail_url: str | None
    instructor_id: int
    instructor_name: str | None = None
    instructor_profile_picture_url: str | None = None
    status: str
    rejection_reason: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CourseReviewRequest(BaseModel):
    rejection_reason: str | None = Field(
        default=None,
        max_length=1000,
    )
