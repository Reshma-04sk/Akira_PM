"""add missing user columns

Revision ID: 7a0a8cd7172f
Revises: f0a8cd71723a
Create Date: 2026-08-03 18:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7a0a8cd7172f"
down_revision: str | None = "f0a8cd71723a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Add avatar_url to users
    op.add_column("users", sa.Column("avatar_url", sa.String(length=512), nullable=True))
    # Add notification_preferences to users
    op.add_column("users", sa.Column("notification_preferences", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "notification_preferences")
    op.drop_column("users", "avatar_url")
