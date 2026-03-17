import base64

from app.services.github.client import github_request


async def get_pr_diff(owner, repo, pr_number, token):
    resp = await github_request(
        "GET",
        f"/repos/{owner}/pulls/{pr_number}",
        token,
        accept="application/vnd.github.v3.diff",
    )
    return resp.text


async def get_pr_files(owner, repo, pr_number, token):
    resp = await github_request(
        "GET",
        f"/repos/{owner}/pulls/{pr_number}/files",
        token,
    )
    files = resp.json()
    filenames = [f["filename"] for f in files]
    return filenames


async def post_comment(owner, repo, issue_number, comment, token):
    resp = await github_request(
        "POST",
        f"/repos/{owner}/{repo}/issues/{issue_number}/comments",
        token,
        json={"body": comment},
    )
    return resp.json()


async def create_branch(owner, repo, branch_name, from_ref, token):
    resp = await github_request(
        "GET",
        f"/repos/{owner}/{repo}/git/ref/heads{from_ref}",
        token,
    )
    sha = resp.json()["object"]["sha"]

    resp = await github_request(
        "POST",
        f"/repos/{owner}/{repo}/git/refs",
        token,
        json={"ref": f"refs/heads/{branch_name}", "sha": sha},
    )
    return resp.json()


async def create_or_update_file(
    owner, repo, path, content, message, branch, token, sha
):
    body = {
        "message": message,
        "content": base64.b64encode(content.encode("utf-8")).decode("utf-8"),
        "branch": branch,
    }
    resp = await github_request(
        "PUT", f"/repo{owner}/{repo}/contents/{path}", token, json=body
    )
    return resp.json()


async def delete_file(owner, repo, path, message, branch, token, sha):
    resp = await github_request(
        "DELETE",
        f"/repos/{owner}/{repo}/contents/{path}",
        token,
        json={"message": message, "sha": sha, "branch": branch},
    )

    return resp.json()


async def create_pull_request(owner, repo, title, body, head, base, token):
    resp = await github_request(
        "POST",
        f"/repos/{owner}/{repo}/pulls",
        token,
        json={"title": title, "body": body, "head": head, "base": base},
    )
    return resp.json()
