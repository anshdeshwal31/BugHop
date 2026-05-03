import inngest

from app.inngest import inngest_client


async def handle_installation(payload):
    installation_id = str(payload["installation"]["id"])
    account = payload["installation"]["account"]["login"]
    repositories = payload.get("repositories", [])

    repo_name = repositories[0]["name"]
    try:
        await inngest_client.send(
            inngest.Event(
                name="installation/created",
                data={
                    "installation_id": installation_id,
                    "account": account,
                    "repositories": repositories,
                    "repo_name": repo_name,
                },
            )
        )
    except Exception as exc:
        # Inngest may be unavailable in local dev; avoid failing the webhook.
        print(f"Inngest send failed: {exc}")
