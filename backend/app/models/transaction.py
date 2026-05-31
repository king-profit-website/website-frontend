import enum
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class TransactionType(str, enum.Enum):
    earn = "earn"
    spend = "spend"
    wheel = "wheel"
    referral = "referral"
    quest = "quest"
    partner_charge = "partner_charge"
    partner_deduct = "partner_deduct"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    partner_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("partners.id"), nullable=True, index=True
    )
    type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType, name="transactiontype")
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship(back_populates="transactions")
    partner: Mapped["Partner | None"] = relationship(back_populates="transactions")


from app.models.user import User  # noqa: E402
from app.models.partner import Partner  # noqa: E402
