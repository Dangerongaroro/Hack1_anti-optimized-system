# backend/app/routes.py
from fastapi import APIRouter, HTTPException
from .schemas import (
    RecommendationRequest, 
    FeedbackRequest, 
    PreferencesUpdateRequest,
    ChallengeResponse,
    StandardResponse,
    AnalysisResponse,
    UserStatsResponse
)
from .services import (
    get_recommendation_service, 
    process_feedback_service, 
    update_preferences_service,
    analyze_growth_trends,
    serendipity_engine
)

router = APIRouter()

@router.post("/recommendations", response_model=ChallengeResponse)
async def get_recommendation_endpoint(request: RecommendationRequest):
    """パーソナライズされたチャレンジを取得"""
    try:
        result = get_recommendation_service(
            request.level, 
            request.preferences, 
            request.experiences
        )
        if result.get("status") == "success" and "data" in result:
            return result["data"]
        else:
            return result.get("data", {})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"レコメンド生成に失敗しました: {str(e)}")

@router.post("/feedback", response_model=StandardResponse)
async def send_feedback_endpoint(request: FeedbackRequest):
    """体験フィードバックを送信（学習機能付き）"""
    try:
        result = process_feedback_service(
            request.experience_id, 
            request.feedback,
            request.experiences
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"フィードバック処理に失敗しました: {str(e)}")

@router.post("/preferences/update", response_model=AnalysisResponse)
async def update_preferences_endpoint(request: PreferencesUpdateRequest):
    """ユーザー嗜好を更新（成長分析付き）"""
    try:
        result = update_preferences_service(request.experiences)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"嗜好更新に失敗しました: {str(e)}")

@router.get("/user/stats", response_model=UserStatsResponse)
async def get_user_stats(experiences: str = "[]"):
    """ユーザー統計情報を取得"""
    try:
        import json
        experiences_data = json.loads(experiences) if experiences != "[]" else []
        
        analysis = serendipity_engine._analyze_user_preferences(experiences_data)
        trends = analyze_growth_trends(experiences_data)
        
        # アチーブメント計算
        achievements = []
        if analysis['total_experiences'] >= 5:
            achievements.append("初心者探求者")
        if analysis['total_experiences'] >= 15:
            achievements.append("体験コレクター")
        if analysis['diversity_score'] >= 0.7:
            achievements.append("多様性マスター")
        if trends['diversity_change'] > 1:
            achievements.append("成長の軌跡")
        
        return UserStatsResponse(
            total_experiences=analysis['total_experiences'],
            diversity_score=analysis['diversity_score'],
            growth_trend=trends['trend'],
            recent_categories=analysis['preferred_categories'][:3],
            achievements=achievements
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"統計取得に失敗しました: {str(e)}")

@router.get("/challenges/levels")
async def get_challenge_levels():
    """チャレンジレベル情報を取得"""
    return {
        "levels": {
            1: {
                "name": "プチ・ディスカバリー",
                "emoji": "🌱",
                "description": "日常の小さな変化",
                "time_range": "5-30分"
            },
            2: {
                "name": "ウィークエンド・チャレンジ", 
                "emoji": "🚀",
                "description": "半日～1日の挑戦",
                "time_range": "1-3時間"
            },
            3: {
                "name": "アドベンチャー・クエスト",
                "emoji": "⭐",
                "description": "少し大きな体験",
                "time_range": "3-6時間"
            }
        }
    }

@router.get("/health")
async def health_check():
    """ヘルスチェック"""
    return {
        "status": "healthy", 
        "service": "Seren Paths API",
        "engine_version": "2.0",
        "features": ["personalization", "learning", "anti-optimization"]
    }