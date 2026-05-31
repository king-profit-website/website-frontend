from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
from app.models.transaction import TransactionType


class TransactionOut(BaseModel):
    id: int
    user_id: int
    partner_id: int | None
    type: TransactionType
    amount: Decimal
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}


class WheelStatusOut(BaseModel):
    can_spin_free: bool
    next_free_spin_at: datetime | None
    hours_until_free: float | None
    paid_spin_cost_md: int


class WheelSpinResult(BaseModel):
    result_md: Decimal
    is_free: bool
    new_balance: Decimal
    segments: list[int]
    winning_index: int
