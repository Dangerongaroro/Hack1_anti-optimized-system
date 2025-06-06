
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .routes import router as api_router

# .envファイルを読み込み
load_dotenv()

# 環境変数からCORS設定を取得
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://hack1-anti-optimized-system.onrender.com")
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://localhost:5174",
    "https://frontend.onrender.com",
    "https://hack1-anti-optimized-system.onrender.com",  # 実際のフロントエンドURL
    FRONTEND_URL
]

# デバッグモードの場合は全て許可
if os.getenv("DEBUG", "false").lower() == "true":
    ALLOWED_ORIGINS.append("*")

app = FastAPI(
    title="Seren Paths API",
    description="アンチ最適化による新しい体験発見サービス",
    version="1.0.0",
    docs_url="/docs" if os.getenv("DEBUG", "false").lower() == "true" else None,
    redoc_url="/redoc" if os.getenv("DEBUG", "false").lower() == "true" else None
)

# CORS設定（デプロイ対応）
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,  # デプロイ時は認証情報を無効化
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
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