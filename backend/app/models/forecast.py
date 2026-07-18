import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.models.base import Base


class Forecast(Base):
    __tablename__ = 'forecasts'

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
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(),
        ForeignKey('datasets.id'),
        nullable=False,
        index=True,
    )
    product_name: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    forecast_horizon: Mapped[str] = mapped_column(String(20), nullable=False)
    forecast_data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    model_used: Mapped[str | None] = mapped_column(String(50), nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.now,
    )

    dataset = relationship('Dataset', back_populates='forecasts')
    user = relationship('User', back_populates='forecasts')
