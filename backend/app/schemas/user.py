
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    profile_picture_url: str | None = None
    instructor_status: str | None = None
    instructor_rejection_reason: str | None = None

    model_config = ConfigDict(from_attributes=True)


class InstructorApplicationResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    bio: str | None
    phone_number: str | None
    profile_picture_url: str | None
    instructor_status: str
    instructor_rejection_reason: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InstructorApplicationReview(BaseModel):
    rejection_reason: str | None = Field(default=None, max_length=1000)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
