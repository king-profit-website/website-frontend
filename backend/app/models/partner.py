import enum
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import (
    Boolean, DateTime, Enum, Float, ForeignKey, Integer, Numeric, String, Text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class PartnerCategory(str, enum.Enum):
    restaurant = "Ресторан"
    cafe = "Кафе"
    shop = "Магазин"
    beauty = "Краса"
    fitness = "Фітнес"
    entertainment = "Розваги"
    services = "Послуги"
    other = "Інше"


class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Partner(Base):
    __tablename__ = "partners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True)
    company_name: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(Text, default="")
    address: Mapped[str] = mapped_column(String(256), default="")
    category: Mapped[PartnerCategory] = mapped_column(
        Enum(PartnerCategory, name="partnercategory"), default=PartnerCategory.other
    )
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    md_balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0.00"))
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    logo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    owner: Mapped["User"] = relationship(
        back_populates="partner", foreign_keys=[owner_id]
    )
    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="partner", lazy="select"
    )
    promotions: Mapped[list["Promotion"]] = relationship(
        back_populates="partner", lazy="select"
    )


class PartnerApplication(Base):
    __tablename__ = "partner_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    company_name: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(Text, default="")
    address: Mapped[str] = mapped_column(String(256), default="")
    category: Mapped[PartnerCategory] = mapped_column(
        Enum(PartnerCategory, name="partnercategory2"), default=PartnerCategory.other
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="applicationstatus"), default=ApplicationStatus.pending
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship(back_populates="applications")


class Promotion(Base):
    __tablename__ = "promotions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    partner_id: Mapped[int] = mapped_column(Integer, ForeignKey("partners.id"))
    title: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(Text, default="")
    discount_percent: Mapped[int] = mapped_column(Integer, default=0)
    bonus_md: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    partner: Mapped["Partner"] = relationship(back_populates="promotions")


from app.models.user import User  # noqa: E402
from app.models.transaction import Transaction  # noqa: E402
