import enum
import secrets
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import (
    Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class UserRole(str, enum.Enum):
    client = "client"
    partner = "partner"
    admin = "admin"


class UserLevel(str, enum.Enum):
    silver = "Silver"
    gold = "Gold"
    platinum = "Platinum"
    diamond = "Diamond"


def _gen_referral() -> str:
    return secrets.token_urlsafe(8).upper()


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(64))
    last_name: Mapped[str] = mapped_column(String(64))
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    age: Mapped[int] = mapped_column(Integer)
    hashed_password: Mapped[str] = mapped_column(String(256))

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="userrole"), default=UserRole.client
    )
    level: Mapped[UserLevel] = mapped_column(
        Enum(UserLevel, name="userlevel"), default=UserLevel.silver
    )

    md_balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0.00"))
    xp: Mapped[int] = mapped_column(Integer, default=0)

    referral_code: Mapped[str] = mapped_column(
        String(16), unique=True, default=_gen_referral, index=True
    )
    referred_by_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="user", lazy="select"
    )
    user_quests: Mapped[list["UserQuest"]] = relationship(
        back_populates="user", lazy="select"
    )
    wheel_history: Mapped[list["WheelHistory"]] = relationship(
        back_populates="user", lazy="select"
    )
    partner: Mapped["Partner | None"] = relationship(
        back_populates="owner", foreign_keys="Partner.owner_id", lazy="select"
    )
    applications: Mapped[list["PartnerApplication"]] = relationship(
        back_populates="user", lazy="select"
    )


# Avoid circular imports
from app.models.transaction import Transaction  # noqa: E402
from app.models.quest import UserQuest  # noqa: E402
from app.models.wheel import WheelHistory  # noqa: E402
from app.models.partner import Partner, PartnerApplication  # noqa: E402
