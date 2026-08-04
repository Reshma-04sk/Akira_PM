"""create workspaces and workspace members

Revision ID: e3d29a502efc
Revises: ad2717ca52db
Create Date: 2026-07-30 15:45:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e3d29a502efc"
down_revision: str | None = "ad2717ca52db"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Create workspaces table
    op.create_table(
        "workspaces",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("owner_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_workspaces_owner_id"), "workspaces", ["owner_id"], unique=False
    )

    # 2. Create workspace_members table
    op.create_table(
        "workspace_members",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("workspace_id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["workspace_id"], ["workspaces.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("workspace_id", "user_id", name="uq_workspace_member"),
    )
    op.create_index(
        op.f("ix_workspace_members_user_id"),
        "workspace_members",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_workspace_members_workspace_id"),
        "workspace_members",
        ["workspace_id"],
        unique=False,
    )

    # 3. Add workspace_id to projects table
    op.add_column("projects", sa.Column("workspace_id", sa.UUID(), nullable=True))
    op.create_foreign_key(
        "fk_projects_workspace_id_workspaces",
        "projects",
        "workspaces",
        ["workspace_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index(
        op.f("ix_projects_workspace_id"), "projects", ["workspace_id"], unique=False
    )


def downgrade() -> None:
    # 1. Remove workspace_id from projects table
    op.drop_index(op.f("ix_projects_workspace_id"), table_name="projects")
    op.drop_constraint(
        "fk_projects_workspace_id_workspaces", "projects", type_="foreignkey"
    )
    op.drop_column("projects", "workspace_id")

    # 2. Drop workspace_members table
    op.drop_index(
        op.f("ix_workspace_members_workspace_id"), table_name="workspace_members"
    )
    op.drop_index(op.f("ix_workspace_members_user_id"), table_name="workspace_members")
    op.drop_table("workspace_members")

    # 3. Drop workspaces table
    op.drop_index(op.f("ix_workspaces_owner_id"), table_name="workspaces")
    op.drop_table("workspaces")
