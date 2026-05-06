import asyncio

import httpx
from huggingface_hub import InferenceClient
from huggingface_hub.errors import HfHubHTTPError
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.core.config import settings


_HF_TIMEOUT_SECONDS = 30.0
_MAX_EMBED_CHARS = 4000


def _build_embeddings_client():
    if settings.embedding_provider == "huggingface":
        return InferenceClient(
            model=settings.embedding_model,
            token=settings.huggingface_api_key,
            timeout=_HF_TIMEOUT_SECONDS,
        )

    return GoogleGenerativeAIEmbeddings(
        model=settings.embedding_model,
        google_api_key=settings.google_api_key,
    )


embeddings_client = _build_embeddings_client()


async def create_embedding(text):
    if settings.embedding_provider == "huggingface":
        safe_text = text[:_MAX_EMBED_CHARS]
        # Avoid async client incompatibilities by using the sync client in a worker thread.
        for attempt in range(1, 4):
            try:
                return await asyncio.to_thread(
                    embeddings_client.feature_extraction, safe_text
                )
            except HfHubHTTPError as exc:
                status = getattr(getattr(exc, "response", None), "status_code", None)
                if attempt == 3 or status not in {429, 500, 502, 503, 504}:
                    raise
            except httpx.HTTPError:
                if attempt == 3:
                    raise
                await asyncio.sleep(0.8 * attempt)

    return await embeddings_client.aembed_query(text[:_MAX_EMBED_CHARS])


async def create_embeddings(texts):
    safe_texts = [text[:_MAX_EMBED_CHARS] for text in texts]
    if settings.embedding_provider == "huggingface":
        for attempt in range(1, 4):
            try:
                return await asyncio.to_thread(
                    embeddings_client.feature_extraction, safe_texts
                )
            except HfHubHTTPError as exc:
                status = getattr(getattr(exc, "response", None), "status_code", None)
                if attempt == 3 or status not in {429, 500, 502, 503, 504}:
                    raise
            except httpx.HTTPError:
                if attempt == 3:
                    raise
                await asyncio.sleep(0.8 * attempt)

    if hasattr(embeddings_client, "aembed_documents"):
        return await embeddings_client.aembed_documents(safe_texts)

    vectors = []
    for text in safe_texts:
        vectors.append(await embeddings_client.aembed_query(text))
    return vectors
