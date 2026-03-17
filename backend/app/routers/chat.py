from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatPayload, ChatResponse
from app.services.embeddings import create_embedding
from app.services.llm import chat_with_repo
from app.services.vectordb import search

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_codebase(data: ChatPayload):
    question = data.question
    repo = data.repo

    question_embedding = await create_embedding(question)

    search_results = await search(question_embedding, limit=5, repo=repo)

    code_context = ""
    for point in search_results:
        payload = point.payload
        path = payload.get("path", "unknown")
        content = payload.get("content", "")
        chunk_type = payload.get("chunk_type", "code")
        name = payload.get("name", "")
        language = payload.get("language", "")
        start_line = payload.get("start_line", 0)
        end_line = payload.get("end_line", 0)
        parent_class = payload.get("parent_class", "")

        header = f"File: {path}"
        if name:
            if parent_class:
                header += f" | Method: {parent_class}.{name}"
            else:
                header += f" | {chunk_type.capitalize()}: {name}"
        if start_line and end_line:
            header += f" (lines {start_line}-{end_line})"

        code_context += f"\n--- {header} ---\n```{language}\n{content}\n```\n"

    answer = await chat_with_repo(question, code_context)

    if not answer:
        return

    return ChatResponse(answer=answer)
