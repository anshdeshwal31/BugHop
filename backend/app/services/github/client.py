import httpx

GITHUB_API = "https://api.github.com"

async def github_request(method, path, token, *, accept="application.vnd.github+json", **kwargs):
    headers = {"Authorization": f"Bearer {token}", "Accept": accept}
    async with httpx.AsyncClient(base_url=GITHUB_API) as client:
        return await client.request(method, path, headers=headers, **kwargs)