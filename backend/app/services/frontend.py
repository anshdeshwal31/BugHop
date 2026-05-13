import httpx

from app.core.config import settings


async def post(endpoint, data):
    async with httpx.AsyncClient(follow_redirects=True) as client:
        await client.post(f"{settings.frontend_url}{endpoint}", json=data, timeout=10.0)


async def fetch_custom_rules(installation_id):
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(
            f"{settings.frontend_url}/api/rules/by-installation/{installation_id}",
            timeout=10.0,
        )

        try:
            return resp.json().get("rules", [])
        except Exception:
            print(
                f"fetch_custom_rules: could not parse response "
                f"(status={resp.status_code}): {resp.text[:200]}"
            )
            return []


async def log_pr_review(repo_full_name, pr_number, pr_title, pr_github_id):
    await post(
        "/api/logs/review",
        {
            "repoFullName": repo_full_name,
            "prNumber": pr_number,
            "prTitle": pr_title,
            "prGithubId": pr_github_id,
        },
    )


async def log_issue_analysis(
    repo_full_name, issue_number, issue_title, issue_github_id
):
    await post(
        "/api/logs/issue",
        {
            "repoFullName": repo_full_name,
            "issueNumber": issue_number,
            "issueTitle": issue_title,
            "issueGithubId": issue_github_id,
        },
    )


async def log_pr_creation(
    repo_full_name, pr_number, pr_title, pr_github_id, issue_number
):
    await post(
        "/api/logs/pr",
        {
            "repoFullName": repo_full_name,
            "prNumber": pr_number,
            "prTitle": pr_title,
            "prGithubId": pr_github_id,
            "issueNumber": issue_number,
        },
    )


async def update_indexing_status(
    repo_full_name,
    status,
    *,
    installation_id=None,
    repo_github_id=None,
    repo_name=None,
):
    payload = {
        "repoFullName": repo_full_name,
        "status": status,
    }

    if installation_id is not None:
        payload["installationId"] = installation_id
    if repo_github_id is not None:
        payload["repoGithubId"] = repo_github_id
    if repo_name:
        payload["repoName"] = repo_name

    await post("/api/indexing/update", payload)
