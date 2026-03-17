from openai import OpenAI

from app.core.config import settings

client = OpenAI(api_key=settings.openai_api_key)


async def create_embedding(text):
    response = client.embeddings.create(input=text, model="text-embedding-3-small")
    embedding = response.data[0].embedding
    return embedding
