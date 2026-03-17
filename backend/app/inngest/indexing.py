import hashlib

import inngest

from app.inngest.client import inngest_client
from app.services import embeddings, github, vectordb
from app.services.chunker import chunk_code, create_chunk_text_for_embedding
from app.services.frontend import update_indexing_status


@inngest_client.create_function(
    fn_id="handle_installation",
    trigger=inngest.TriggerEvent(event="installation/created"),
)
async def handle_installation(ctx: inngest.Context):
    installation_id = ctx.event.data["installation_id"]
    account = ctx.event.data["account"]
    repo_name = ctx.event.data["repo_name"]
    repo_full_name = f"{account}/{repo_name}"

    await update_indexing_status(repo_full_name, "INDEXING")

    token = await github.get_installation_token(installation_id)

    files = await github.get_repo_files(account, repo_name, token)

    all_points = []

    for file in files:
        file_path = file["path"]
        content = file["content"]

        chunks = chunk_code(content, file_path)

        for chunk in chunks:
            text_for_embedding = create_chunk_text_for_embedding(chunk)
            vector = await embeddings.create_embedding(text_for_embedding)

            chunk_id = make_chunk_id(
                repo_full_name, chunk.file_path, chunk.start_line, chunk.end_line
            )

            point = vectordb.create_point(
                id=chunk_id,
                vector=vector,
                payload={
                    "repo": repo_full_name,
                    "path": chunk.file_path,
                    "content": chunk.content,
                    "chunk_type": chunk.name,
                    "name": chunk.name,
                    "language": chunk.language,
                    "start_line": chunk.start_line,
                    "end_line": chunk.end_line,
                },
            )

            all_points.append(point)

    vectordb.upsert_embeddings(all_points)

    await update_indexing_status(repo_full_name, "COMPLETED")
