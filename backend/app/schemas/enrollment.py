
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    progress: int
    enrolled_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProgressUpdate(BaseModel):
    progress: int = Field(ge=0, le=100)
