import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.models.base import Base


class Dataset(Base):
    __tablename__ = 'datasets'

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(),
        ForeignKey('users.id'),
        nullable=False,
        index=True,
    )
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    row_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default='uploaded')
    health_summary: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.now,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.now,
        onupdate=datetime.now,
    )

    user = relationship('User', back_populates='datasets')
    sales_records = relationship(
        'SalesRecord',
        back_populates='dataset',
        cascade='all, delete-orphan',
    )
    forecasts = relationship(
        'Forecast',
        back_populates='dataset',
        cascade='all, delete-orphan',
    )
