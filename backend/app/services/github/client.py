import asyncio

import httpx

from app.core.config import settings

GITHUB_API = "https://api.github.com"


async def github_request(
    method,
    path,
    token,
    *,
    accept="application/vnd.github+json",
    **kwargs,
):
    headers = {"Authorization": f"Bearer {token}", "Accept": accept}
    timeout = kwargs.pop("timeout", settings.github_timeout_seconds)

    for attempt in range(1, 4):
        try:
            async with httpx.AsyncClient(base_url=GITHUB_API, timeout=timeout) as client:
                resp = await client.request(method, path, headers=headers, **kwargs)
            if resp.status_code >= 400:
                raise RuntimeError(
                    f"GitHub API error ({resp.status_code}) for {path}: {resp.text}"
                )
            return resp
        except (httpx.TimeoutException, httpx.ConnectError):
            if attempt == 3:
                raise
            await asyncio.sleep(0.6 * attempt)