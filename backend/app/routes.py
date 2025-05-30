# backend/app/routes.py
from fastapi import APIRouter, HTTPException
from .schemas import (
    RecommendationRequest, 
    FeedbackRequest, 
    PreferencesUpdateRequest,
    ChallengeResponse,
    StandardResponse,
    AnalysisResponse
)
from .services import get_recommendation_service, process_feedback_service, update_preferences_service

router = APIRouter()

@router.post("/recommendations", response_model=ChallengeResponse)
async def get_recommendation_endpoint(request: RecommendationRequest):
    """新しいチャレンジを取得"""
    try:
        result = get_recommendation_service(request.level, request.preferences)
        if result.get("status") == "success" and "data" in result:
            return result["data"]
        else:
            return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"レコメンド生成に失敗しました: {str(e)}")

@router.post("/feedback", response_model=StandardResponse)
async def send_feedback_endpoint(request: FeedbackRequest):
    """体験フィードバックを送信"""
    try:
        result = process_feedback_service(request.experience_id, request.feedback)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"フィードバック処理に失敗しました: {str(e)}")

@router.post("/preferences/update", response_model=AnalysisResponse)
async def update_preferences_endpoint(request: PreferencesUpdateRequest):
    """ユーザー嗜好を更新"""
    try:
        result = update_preferences_service(request.experiences)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"嗜好更新に失敗しました: {str(e)}")

@router.get("/health")
async def health_check():
    """ヘルスチェック"""
    return {"status": "healthy", "service": "Seren Paths API"}

@router.get("/challenges/levels")
async def get_challenge_levels():
    """利用可能なチャレンジレベル情報を取得"""
    return {
        "levels": {
            1: {
                "name": "プチ・ディスカバリー",
                "description": "日常の小さな変化を楽しみたい",
                "emoji": "🌱",
                "estimated_time": "5-15分"
            },
            2: {
                "name": "ウィークエンド・チャレンジ",
                "description": "休日に新しいことに挑戦したい",
                "emoji": "🚀",
                "estimated_time": "1-3時間"
            },
            3: {
                "name": "アドベンチャー・クエスト",
                "description": "大きな体験にも挑戦してみたい",
                "emoji": "⭐",
                "estimated_time": "半日以上"
            }
        }
    }