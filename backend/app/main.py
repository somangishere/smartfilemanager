import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.limiter import limiter

print("🔥 MAIN.PY LOADED")

# 🔥 INIT APP
app = FastAPI()

# =========================
# 🔥 RATE LIMITING
# In-memory per-IP limiter. Resets on restart, which is fine
# since the free backend already restarts on its own — this
# just stops a single visitor from burning the whole Groq quota.
# =========================
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# =========================
# 🔥 CORS (HARUS DI ATAS)
# ALLOWED_ORIGINS env var: comma-separated list of allowed
# frontend origins (e.g. your Vercel domain). Falls back to
# local dev origins if unset.
# =========================
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 🔥 IMPORT SETELAH APP
# =========================
from app.core.database import Base, engine
from app.models.document import Document
from app.services.vector_service import init_vector_store

from app.api.routes.document_routes import router as document_router
from app.api.routes.upload_routes import router as upload_router

# =========================
# 🔥 ROUTES
# =========================
app.include_router(document_router)
app.include_router(upload_router)

# =========================
# 🔥 DB INIT
# =========================
Base.metadata.create_all(bind=engine)
init_vector_store()

# =========================
# 🔥 ROOT
# =========================
@app.get("/")
def root():
    return {"message": "API is running"}

# =========================
# 🔥 DB TEST
# =========================
try:
    conn = engine.connect()
    print("DB CONNECTED")
    conn.close()
except Exception as e:
    print("DB ERROR:", e)