import logging
import os

import inngest

inngest_client = inngest.Inngest(
    app_id="bughop",
    logger=logging.getLogger("uvicorn"),
    is_production=os.getenv("ENVIRONMENT") == "production",
)
