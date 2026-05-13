from fastapi import APIRouter

from app.services.github.auth import get_installation_token
from app.services.github.client import github_request

router = APIRouter()


@router.get("/installation/{installation_id}/repos")
async def list_installation_repos(installation_id: str):
    """
    Returns the list of repositories accessible to a GitHub App installation.
    Uses the installation token (JWT-signed by the App's private key) —
    the same authentication mechanism used everywhere else in this backend.
    """
    token = await get_installation_token(installation_id)
    resp = await github_request("GET", "/installation/repositories", token)
    data = resp.json()
    repos = data.get("repositories", [])
    return {
        "repos": [
            {
                "id": r["id"],
                "name": r["name"],
                "full_name": r["full_name"],
            }
            for r in repos
        ]
    }
