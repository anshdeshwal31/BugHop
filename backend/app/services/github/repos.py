import base64

import httpx

from app.services.github.client import GITHUB_API, github_request

SKIP_FILES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lockb",
    "composer.lock",
    "Gemfile.lock",
    "Pipfile.lock",
    "poetry.lock",
    "cargo.lock",
    "go.sum",
    ".DS_Store",
    "thumbs.db",
}

SKIP_DIRS = {
    "node_modules",
    ".git",
    ".svn",
    ".hg",
    "dist",
    "build",
    ".next",
    ".nuxt",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    "venv",
    ".venv",
    "env",
    ".env",
    "vendor",
    "target",
    "coverage",
    ".coverage",
    ".nyc_output",
}

SKIP_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".ico",
    ".svg",
    ".webp",
    ".bmp",
    ".mp3",
    ".mp4",
    ".wav",
    ".avi",
    ".mov",
    ".webm",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".zip",
    ".tar",
    ".gz",
    ".rar",
    ".7z",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".otf",
    ".min.js",
    ".min.css",
}

MAX_FILE_SIZE = 100 * 1024


def should_skip_file(path, content_size):
    filename = path.split("/")[-1].lower()

    if filename in SKIP_FILES:
        return True

    path_parts = path.lower().split("/")
    for part in path_parts[:-1]:
        if part in SKIP_DIRS:
            return True

    for ext in SKIP_EXTENSIONS:
        if filename.endswith(ext):
            return True

    if content_size > MAX_FILE_SIZE:
        return True

    return False


async def get_repo_files(owner, repo, token):
    files = []
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }

    async with httpx.AsyncClient(base_url=GITHUB_API) as client:

        async def fetch_directory(path=""):
            if path:
                dir_name = path.split("/")[-1].lower()
                if dir_name in SKIP_DIRS:
                    return
            resp = await client.get(
                f"/repos/{owner}/{repo}/contents/{path}", headers=headers
            )
            items = resp.json()

            for item in items:
                if item["type"] == "file":
                    if should_skip_file(item["path"], item.get("size", 0)):
                        continue
                    file_resp = await client.get(item["url"], headers=headers)
                    file_data = file_resp.json()

                    content = base64.b64decode(file_data["content"]).decode("utf-8")
                    files.append({"path": item["path"], "content": content})

                elif item["type"] == "dir":
                    await fetch_directory(item["path"])

        await fetch_directory()
    return files


async def get_file_content(owner, repo, path, token, ref):
    resp = await github_request(
        "GET", f"/repos/{owner}/{repo}/contents/{path}", token, params={"ref": ref}
    )
    data = resp.json()
    content = base64.b64decode(data["content"]).decode("utf-8")
    return {
        "content": content,
        "sha": data["sha"],
        "encoding": data.get("encoding", "base64"),
    }


async def get_default_branch(owner, repo, token):
    resp = await github_request("GET", f"/repos/{owner}/{repo}", token)

    return resp.json()["default_branch"]
