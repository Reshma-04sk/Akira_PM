PROMPT_TEMPLATES: dict[str, dict[str, str]] = {
    "task_summary": {
        "system": "You are a professional project manager. Summarize the task details clearly, highlighting key objectives, deliverables, and blockers.",
        "user": (
            "Summarize the following task:\n"
            "Title: {title}\n"
            "Description: {description}\n"
            "Status: {status}\n"
            "Priority: {priority}"
        ),
    },
    "sprint_summary": {
        "system": "You are an Agile Sprint Master. Summarize the sprint achievements, velocity metrics, carried-over items, and overall delivery rating.",
        "user": (
            "Analyze the sprint data and generate a summary:\n"
            "Sprint Name: {name}\n"
            "Completed Tasks Count: {completed_count}\n"
            "Remaining Tasks Count: {remaining_count}\n"
            "Blockers Noted: {blockers}"
        ),
    },
    "project_health": {
        "system": "You are a senior executive dashboard analyst. Evaluate the project metrics and summarize the overall health status, high-level risks, and recommended actions.",
        "user": (
            "Generate a Project Health Report for:\n"
            "Project Name: {name}\n"
            "Overall Completion %: {progress_percent}%\n"
            "Active Overdue Tasks: {overdue_count}\n"
            "Days to Deadline: {days_left}\n"
            "Recent Activity Logs: {recent_logs}"
        ),
    },
    "task_generator": {
        "system": "You are a Scrum Product Owner. Generate a list of actionable child tasks/subtasks based on a high-level goal description.",
        "user": (
            "Based on the following main objective, generate a structured subtask list:\n"
            "Objective: {objective}\n"
            "Scope Details: {scope}\n"
            "Target Audience: {target_audience}"
        ),
    },
    "acceptance_criteria": {
        "system": "You are a Quality Assurance Architect. Formulate detailed, clear BDD (Given-When-Then) acceptance criteria for the user story.",
        "user": (
            "Generate BDD Acceptance Criteria for this story:\n"
            "Story Title: {title}\n"
            "Description: {description}\n"
            "Technical Notes: {notes}"
        ),
    },
    "standup_summary": {
        "system": "You are a virtual Agile assistant. Summarize standup notes into structured team status reports (Yesterday, Today, Blockers).",
        "user": (
            "Summarize this team member's standup updates:\n"
            "Yesterday: {yesterday}\n"
            "Today: {today}\n"
            "Blockers: {blockers}"
        ),
    },
}


def render_prompt(template_name: str, **kwargs) -> dict[str, str]:
    """
    Retrieves a template by name and renders it using provided arguments.

    Args:
        template_name: Name of the template (e.g. 'task_summary').
        **kwargs: Format parameters for the prompt template.

    Returns:
        dict with keys "system" and "user".
    """
    if template_name not in PROMPT_TEMPLATES:
        raise ValueError(f"Prompt template '{template_name}' not found.")

    template = PROMPT_TEMPLATES[template_name]
    try:
        user_rendered = template["user"].format(**kwargs)
    except KeyError as e:
        raise ValueError(
            f"Missing required parameter '{e.args[0]}' for template '{template_name}'"
        ) from e

    return {"system": template["system"], "user": user_rendered}
