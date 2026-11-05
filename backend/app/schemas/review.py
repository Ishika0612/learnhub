
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


class ReviewUpdate(BaseModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    student_name: str | None = None
    student_profile_picture_url: str | None = None
    course_id: int
    rating: int
    comment: str | None
    created_at: datetime
    updated_at: datetime


class CourseRatingResponse(BaseModel):
    course_id: int
    average_rating: float
    total_reviews: int
