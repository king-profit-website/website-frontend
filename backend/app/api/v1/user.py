from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User, UserLevel
from app.models.transaction import Transaction
from app.models.quest import Quest, UserQuest
from app.schemas.user import UserOut, UserUpdate
from app.schemas.wheel import TransactionOut

router = APIRouter(prefix="/user", tags=["User"])

LEVEL_XP = {
    UserLevel.silver: 0,
    UserLevel.gold: 500,
    UserLevel.platinum: 1500,
    UserLevel.diamond: 3000,
}


def _compute_level(xp: int) -> UserLevel:
    if xp >= 3000:
        return UserLevel.diamond
    elif xp >= 1500:
        return UserLevel.platinum
    elif xp >= 500:
        return UserLevel.gold
    return UserLevel.silver


@router.get("/me", response_model=UserOut)
async def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_me(
    body: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if body.first_name:
        current_user.first_name = body.first_name
    if body.last_name:
        current_user.last_name = body.last_name
    if body.age:
        current_user.age = body.age
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/transactions", response_model=list[TransactionOut])
async def get_transactions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/referral")
async def get_referral(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from app.core.config import get_settings
    settings = get_settings()
    # Count invited friends
    invited_count = (await db.execute(
        select(func.count(User.id)).where(User.referred_by_id == current_user.id)
    )).scalar() or 0

    return {
        "referral_code": current_user.referral_code,
        "referral_link": f"https://profit.app/ref/{current_user.referral_code}",
        "invited_count": invited_count,
        "bonus_per_referral": settings.referral_bonus_md,
        "total_earned_md": invited_count * settings.referral_bonus_md,
    }


@router.get("/quests")
async def get_quests(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Get all user_quests with quest info
    result = await db.execute(
        select(UserQuest).where(UserQuest.user_id == current_user.id)
    )
    user_quests = result.scalars().all()

    # Compute progress for each
    txn_count = (await db.execute(
        select(func.count(Transaction.id)).where(Transaction.user_id == current_user.id)
    )).scalar() or 0

    invited_count = (await db.execute(
        select(func.count(User.id)).where(User.referred_by_id == current_user.id)
    )).scalar() or 0

    wheel_count = (await db.execute(
        select(func.count()).select_from(__import__("app.models.wheel", fromlist=["WheelHistory"]).WheelHistory)
        .where(__import__("app.models.wheel", fromlist=["WheelHistory"]).WheelHistory.user_id == current_user.id)
    )).scalar() or 0

    progress_map = {
        "transactions_count": txn_count,
        "referrals_count": invited_count,
        "wheel_spins": wheel_count,
    }

    output = []
    for uq in user_quests:
        quest = (await db.execute(select(Quest).where(Quest.id == uq.quest_id))).scalar_one_or_none()
        if not quest:
            continue
        current_progress = progress_map.get(quest.condition_type, 0)
        output.append({
            "id": uq.id,
            "quest_id": quest.id,
            "title": quest.title,
            "description": quest.description,
            "icon": quest.icon,
            "condition_type": quest.condition_type,
            "condition_value": quest.condition_value,
            "current_progress": current_progress,
            "reward_md": quest.reward_md,
            "reward_xp": quest.reward_xp,
            "is_completed": uq.is_completed,
            "completed_at": uq.completed_at,
        })

    return output


@router.post("/quests/{quest_id}/claim")
async def claim_quest(
    quest_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from datetime import datetime, timezone
    from app.models.transaction import Transaction, TransactionType

    uq = (await db.execute(
        select(UserQuest)
        .where(UserQuest.user_id == current_user.id, UserQuest.quest_id == quest_id)
    )).scalar_one_or_none()

    if not uq:
        raise HTTPException(status_code=404, detail="Квест не знайдено")
    if uq.is_completed:
        raise HTTPException(status_code=400, detail="Нагороду вже отримано")

    quest = (await db.execute(select(Quest).where(Quest.id == quest_id))).scalar_one_or_none()
    if not quest:
        raise HTTPException(status_code=404, detail="Квест не існує")

    # Give reward
    uq.is_completed = True
    uq.completed_at = datetime.now(timezone.utc)
    current_user.md_balance += quest.reward_md
    current_user.xp += quest.reward_xp
    current_user.level = _compute_level(current_user.xp)

    txn = Transaction(
        user_id=current_user.id,
        type=TransactionType.quest,
        amount=quest.reward_md,
        description=f"Нагорода за квест: {quest.title}",
    )
    db.add(txn)
    await db.commit()

    return {"message": f"Нагороду отримано: +{quest.reward_md} MD, +{quest.reward_xp} XP"}
