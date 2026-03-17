from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.routers import webhooks, chat
from app.services.vectordb import init_collection, get_client

import inngest.fast_api
from app.inngest.client import inngest_client
from app.inngest import indexing, auto_pr

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks.router, tags=["webhooks"])
app.include_router(chat.router, tags=["chat"])

@app.on_event("startup")
async def startup():
    init_collection()


@app.get("/")
def root():
    return {"message": "coderabbit clone backend"}


@app.get("/health")
async def health_check():
    from fastapi.responses import JSONResponse

    checks = {
        "server": "ok",
        "qdrant": "ok",
    }

    try:
        qdrant_client = get_client()
        qdrant_client.get_collections()
    except Exception as e:
        checks["qdrant"] = str(e)

    has_errors = checks["qdrant"] != "ok"

    if has_errors:
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "checks": checks}
        )

    return {"status": "healthy", "checks": checks}

inngest.fast_api.serve(app, inngest_client, [indexing.handle_installation, auto_pr.handle_auto_pr])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
