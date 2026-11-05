from datetime import datetime
from pydantic import BaseModel


class InstructorDashboardResponse(BaseModel):
    total_courses: int
    approved_courses: int
    pending_courses: int
    rejected_courses: int
    total_enrollments: int
    average_progress: float

class StudentCourseItem(BaseModel):
    enrollment_id: int
    course_id: int
    title: str
    subtitle: str | None
    category: str
    level: str
    thumbnail_url: str | None
    instructor_id: int
    instructor_name: str | None = None
    instructor_profile_picture_url: str | None = None
    progress: int
    enrolled_at: datetime


class StudentDashboardResponse(BaseModel):
    total_enrollments: int
    completed_courses: int
    in_progress_courses: int
    average_progress: float
    courses: list[StudentCourseItem]
