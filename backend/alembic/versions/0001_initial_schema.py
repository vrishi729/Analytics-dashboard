"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-07-06
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = '0001'
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column(
            'id',
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text('gen_random_uuid()'),
        ),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
    )

    op.create_table(
        'datasets',
        sa.Column(
            'id',
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text('gen_random_uuid()'),
        ),
        sa.Column(
            'user_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
            index=True,
        ),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('stored_filename', sa.String(255), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=True),
        sa.Column('row_count', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='uploaded'),
        sa.Column('health_summary', postgresql.JSONB(), nullable=True),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
    )

    op.create_table(
        'sales_records',
        sa.Column(
            'id',
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text('gen_random_uuid()'),
        ),
        sa.Column(
            'dataset_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('datasets.id', ondelete='CASCADE'),
            nullable=False,
            index=True,
        ),
        sa.Column(
            'user_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
            index=True,
        ),
        sa.Column('order_date', sa.Date(), nullable=False, index=True),
        sa.Column('product_name', sa.String(500), nullable=False, index=True),
        sa.Column('category', sa.String(255), nullable=True),
        sa.Column('quantity_sold', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Numeric(12, 2), nullable=False),
        sa.Column('revenue', sa.Numeric(14, 2), nullable=True),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
    )

    op.create_table(
        'forecasts',
        sa.Column(
            'id',
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text('gen_random_uuid()'),
        ),
        sa.Column(
            'user_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
            index=True,
        ),
        sa.Column(
            'dataset_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('datasets.id', ondelete='CASCADE'),
            nullable=False,
            index=True,
        ),
        sa.Column('product_name', sa.String(500), nullable=False, index=True),
        sa.Column('forecast_horizon', sa.String(20), nullable=False),
        sa.Column('forecast_data', postgresql.JSONB(), nullable=False),
        sa.Column('model_used', sa.String(50), nullable=True),
        sa.Column('confidence_score', sa.Numeric(5, 4), nullable=True),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_table('forecasts')
    op.drop_table('sales_records')
    op.drop_table('datasets')
    op.drop_table('users')
