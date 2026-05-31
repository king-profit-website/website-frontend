import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models.user import User
from app.models.wheel import WheelHistory
from app.models.transaction import Transaction, TransactionType
from app.schemas.wheel import WheelStatusOut, WheelSpinResult

router = APIRouter(prefix="/wheel", tags=["Wheel of Fortune"])

settings = get_settings()

WHEEL_SEGMENTS = [10, 25, 50, 0, 100, 15, 75, 200, 30, 5, 150, 0]


def _weighted_choice(segments: list[int]) -> tuple[int, int]:
    """Returns (value, index). Zeros have lower probability."""
    weights = [max(1, v) for v in segments]
    total = sum(weights)
    r = random.uniform(0, total)
    cumulative = 0
    for i, w in enumerate(weights):
        cumulative += w
        if r <= cumulative:
            return segments[i], i
    return segments[-1], len(segments) - 1


@router.get("/status", response_model=WheelStatusOut)
async def wheel_status(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    last_free = (await db.execute(
        select(WheelHistory)
        .where(WheelHistory.user_id == current_user.id, WheelHistory.is_free == True)
        .order_by(WheelHistory.created_at.desc())
        .limit(1)
    )).scalar_one_or_none()

    now_utc = datetime.now(timezone.utc)
    interval = timedelta(hours=settings.wheel_free_interval_hours)

    if last_free is None:
        can_spin = True
        next_free = None
        hours_left = None
    else:
        last_dt = last_free.created_at
        if last_dt.tzinfo is None:
            last_dt = last_dt.replace(tzinfo=timezone.utc)
        next_free = last_dt + interval
        can_spin = now_utc >= next_free
        hours_left = None if can_spin else (next_free - now_utc).total_seconds() / 3600

    return WheelStatusOut(
        can_spin_free=can_spin,
        next_free_spin_at=None if can_spin else next_free,
        hours_until_free=hours_left,
        paid_spin_cost_md=settings.wheel_paid_cost_md,
    )


@router.post("/spin", response_model=WheelSpinResult)
async def spin_wheel(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    paid: bool = False,
):
    now_utc = datetime.now(timezone.utc)

    # Determine if free spin is available
    last_free = (await db.execute(
        select(WheelHistory)
        .where(WheelHistory.user_id == current_user.id, WheelHistory.is_free == True)
        .order_by(WheelHistory.created_at.desc())
        .limit(1)
    )).scalar_one_or_none()

    interval = timedelta(hours=settings.wheel_free_interval_hours)
    can_spin_free = True
    if last_free:
        last_dt = last_free.created_at
        if last_dt.tzinfo is None:
            last_dt = last_dt.replace(tzinfo=timezone.utc)
        can_spin_free = now_utc >= (last_dt + interval)

    is_free = can_spin_free and not paid

    if not is_free:
        # Paid spin
        cost = Decimal(str(settings.wheel_paid_cost_md))
        if current_user.md_balance < cost:
            raise HTTPException(
                status_code=400,
                detail=f"Недостатньо MD. Потрібно {cost} MD для платного спіну."
            )
        current_user.md_balance -= cost
        # Record deduction
        db.add(Transaction(
            user_id=current_user.id,
            type=TransactionType.spend,
            amount=-cost,
            description="Платний спін колеса удачі",
        ))

    # Spin!
    result_md, winning_idx = _weighted_choice(WHEEL_SEGMENTS)
    result_decimal = Decimal(str(result_md))
    current_user.md_balance += result_decimal

    # Record history
    wheel_record = WheelHistory(
        user_id=current_user.id,
        result_md=result_decimal,
        is_free=is_free,
    )
    db.add(wheel_record)

    if result_md > 0:
        db.add(Transaction(
            user_id=current_user.id,
            type=TransactionType.wheel,
            amount=result_decimal,
            description=f"Виграш на колесі удачі: +{result_md} MD",
        ))

    await db.commit()
    await db.refresh(current_user)

    return WheelSpinResult(
        result_md=result_decimal,
        is_free=is_free,
        new_balance=current_user.md_balance,
        segments=WHEEL_SEGMENTS,
        winning_index=winning_idx,
    )
