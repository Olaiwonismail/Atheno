from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import auth, quizzes, essays, analytics,teacher
# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Atheno Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth, prefix="/auth", tags=["auth"])
app.include_router(quizzes, prefix="/quizzes", tags=["quizzes"])
app.include_router(essays, prefix="/essays", tags=["essays"])
app.include_router(analytics, prefix="/analytics", tags=["analytics"])
app.inpp.include_router(teacher, prefix="/teacher", tags=["teacher"])
@app.get("/")
async def root():
    return {"message": "Atheno Backend API"}