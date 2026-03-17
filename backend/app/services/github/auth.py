import time

import jwt

from app.core.config import settings
from app.services.github.client import github_request


async def get_installation_token(installation_id):
    now = int(time.time())
    payload = {"iat": now, "exp": now + 600, "iss": settings.github_app_id}
    jwt_token = jwt.encode(payload, settings.github_private_key, algorithm="RS256")

    resp = await github_request(
        "POST", f"/app/installations/{installation_id}/access_tokens", jwt_token
    )

    token = resp.json()["token"]
    return token
