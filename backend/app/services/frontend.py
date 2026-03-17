import httpx

from app.core.config import settings


async def post(endpoint, data):
    async with httpx.AsyncClient() as client:
        await client.post(f"{settings.frontend_url}{endpoint}", json=data, timeout=10.0)


async def fetch_custom_rules(installation_id):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{settings.frontend_url}/api/rules/by-installation/{installation_id}",
            timeout=10.0,
        )

        return resp.json().get("rules", [])


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


async def update_indexing_status(repo_full_name, status):
    await post(
        "/api/indexing/update", {"repoFullName": repo_full_name, "status": status}
    )
