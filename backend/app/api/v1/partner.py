from decimal import Decimal
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.api.deps import get_current_user, require_partner
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.partner import Partner, PartnerApplication, ApplicationStatus, Promotion
from app.models.transaction import Transaction, TransactionType
from app.schemas.partner import (
    PartnerOut, PartnerApplicationCreate, PartnerApplicationOut,
    ChargeClientRequest, PromotionCreate, PromotionOut, PartnerStats
)

router = APIRouter(prefix="/partner", tags=["Partner"])


@router.get("/list", response_model=list[PartnerOut])
async def list_partners(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    q = select(Partner).where(Partner.is_approved == True)
    if category:
        q = q.where(Partner.category == category)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/apply", response_model=PartnerApplicationOut, status_code=201)
async def apply_partner(
    body: PartnerApplicationCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Check if already applied
    existing = (await db.execute(
        select(PartnerApplication)
        .where(PartnerApplication.user_id == current_user.id,
               PartnerApplication.status == ApplicationStatus.pending)
    )).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="У вас вже є заявка на розгляді")

    application = PartnerApplication(
        user_id=current_user.id,
        company_name=body.company_name,
        description=body.description,
        address=body.address,
        category=body.category,
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


@router.get("/my-application", response_model=PartnerApplicationOut | None)
async def my_application(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    app = (await db.execute(
        select(PartnerApplication)
        .where(PartnerApplication.user_id == current_user.id)
        .order_by(PartnerApplication.created_at.desc())
        .limit(1)
    )).scalar_one_or_none()
    return app


# ─── Partner-only endpoints ────────────────────────────────────────────────────

@router.get("/stats", response_model=PartnerStats)
async def partner_stats(
    current_user: Annotated[User, Depends(require_partner)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    partner = (await db.execute(
        select(Partner).where(Partner.owner_id == current_user.id)
    )).scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Партнерський акаунт не знайдено")

    total_issued = (await db.execute(
        select(func.sum(Transaction.amount))
        .where(Transaction.partner_id == partner.id, Transaction.type == TransactionType.earn)
    )).scalar() or Decimal("0")

    total_spent = (await db.execute(
        select(func.sum(Transaction.amount))
        .where(Transaction.partner_id == partner.id, Transaction.type == TransactionType.spend)
    )).scalar() or Decimal("0")

    total_clients = (await db.execute(
        select(func.count(func.distinct(Transaction.user_id)))
        .where(Transaction.partner_id == partner.id)
    )).scalar() or 0

    txn_count = (await db.execute(
        select(func.count(Transaction.id))
        .where(Transaction.partner_id == partner.id)
    )).scalar() or 0

    return PartnerStats(
        total_md_issued=total_issued,
        total_md_spent=abs(total_spent),
        total_clients=total_clients,
        transactions_count=txn_count,
    )


@router.get("/transactions", response_model=list)
async def partner_transactions(
    current_user: Annotated[User, Depends(require_partner)],
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    partner = (await db.execute(
        select(Partner).where(Partner.owner_id == current_user.id)
    )).scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Партнерський акаунт не знайдено")

    txns = (await db.execute(
        select(Transaction)
        .where(Transaction.partner_id == partner.id)
        .order_by(Transaction.created_at.desc())
        .offset(skip).limit(limit)
    )).scalars().all()

    result = []
    for t in txns:
        user = (await db.execute(select(User).where(User.id == t.user_id))).scalar_one_or_none()
        result.append({
            "id": t.id,
            "user_id": t.user_id,
            "user_name": f"{user.first_name} {user.last_name}" if user else "Невідомо",
            "user_phone": user.phone if user else "",
            "type": t.type.value,
            "amount": str(t.amount),
            "description": t.description,
            "created_at": t.created_at.isoformat(),
        })
    return result


@router.post("/charge")
async def charge_client(
    body: ChargeClientRequest,
    current_user: Annotated[User, Depends(require_partner)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    partner = (await db.execute(
        select(Partner).where(Partner.owner_id == current_user.id)
    )).scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Партнерський акаунт не знайдено")

    # Find target user
    target_user = None
    if body.user_id:
        target_user = (await db.execute(select(User).where(User.id == body.user_id))).scalar_one_or_none()
    elif body.referral_code:
        target_user = (await db.execute(
            select(User).where(User.referral_code == body.referral_code)
        )).scalar_one_or_none()

    if not target_user:
        raise HTTPException(status_code=404, detail="Клієнта не знайдено")

    amount = Decimal(str(body.amount))
    if body.is_earn:
        target_user.md_balance += amount
        txn_type = TransactionType.earn
    else:
        if target_user.md_balance < amount:
            raise HTTPException(status_code=400, detail="Недостатньо MD у клієнта")
        target_user.md_balance -= amount
        amount = -amount
        txn_type = TransactionType.spend

    txn = Transaction(
        user_id=target_user.id,
        partner_id=partner.id,
        type=txn_type,
        amount=amount,
        description=body.description or (
            f"Нарахування від {partner.company_name}" if body.is_earn else f"Списання у {partner.company_name}"
        ),
    )
    db.add(txn)
    await db.commit()

    return {
        "success": True,
        "client_name": f"{target_user.first_name} {target_user.last_name}",
        "new_balance": str(target_user.md_balance),
        "amount": str(abs(amount)),
        "operation": "earn" if body.is_earn else "spend",
    }


@router.get("/promotions", response_model=list[PromotionOut])
async def get_promotions(
    current_user: Annotated[User, Depends(require_partner)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    partner = (await db.execute(
        select(Partner).where(Partner.owner_id == current_user.id)
    )).scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Партнерський акаунт не знайдено")

    result = await db.execute(
        select(Promotion).where(Promotion.partner_id == partner.id).order_by(Promotion.created_at.desc())
    )
    return result.scalars().all()


@router.post("/promotions", response_model=PromotionOut, status_code=201)
async def create_promotion(
    body: PromotionCreate,
    current_user: Annotated[User, Depends(require_partner)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    partner = (await db.execute(
        select(Partner).where(Partner.owner_id == current_user.id)
    )).scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Партнерський акаунт не знайдено")

    promo = Promotion(
        partner_id=partner.id,
        title=body.title,
        description=body.description,
        discount_percent=body.discount_percent,
        bonus_md=body.bonus_md,
        expires_at=body.expires_at,
    )
    db.add(promo)
    await db.commit()
    await db.refresh(promo)
    return promo


@router.delete("/promotions/{promo_id}", status_code=204)
async def delete_promotion(
    promo_id: int,
    current_user: Annotated[User, Depends(require_partner)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    partner = (await db.execute(
        select(Partner).where(Partner.owner_id == current_user.id)
    )).scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Партнерський акаунт не знайдено")

    promo = (await db.execute(
        select(Promotion).where(Promotion.id == promo_id, Promotion.partner_id == partner.id)
    )).scalar_one_or_none()
    if not promo:
        raise HTTPException(status_code=404, detail="Акцію не знайдено")

    await db.delete(promo)
    await db.commit()
