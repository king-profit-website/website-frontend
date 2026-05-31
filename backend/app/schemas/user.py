from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, field_validator
from app.models.user import UserRole, UserLevel


class UserRegister(BaseModel):
    first_name: str
    last_name: str
    phone: str
    age: int
    password: str

    @field_validator("phone")
    @classmethod
    def phone_format(cls, v: str) -> str:
        digits = "".join(c for c in v if c.isdigit() or c == "+")
        if len(digits) < 10:
            raise ValueError("Невалідний номер телефону")
        return digits

    @field_validator("age")
    @classmethod
    def age_range(cls, v: int) -> int:
        if not (14 <= v <= 120):
            raise ValueError("Вік повинен бути від 14 до 120 років")
        return v


class UserLogin(BaseModel):
    phone: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    phone: str
    age: int
    role: UserRole
    level: UserLevel
    md_balance: Decimal
    xp: int
    referral_code: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    age: int | None = None
