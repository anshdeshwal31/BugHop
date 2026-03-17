from app.services import embeddings, github, llm, vectordb
from app.services.frontend import fetch_custom_rules, log_pr_review


async def handle_pull_request(payload):
    installation_id = str(payload["installation"]["id"])
    pr = payload["pull_request"]
    repo = payload["repository"]
    owner = repo["owner"]["login"]
    repo_name = repo["name"]
    pr_number = pr["number"]
    title = pr["title"]
    description = pr.get("body", "") or ""

    token = await github.get_installation_token(installation_id)

    diff = await github.get_pr_diff(owner, repo_name, pr_number, token)
    files_changed = await github.get_pr_files(owner, repo_name, pr_number, token)

    repo_full_name = f"{owner}/{repo_name}"

    diff_embedding = await embeddings.create_embedding(diff[:8000])
    search_results = await vectordb.search(diff_embedding, limit=5, repo=repo_full_name)

    related_code = ""
    for point in search_results:
        payload_data = point.payload
        path = payload_data.get("path", "unknown")
        content = payload_data.get("content", "")
        name = payload_data.get("name", "")
        chunk_type = payload_data.get("chunk_type", "code")

        header = f"File: {path}"
        if name:
            header += f" | {chunk_type}: {name}"

        related_code += f"\n-- {header} ---\n{content}\n"

    custom_rules = await fetch_custom_rules(installation_id)

    comment = await llm.review_pull_request(
        title=title,
        description=description,
        diff=diff,
        files_changed=files_changed,
        related_code=related_code,
        custom_rules=custom_rules,
    )

    await github.post_comment(owner, repo_name, pr_number, comment, token)

    pr_github_id = pr.get("id", 0)

    await log_pr_review(f"{owner / repo_name}", pr_number, title, pr_github_id)
