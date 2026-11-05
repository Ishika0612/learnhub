
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class LessonCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str | None = None
    video_url: HttpUrl | None = None
    position: int = Field(default=1, ge=1)


class LessonResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: str | None
    video_url: str | None
    position: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
