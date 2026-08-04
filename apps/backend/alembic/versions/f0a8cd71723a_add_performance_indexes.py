"""add performance indexes

Revision ID: f0a8cd71723a
Revises: e3d29a502efc
Create Date: 2026-07-30 16:30:00.000000

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f0a8cd71723a"
down_revision: str | None = "e3d29a502efc"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Add index on project_members (invited_by)
    op.create_index(
        op.f("ix_project_members_invited_by"),
        "project_members",
        ["invited_by"],
        unique=False,
    )


def downgrade() -> None:
    # 1. Drop index on project_members (invited_by)
    op.drop_index(op.f("ix_project_members_invited_by"), table_name="project_members")
