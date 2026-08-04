# Guided Demo & Walkthrough

This document outlines a step-by-step walkthrough to explore and present Akira-PM using the pre-seeded demo data.

---

## 1. Demo Credentials

The database contains pre-configured test users. All profiles share the same password: **`Password123!`**

| Email | Display Name | Workspace Role | Project Role |
| :--- | :--- | :--- | :--- |
| `admin@akira-pm.com` | Admin User | Owner / Admin | Owner |
| `jane.doe@akira-pm.com` | Jane Doe | Workspace Member | Project Manager |
| `bob.smith@akira-pm.com` | Bob Smith | Workspace Member | Developer |
| `alice.johnson@akira-pm.com` | Alice Johnson | Workspace Member | Developer |
| `charlie.brown@akira-pm.com` | Charlie Brown | Workspace Member | Viewer (Read-only)|

---

## 2. Walkthrough Steps

### Step 1: Login & Workspace Overview
1. Open the login page at [http://localhost:5173/login](http://localhost:5173/login).
2. Authenticate as **`admin@akira-pm.com`** with password **`Password123!`**.
3. You will land on the **Dashboard**. Note the pre-populated widgets:
   - **Task Status Overview**: Visual breakdown of tasks.
   - **Assigned Tasks Feed**: Real-time list of items assigned to you.
   - **Recent Activity Heatmap**: Grid showing audit log frequencies.

---

### Step 2: Explore the Interactive Kanban Board
1. Click **Projects** in the sidebar, then select **Akira Core Platform**.
2. Navigate to the task board view. Note the 4 status columns populated with tasks:
   - Drag a task (e.g., *Setup Production Environment*) from **In Progress** to **Done**.
   - Note the instant UI updates and cache updates managed via React Query.
3. Open a task's details drawer:
   - Review pre-seeded discussions (Comments) from team members.
   - Click the attachments area and view mock files (e.g., *weekly_report_metrics.pdf*).

---

### Step 3: Check the Calendar Schedule
1. Click **Calendar** in the sidebar.
2. Filter tasks by project.
3. Observe how tasks are dynamically rendered on the calendar grid based on their `due_date`, illustrating milestones and deadlines.

---

### Step 4: Review Workspace Analytics Reports
1. Click **Reports** in the sidebar.
2. Examine the generated analytics panels:
   - **Completion Velocity**: Completed vs. overdue task ratios.
   - **Priority Distribution**: Heatmaps illustrating workload severities.
   - **Activity Logs Feed**: Live scrollable feed of database operations (e.g., project creations, member elevations) fetched from audit logs.
