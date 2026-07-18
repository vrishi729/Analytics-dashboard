import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.models.base import Base


class SalesRecord(Base):
    __tablename__ = 'sales_records'

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(),
        primary_key=True,
        default=uuid.uuid4,
    )
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(),
        ForeignKey('datasets.id'),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(),
        ForeignKey('users.id'),
        nullable=False,
        index=True,
    )
    order_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    product_name: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    category: Mapped[str | None] = mapped_column(String(255), nullable=True)
    quantity_sold: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    revenue: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.now,
    )

    dataset = relationship('Dataset', back_populates='sales_records')
    user = relationship('User', back_populates='sales_records')
