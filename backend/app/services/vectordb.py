from urllib.parse import urlparse, urlunparse

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PayloadSchemaType,
    PointStruct,
    VectorParams,
)

from app.core.config import settings

def _normalize_qdrant_url(raw_url: str) -> str:
    if not raw_url:
        return raw_url

    parsed = urlparse(raw_url)
    if not parsed.scheme or not parsed.netloc:
        return raw_url

    if parsed.port is not None:
        return raw_url

    netloc = f"{parsed.hostname}:6333"
    return urlunparse(
        (parsed.scheme, netloc, parsed.path, parsed.params, parsed.query, parsed.fragment)
    )


client = QdrantClient(
    url=_normalize_qdrant_url(settings.qdrant_url),
    api_key=settings.qdrant_api_key,
)

COLLECTION_NAME = "bughop"


def init_collection():
    try:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
        )
    except Exception:
        pass

    try:
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="repo",
            field_schema=PayloadSchemaType.KEYWORD,
        )
    except Exception:
        pass


def upsert_embeddings(points):
    client.upsert(collection_name=COLLECTION_NAME, points=points)


async def search(embedding, repo, limit=5):

    query_filter = None
    if repo:
        query_filter = Filter(
            must=[FieldCondition(key="repo", match=MatchValue(value=repo))]
        )

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=embedding,
        query_filter=query_filter,
        with_payload=True,
        limit=limit,
    )
    return results.points


def create_point(id, vector, payload):
    return PointStruct(id=id, vector=vector, payload=payload)


def get_client():
    return client
