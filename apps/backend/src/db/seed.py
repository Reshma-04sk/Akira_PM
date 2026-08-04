import asyncio
import logging
import random
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete

from src.core.database import async_session_maker, engine
from src.core.security import get_password_hash
from src.models.attachment import Attachment
from src.models.audit_log import AuditLog
from src.models.comment import Comment
from src.models.notification import Notification, NotificationType
from src.models.project import Project
from src.models.project_member import ProjectMember, ProjectRole
from src.models.task import Task, TaskPriority, TaskStatus
from src.models.user import User, UserRole
from src.models.workspace import Workspace
from src.models.workspace_member import WorkspaceMember

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


async def seed_data():
    logger.info("Starting database seeding...")

    async with async_session_maker() as session:
        # Clear existing data to allow clean re-runs and reset demo environment
        logger.info("Clearing existing database records...")
        await session.execute(delete(AuditLog))
        await session.execute(delete(Notification))
        await session.execute(delete(Attachment))
        await session.execute(delete(Comment))
        await session.execute(delete(Task))
        await session.execute(delete(ProjectMember))
        await session.execute(delete(Project))
        await session.execute(delete(WorkspaceMember))
        await session.execute(delete(Workspace))
        await session.execute(delete(User))
        await session.commit()
        logger.info("Database cleared.")

        # 1. Create users
        logger.info("Generating users...")
        users_data = [
            ("admin@akira-pm.com", "Admin User", UserRole.ADMIN),
            ("jane.doe@akira-pm.com", "Jane Doe", UserRole.USER),
            ("bob.smith@akira-pm.com", "Bob Smith", UserRole.USER),
            ("alice.johnson@akira-pm.com", "Alice Johnson", UserRole.USER),
            ("charlie.brown@akira-pm.com", "Charlie Brown", UserRole.USER),
        ]

        users = []
        for email, name, role in users_data:
            user = User(
                email=email,
                hashed_password=get_password_hash("Password123!"),
                full_name=name,
                role=role,
                is_active=True,
                is_verified=True,
            )
            session.add(user)
            users.append(user)

        await session.flush()
        admin, jane, bob, alice, charlie = users
        logger.info("Created %d users.", len(users))

        # 2. Create Workspace
        logger.info("Generating workspace...")
        workspace = Workspace(
            name="Engineering Workspace",
            description="Main corporate workspace for the central engineering and product development teams.",
            owner_id=admin.id,
        )
        session.add(workspace)
        await session.flush()

        # Add all users as workspace members
        roles = ["owner", "admin", "member", "member", "member"]
        for u, r in zip(users, roles, strict=True):
            ws_member = WorkspaceMember(
                workspace_id=workspace.id,
                user_id=u.id,
                role=r,
            )
            session.add(ws_member)
        await session.flush()

        # 3. Create 5 Projects
        logger.info("Generating 5 Projects...")
        project_defs = [
            (
                "Akira Core Platform",
                "Development of the primary API backend, scaling database routers, caching endpoints, and general microservices.",
            ),
            (
                "Mobile Client (iOS/Android)",
                "React Native mobile workspace and app layout configurations for iOS and Android deployments.",
            ),
            (
                "Data Analytics Pipeline",
                "Infrastructure code for parsing application logs, tracking metrics dashboards, and computing weekly PDF reports.",
            ),
            (
                "Customer Success Portal",
                "React-based administration UI panel for ticket workflows, user profiles management, and payment settings.",
            ),
            (
                "Documentation & Dev Hub",
                "Extended developer onboard guides, API catalog indexing, postman collection schemas, and security checklists.",
            ),
        ]

        projects = []
        for name, desc in project_defs:
            project = Project(
                name=name,
                description=desc,
                owner_id=admin.id,
                workspace_id=workspace.id,
                is_archived=False,
            )
            session.add(project)
            projects.append(project)
        await session.flush()

        # 4. Add Project Members (RBAC Setup)
        logger.info("Assigning project members and roles...")
        for project in projects:
            # Owner
            session.add(
                ProjectMember(
                    project_id=project.id, user_id=admin.id, role=ProjectRole.OWNER
                )
            )
            # Manager (Jane)
            session.add(
                ProjectMember(
                    project_id=project.id,
                    user_id=jane.id,
                    role=ProjectRole.MANAGER,
                    invited_by=admin.id,
                )
            )
            # Developers (Bob, Alice)
            session.add(
                ProjectMember(
                    project_id=project.id,
                    user_id=bob.id,
                    role=ProjectRole.DEVELOPER,
                    invited_by=admin.id,
                )
            )
            session.add(
                ProjectMember(
                    project_id=project.id,
                    user_id=alice.id,
                    role=ProjectRole.DEVELOPER,
                    invited_by=jane.id,
                )
            )
            # Viewer (Charlie)
            session.add(
                ProjectMember(
                    project_id=project.id,
                    user_id=charlie.id,
                    role=ProjectRole.VIEWER,
                    invited_by=admin.id,
                )
            )
        await session.flush()

        # 5. Generate 50 Tasks distributed across projects
        logger.info("Generating 50 Tasks...")
        now = datetime.now(UTC)
        task_list = []

        # We will loop through projects and add tasks to hit exactly 50

        task_templates = [
            # Akira Core Platform
            [
                (
                    "Setup Production Environment",
                    "Configure Render, Vercel, Supabase DB, and Upstash Redis connections.",
                    TaskStatus.DONE,
                    TaskPriority.CRITICAL,
                    0,
                    -5,
                ),
                (
                    "Fix Memory Leak in Rate Limiter",
                    "Implement periodic cleanup of expired keys in the fallback sliding-window logs.",
                    TaskStatus.DONE,
                    TaskPriority.HIGH,
                    0,
                    -3,
                ),
                (
                    "Optimize N+1 DB Queries",
                    "Add eager Loading options to TaskRepository list methods to load assignees and projects.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.HIGH,
                    0,
                    1,
                ),
                (
                    "Implement CSP Headers",
                    "Add Content-Security-Policy to static file routers in Nginx frontend server settings.",
                    TaskStatus.IN_REVIEW,
                    TaskPriority.MEDIUM,
                    1,
                    2,
                ),
                (
                    "Establish JWT Revocation Cache",
                    "Connect Redis hooks to blacklist active access tokens on user logout events.",
                    TaskStatus.TODO,
                    TaskPriority.CRITICAL,
                    2,
                    4,
                ),
                (
                    "Refactor Database Migrations",
                    "Consolidate initial Alembic migration scripts and remove duplicate database indexes.",
                    TaskStatus.TODO,
                    TaskPriority.LOW,
                    2,
                    6,
                ),
                (
                    "Add E2E Testing Suite",
                    "Configure Playwright automation tests for verification of login, workspace creation, and board edits.",
                    TaskStatus.TODO,
                    TaskPriority.MEDIUM,
                    3,
                    10,
                ),
                (
                    "Create API Schema Exporter",
                    "Write script to parse FastAPI routers and generate postman collections.",
                    TaskStatus.DONE,
                    TaskPriority.LOW,
                    1,
                    -1,
                ),
                (
                    "Containerize Development Setup",
                    "Build compose files mapping DB, Redis, Backend, and Frontend for easy setup.",
                    TaskStatus.DONE,
                    TaskPriority.HIGH,
                    0,
                    -10,
                ),
                (
                    "Enforce CORS Strict Mode",
                    "Whitelist exact frontend production domains and remove wildcard settings.",
                    TaskStatus.DONE,
                    TaskPriority.CRITICAL,
                    0,
                    -2,
                ),
                (
                    "Add Logger Middleware",
                    "Write logging middleware tracking API request duration, response statuses, and payloads.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.MEDIUM,
                    3,
                    0,
                ),
                (
                    "Validate Pydantic Inputs",
                    "Add strict length constraints and formatting checks to registration request schemas.",
                    TaskStatus.IN_REVIEW,
                    TaskPriority.HIGH,
                    1,
                    1,
                ),
            ],
            # Mobile Client
            [
                (
                    "Setup React Native Boilerplate",
                    "Initialize Expo workspace and configure TypeScript compiler.",
                    TaskStatus.DONE,
                    TaskPriority.CRITICAL,
                    1,
                    -12,
                ),
                (
                    "Implement JWT Storage",
                    "Configure secure keychain storage of tokens on iOS and Android devices.",
                    TaskStatus.DONE,
                    TaskPriority.HIGH,
                    2,
                    -4,
                ),
                (
                    "Build Authentication Screens",
                    "Design login, registration, password recovery, and email verification UI.",
                    TaskStatus.DONE,
                    TaskPriority.MEDIUM,
                    2,
                    -2,
                ),
                (
                    "Add Projects List Page",
                    "Implement workspace projects grid supporting pull-to-refresh feeds.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.HIGH,
                    3,
                    2,
                ),
                (
                    "Build Kanban Board Screen",
                    "Create horizontal scrolling view mapping To Do, In Progress, In Review, and Done task lists.",
                    TaskStatus.TODO,
                    TaskPriority.CRITICAL,
                    1,
                    5,
                ),
                (
                    "Integrate Push Notifications",
                    "Set up Firebase Cloud Messaging (FCM) to trigger alerts on task assignments.",
                    TaskStatus.TODO,
                    TaskPriority.HIGH,
                    0,
                    8,
                ),
                (
                    "Enable Offline Mode Caching",
                    "Use SQLite storage on devices to enable read access without network coverage.",
                    TaskStatus.TODO,
                    TaskPriority.LOW,
                    3,
                    14,
                ),
                (
                    "Design Task Creation Modal",
                    "Build sliders for priority selection, calendars for due dates, and member select feeds.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.MEDIUM,
                    2,
                    1,
                ),
                (
                    "Add Attachments Selector",
                    "Use native file pickers and image libraries to enable file attachment uploads.",
                    TaskStatus.TODO,
                    TaskPriority.MEDIUM,
                    1,
                    6,
                ),
                (
                    "Optimize Bundles Size",
                    "Configure lazy importing and bundle splitting to decrease app startup latency.",
                    TaskStatus.DONE,
                    TaskPriority.LOW,
                    2,
                    -6,
                ),
            ],
            # Data Analytics Pipeline
            [
                (
                    "Configure Kafka Log Ingestion",
                    "Set up stream ingest endpoints to capture application audit logs.",
                    TaskStatus.DONE,
                    TaskPriority.HIGH,
                    3,
                    -15,
                ),
                (
                    "Setup PostgreSQL Sync Connectors",
                    "Create pipeline copying database records into analytical data warehouses.",
                    TaskStatus.DONE,
                    TaskPriority.HIGH,
                    0,
                    -8,
                ),
                (
                    "Write Metrics Aggregator Services",
                    "Implement python services computing counts of overdue, pending, and finished tasks.",
                    TaskStatus.DONE,
                    TaskPriority.MEDIUM,
                    1,
                    -1,
                ),
                (
                    "Integrate Chart.js in Frontend",
                    "Build charts on Reports page showing task statuses distribution and priority maps.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.CRITICAL,
                    2,
                    1,
                ),
                (
                    "Build Weekly PDF Report Exporter",
                    "Use ReportLab engine to generate clean PDF templates compiling project statistics.",
                    TaskStatus.IN_REVIEW,
                    TaskPriority.HIGH,
                    3,
                    2,
                ),
                (
                    "Automate Email Dispatches",
                    "Write cron tasks triggering SMTP dispatch of weekly reports to workspace owners.",
                    TaskStatus.TODO,
                    TaskPriority.MEDIUM,
                    0,
                    7,
                ),
                (
                    "Setup ClickHouse DB Server",
                    "Establish columnar database container mapping log streams for analytical queries.",
                    TaskStatus.TODO,
                    TaskPriority.HIGH,
                    1,
                    10,
                ),
                (
                    "Track SLA Exceed Events",
                    "Add logic computing elapsed time on task states transitions to flag SLA breaches.",
                    TaskStatus.TODO,
                    TaskPriority.LOW,
                    2,
                    12,
                ),
                (
                    "Build Activity Heatmap Widget",
                    "Design GitHub-style contributions calendar showing audit log densities.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.LOW,
                    3,
                    0,
                ),
                (
                    "Validate Ingestion Pipelines",
                    "Write unit tests verifying stream ingestion logic resilience against schema updates.",
                    TaskStatus.DONE,
                    TaskPriority.MEDIUM,
                    2,
                    -5,
                ),
            ],
            # Customer Success Portal
            [
                (
                    "Design Dashboard UI Grid",
                    "Create portal grid compiling ticket status distributions and user accounts lists.",
                    TaskStatus.DONE,
                    TaskPriority.CRITICAL,
                    1,
                    -20,
                ),
                (
                    "Build Ticket Submission Flow",
                    "Write forms with validators permitting client descriptions upload.",
                    TaskStatus.DONE,
                    TaskPriority.HIGH,
                    2,
                    -10,
                ),
                (
                    "Add Role Elevation Actions",
                    "Implement admin buttons mapping elevation approvals for workspace roles.",
                    TaskStatus.DONE,
                    TaskPriority.MEDIUM,
                    0,
                    -3,
                ),
                (
                    "Integrate Stripe Payments",
                    "Set up webhooks and checkout sessions mapping subscription settings.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.CRITICAL,
                    1,
                    2,
                ),
                (
                    "Build User Subscriptions Tab",
                    "Design billing settings layout displaying pricing options and payment receipts.",
                    TaskStatus.TODO,
                    TaskPriority.HIGH,
                    2,
                    5,
                ),
                (
                    "Add Chat Support Box",
                    "Embed live help widgets permitting immediate messaging interactions.",
                    TaskStatus.TODO,
                    TaskPriority.MEDIUM,
                    3,
                    9,
                ),
                (
                    "Create FAQ Index Feed",
                    "Build searchable catalog storing commonly answered product questions.",
                    TaskStatus.DONE,
                    TaskPriority.LOW,
                    0,
                    -1,
                ),
                (
                    "Setup SLA Escalation Alerts",
                    "Write service sending notification emails when tickets remain open past 24 hours.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.HIGH,
                    1,
                    0,
                ),
                (
                    "Export Ticket Logs to CSV",
                    "Implement file download endpoint building spreadsheets of support logs.",
                    TaskStatus.TODO,
                    TaskPriority.LOW,
                    2,
                    4,
                ),
                (
                    "Implement Portal Rate Limiting",
                    "Protect ticket creation actions from script-based spam submissions.",
                    TaskStatus.DONE,
                    TaskPriority.MEDIUM,
                    3,
                    -5,
                ),
            ],
            # Documentation & Dev Hub
            [
                (
                    "Write Onboarding Guides",
                    "Compile local setup guides explaining dependencies installation steps.",
                    TaskStatus.DONE,
                    TaskPriority.CRITICAL,
                    0,
                    -8,
                ),
                (
                    "Add API Route Dictionary",
                    "Build markdown document detailing endpoints, requests, and success payloads.",
                    TaskStatus.DONE,
                    TaskPriority.HIGH,
                    2,
                    -4,
                ),
                (
                    "Draft Security Policies Docs",
                    "Document JWT lifecycle designs, token rotation limits, and RBAC constraints.",
                    TaskStatus.DONE,
                    TaskPriority.MEDIUM,
                    1,
                    -1,
                ),
                (
                    "Setup Swagger UI Theme",
                    "Inject CSS override files custom-styling Swagger docs with brand palettes.",
                    TaskStatus.IN_PROGRESS,
                    TaskPriority.LOW,
                    3,
                    2,
                ),
                (
                    "Write Database ERD Schema Docs",
                    "Create mermaid graphs visual-mapping tables relations and index columns.",
                    TaskStatus.IN_REVIEW,
                    TaskPriority.HIGH,
                    0,
                    1,
                ),
                (
                    "Build Deployment Guides",
                    "Compile instructions details mapping Vercel, Render, Supabase and Upstash.",
                    TaskStatus.TODO,
                    TaskPriority.MEDIUM,
                    2,
                    5,
                ),
                (
                    "Configure Git Workflow Rules",
                    "Document PR review requirements, branch naming bounds, and commit schemas.",
                    TaskStatus.TODO,
                    TaskPriority.LOW,
                    1,
                    7,
                ),
                (
                    "Verify Relative File Links",
                    "Check documentation references links consistency across all folders.",
                    TaskStatus.DONE,
                    TaskPriority.MEDIUM,
                    3,
                    -2,
                ),
            ],
        ]

        # Populate the database with the defined tasks
        logger.info("Writing tasks definitions...")
        for proj_idx, project in enumerate(projects):
            templates = task_templates[proj_idx]
            assignee_pool = [admin, jane, bob, alice]

            for (
                title,
                desc,
                status,
                priority,
                assignee_offset,
                due_days_offset,
            ) in templates:
                assignee = assignee_pool[assignee_offset]
                due_date = now + timedelta(days=due_days_offset)

                task = Task(
                    title=title,
                    description=desc,
                    status=status,
                    priority=priority,
                    due_date=due_date,
                    project_id=project.id,
                    assignee_id=assignee.id,
                )
                session.add(task)
                task_list.append(task)

        await session.flush()
        logger.info("Successfully populated %d tasks.", len(task_list))

        # 6. Generate Task Comments
        logger.info("Generating task comments...")
        comment_ideas = [
            ("Great progress, let's merge this as soon as CI passes.", jane.id),
            (
                "I encounter an issue when verifying this locally. Will investigate.",
                bob.id,
            ),
            (
                "Found the root cause! The database connection pool was exhausted. Fixed it.",
                admin.id,
            ),
            ("Verified on staging, works as expected.", alice.id),
            ("Let's review the API schema before final approvals.", jane.id),
            ("Is this rate-limited in dev configurations?", bob.id),
            ("Yes, but the limit is set high to facilitate testing.", admin.id),
            ("Looks good to go. Merging.", jane.id),
        ]

        # Add random comments to some tasks
        for k in range(12):
            task = task_list[random.randint(0, len(task_list) - 1)]
            content, writer_id = comment_ideas[k % len(comment_ideas)]
            comment = Comment(
                task_id=task.id,
                user_id=writer_id,
                content=content,
                created_at=now - timedelta(hours=random.randint(1, 24)),
            )
            session.add(comment)
        await session.flush()

        # 7. Generate Task Attachments
        logger.info("Generating task attachments...")
        attachment_defs = [
            ("architecture_diagram.png", "image/png", 1024 * 512),
            ("rate_limiting_fix.patch", "text/plain", 1024 * 4),
            ("weekly_report_metrics.pdf", "application/pdf", 1024 * 1024 * 2),
            ("database_erd.svg", "image/svg+xml", 1024 * 128),
            ("release_notes.md", "text/markdown", 1024 * 12),
        ]

        for k, (filename, mime, size) in enumerate(attachment_defs):
            task = task_list[random.randint(0, len(task_list) - 1)]
            unique_id = uuid.uuid4()
            local_filename = f"{unique_id}_{filename}"
            file_path = f"uploads/{local_filename}"

            attachment = Attachment(
                id=unique_id,
                task_id=task.id,
                uploaded_by=admin.id if k % 2 == 0 else jane.id,
                filename=filename,
                file_path=file_path,
                mime_type=mime,
                file_size=size,
            )
            session.add(attachment)
        await session.flush()

        # 8. Generate Notifications for Admin User
        logger.info("Generating notifications feed alert data...")
        notifications = [
            (
                NotificationType.TASK_ASSIGNED,
                "Task Assigned: Optimize N+1 DB Queries",
                "You have been assigned to this critical task in Akira Core Platform project.",
                False,
            ),
            (
                NotificationType.ROLE_CHANGED,
                "Role Updated: Engineering Workspace",
                "Your role has been elevated to Workspace Owner.",
                True,
            ),
            (
                NotificationType.COMMENT_ADDED,
                "New Comment on: Fix Memory Leak in Rate Limiter",
                "Jane Doe commented: 'Great progress, let's merge this as soon as CI passes.'",
                False,
            ),
            (
                NotificationType.COMMENT_ADDED,
                "Attachment Uploaded: database_erd.svg",
                "Bob Smith uploaded database_erd.svg on 'Write Database ERD Schema Docs' task.",
                True,
            ),
            (
                NotificationType.TASK_UPDATED,
                "Task Updated: Setup React Native Boilerplate",
                "Jane Doe updated the status to Done.",
                False,
            ),
        ]

        for n_type, title, msg, is_read in notifications:
            notif = Notification(
                user_id=admin.id,
                type=n_type,
                title=title,
                message=msg,
                is_read=is_read,
                created_at=now - timedelta(minutes=random.randint(10, 180)),
            )
            session.add(notif)
        await session.flush()

        # 9. Generate Audit Logs for Analytics heatmaps & Activity Feeds
        logger.info("Generating activity audit logs...")
        audit_events = [
            ("user_register", "user", None, {"email": "jane.doe@akira-pm.com"}),
            ("user_register", "user", None, {"email": "bob.smith@akira-pm.com"}),
            ("workspace_create", "workspace", None, {"name": "Engineering Workspace"}),
            ("project_create", "project", None, {"name": "Akira Core Platform"}),
            (
                "project_create",
                "project",
                None,
                {"name": "Mobile Client (iOS/Android)"},
            ),
            ("task_create", "task", None, {"title": "Setup Production Environment"}),
            ("task_create", "task", None, {"title": "Fix Memory Leak in Rate Limiter"}),
            (
                "task_update",
                "task",
                None,
                {"title": "Setup Production Environment", "status": "in_progress"},
            ),
            (
                "project_invite",
                "project_member",
                None,
                {"email": "bob.smith@akira-pm.com", "role": "developer"},
            ),
            (
                "comment_create",
                "comment",
                None,
                {"task": "Setup Production Environment", "commenter": "Jane Doe"},
            ),
        ]

        # Seed several audit log events stretching over the last 15 days
        for day in range(15):
            for action, ent_type, ent_id, details in audit_events:
                # Add random variety of users
                actor = random.choice(users)
                log = AuditLog(
                    user_id=actor.id,
                    action=action,
                    entity_type=ent_type,
                    entity_id=ent_id,
                    details=details,
                    created_at=now - timedelta(days=day, hours=random.randint(0, 23)),
                )
                session.add(log)
        await session.flush()

        await session.commit()
        logger.info(
            "Seeding completed successfully! Akira-PM database is now fully populated."
        )

    await engine.dispose()


if __name__ == "__main__":
    import uuid

    asyncio.run(seed_data())
