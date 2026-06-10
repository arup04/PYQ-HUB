import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routes.auth import router as auth_router
from app.routes.streams import router as streams_router
from app.routes.branches import router as branches_router
from app.routes.subjects import router as subjects_router
from app.routes.papers import router as papers_router

app = FastAPI(title=settings.PROJECT_NAME)

# Configure CORS for local development (Vite runs on port 5173 by default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(streams_router, prefix=settings.API_V1_STR)
app.include_router(branches_router, prefix=settings.API_V1_STR)
app.include_router(subjects_router, prefix=settings.API_V1_STR)
app.include_router(papers_router, prefix=settings.API_V1_STR)

# Serve local uploads statically if local storage is enabled
if settings.STORAGE_TYPE == "local":
    # Ensure upload directory exists relative to current run context
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Mount static assets to /api/uploads
    app.mount("/api/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/")
async def root():
    return {"message": "Welcome to the Previous Year Question (PYQ) Hub API!"}
