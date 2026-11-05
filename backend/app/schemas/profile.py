
from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    bio: str | None = Field(
        default=None,
        max_length=1000,
    )

    phone_number: str | None = Field(
        default=None,
        min_length=7,
        max_length=20,
    )

    profile_picture_url: HttpUrl | None = None


class ProfileResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    bio: str | None
    phone_number: str | None
    profile_picture_url: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
