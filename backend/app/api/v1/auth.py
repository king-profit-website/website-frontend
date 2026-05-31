from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import (
    create_access_token, create_refresh_token,
    get_password_hash, verify_password, decode_token
)
from app.db.session import get_db
from app.models.user import User
from app.models.quest import Quest, UserQuest
from app.models.transaction import Transaction, TransactionType
from app.schemas.user import UserRegister, UserLogin, TokenResponse, RefreshRequest, UserOut

router = APIRouter(prefix="/auth", tags=["Auth"])

SEED_QUESTS = [
    {"title": "Перша покупка", "description": "Здійсніть першу транзакцію у партнера", "icon": "shopping-bag", "condition_type": "transactions_count", "condition_value": 1, "reward_md": 50, "reward_xp": 100},
    {"title": "Активний клієнт", "description": "Здійсніть 5 транзакцій у партнерів", "icon": "zap", "condition_type": "transactions_count", "condition_value": 5, "reward_md": 150, "reward_xp": 300},
    {"title": "Запроси друга", "description": "Запросіть 1 друга за реферальним кодом", "icon": "users", "condition_type": "referrals_count", "condition_value": 1, "reward_md": 100, "reward_xp": 200},
    {"title": "Колесо удачі", "description": "Прокрутіть колесо вперше", "icon": "circle", "condition_type": "wheel_spins", "condition_value": 1, "reward_md": 25, "reward_xp": 50},
    {"title": "Постійний клієнт", "description": "Здійсніть 20 транзакцій", "icon": "award", "condition_type": "transactions_count", "condition_value": 20, "reward_md": 500, "reward_xp": 1000},
]


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserRegister, db: Annotated[AsyncSession, Depends(get_db)]):
    # Check phone unique
    existing = await db.execute(select(User).where(User.phone == body.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Цей номер телефону вже зареєстрований")

    # Resolve referrer
    referrer = None
    referred_by_id = None

    user = User(
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
        age=body.age,
        hashed_password=get_password_hash(body.password),
        referred_by_id=referred_by_id,
    )
    db.add(user)
    await db.flush()  # get user.id

    # Seed quests for new user
    all_quests = (await db.execute(select(Quest))).scalars().all()
    if not all_quests:
        # Seed default quests
        for q_data in SEED_QUESTS:
            q = Quest(**q_data)
            db.add(q)
        await db.flush()
        all_quests = (await db.execute(select(Quest))).scalars().all()

    for quest in all_quests:
        uq = UserQuest(user_id=user.id, quest_id=quest.id)
        db.add(uq)

    # Referral bonus
    if referred_by_id:
        referrer = (await db.execute(select(User).where(User.id == referred_by_id))).scalar_one_or_none()
        if referrer:
            from app.core.config import get_settings
            settings = get_settings()
            referrer.md_balance += settings.referral_bonus_md
            txn = Transaction(
                user_id=referred_by_id,
                type=TransactionType.referral,
                amount=settings.referral_bonus_md,
                description=f"Реферальний бонус за запрошення {body.first_name}",
            )
            db.add(txn)

    await db.commit()
    await db.refresh(user)

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(User).where(User.phone == body.phone))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Невірний номер телефону або пароль")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Акаунт заблокований")

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError("not refresh")
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Невалідний refresh токен")

    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    new_refresh = create_refresh_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=access_token, refresh_token=new_refresh)
