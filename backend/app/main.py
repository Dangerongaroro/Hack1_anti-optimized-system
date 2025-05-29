# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router as api_router # routes.py からインポート

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # フロントエンドのオリジン
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api") # /api プレフィックスでルーターを登録

@app.get("/") # おまけ:ルートパス
async def read_root():
    return {"Hello": "Seren Paths Backend"}