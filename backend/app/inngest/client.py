import logging
import os

import inngest

inngest_client = inngest.Inngest(
    app_id="coderabbit_6767",
    logger=logging.getLogger("uvicorn"),
    is_production=os.getenv("ENVIRONMENT") == "production",
)
