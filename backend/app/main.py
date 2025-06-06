from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routes import router as api_router

app = FastAPI(
    title="Seren Paths API",
    description="アンチ最適化による新しい体験発見サービス",
    version="1.0.0"
)

# CORS設定を拡張（デプロイ用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.vercel.app",  # Vercelドメイン用
        "https://hack1-anti-optimized-system.onrender.com"  # カスタムドメインがあれば
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def read_root():
    return {
        "message": "Seren Paths Backend API",
        "version": "1.0.0",
        "status": "running"
    }