from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.core.config import settings

embeddings_client = GoogleGenerativeAIEmbeddings(
    model=settings.embedding_model,
    google_api_key=settings.google_api_key,
)


async def create_embedding(text):
    return await embeddings_client.aembed_query(text)
