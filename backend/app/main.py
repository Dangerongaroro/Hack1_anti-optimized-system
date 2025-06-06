
# backend/app/main.py - 構文エラー修正版
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routes import router as api_router

app = FastAPI(
    title="Seren Paths API",
    description="アンチ最適化による新しい体験発見サービス",
    version="1.0.0"
)

# CORS設定を拡張（デプロイ用） - 構文エラー修正
app.add_middleware(
    CORSMiddleware,    allow_origins=[  # ← カンマを追加して修正
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://frontend.onrender.com",
        "https://seren-paths-frontend.onrender.com",
        "https://hack1-anti-optimized-system.onrender.com",
        "*"  # 一時的にすべて許可（デバッグ用）
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

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Seren Paths API",
        "version": "1.0.0"
    }