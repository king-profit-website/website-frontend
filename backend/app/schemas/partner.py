from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
from app.models.partner import PartnerCategory, ApplicationStatus


class PartnerOut(BaseModel):
    id: int
    owner_id: int
    company_name: str
    description: str
    address: str
    category: PartnerCategory
    latitude: float | None
    longitude: float | None
    is_approved: bool
    logo_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PartnerStats(BaseModel):
    total_md_issued: Decimal
    total_md_spent: Decimal
    total_clients: int
    transactions_count: int


class PartnerApplicationCreate(BaseModel):
    company_name: str
    description: str
    address: str
    category: PartnerCategory


class PartnerApplicationOut(BaseModel):
    id: int
    user_id: int
    company_name: str
    description: str
    address: str
    category: PartnerCategory
    status: ApplicationStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class ChargeClientRequest(BaseModel):
    user_id: int | None = None
    referral_code: str | None = None
    amount: Decimal
    description: str = ""
    is_earn: bool = True  # True = начислить, False = списать


class PromotionCreate(BaseModel):
    title: str
    description: str = ""
    discount_percent: int = 0
    bonus_md: int = 0
    expires_at: datetime | None = None


class PromotionOut(BaseModel):
    id: int
    partner_id: int
    title: str
    description: str
    discount_percent: int
    bonus_md: int
    is_active: bool
    expires_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
