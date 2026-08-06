import logging

import httpx

from src.core.settings import settings

logger = logging.getLogger("saas_backend")


async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Sends a transactional email using the Resend API.
    Uses httpx for request sending to avoid heavy library dependencies.
    """
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY is not configured. Email to %s skipped.", to_email)
        return False

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "from": "Akira-PM <onboarding@resend.dev>",  # Sandbox domain default
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code in [200, 201]:
                logger.info("Resend transactional email sent successfully to %s", to_email)
                return True
            logger.error("Resend API error: %s - %s", response.status_code, response.text)
    except Exception as e:
        logger.error("Failed to transmit email to %s: %s", to_email, str(e))

    return False
