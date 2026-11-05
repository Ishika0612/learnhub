
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LessonProgressResponse(BaseModel):
    id: int
    student_id: int
    lesson_id: int
    is_completed: bool
    completed_at: datetime | None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LessonCompletionUpdate(BaseModel):
    is_completed: bool
