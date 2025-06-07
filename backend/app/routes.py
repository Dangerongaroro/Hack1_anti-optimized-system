# backend/app/routes.py
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from typing import List, Dict, Any  # Listを追加
from datetime import datetime, timedelta  

from .services import (
    get_recommendation_service, 
    process_feedback_service, 
    update_preferences_service,
    analyze_growth_trends,
    serendipity_engine
)
from .services.visualization_service import VisualizationService
# 既存のインポートに追加
from .schemas import (
    RecommendationRequest, 
    FeedbackRequest, 
    PreferencesUpdateRequest,
    ChallengeResponse,
    StandardResponse,
    AnalysisResponse,
    UserStatsResponse,
    ThemeChallengeResponse,
    GrowthAnalysisResponse
)

router = APIRouter()

# VisualizationServiceのインスタンス化
visualization_service = VisualizationService()

# CORS プリフライトリクエスト対応
@router.options("/{path:path}")
async def options_handler(request: Request, path: str):
    """すべてのパスでOPTIONSリクエストを処理"""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    )

# 新しいエンドポイントを追加
@router.get("/themes/active", response_model=List[ThemeChallengeResponse])
async def get_active_themes():
    """アクティブなテーマチャレンジを取得"""
    try:
        # 実際にはDBから取得
        themes = [
            {
                "id": "local-first",
                "title": "地元再発見ウィーク",
                "description": "普段通り過ぎる地元の魅力を再発見しよう",
                "duration": "7日間",
                "participants": 234,
                "difficulty": 2,
                "rewards": ["地元探検家バッジ", "多様性スコア+10"],
                "challenges": [
                    "地元の歴史スポットを訪れる",
                    "地元の老舗で食事",
                    "地元の図書館で郷土資料を読む"
                ],
                "start_date": datetime.now().isoformat(),
                "end_date": (datetime.now() + timedelta(days=7)).isoformat()
            }
        ]
        return themes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"テーマ取得に失敗しました: {str(e)}")

@router.post("/growth/analysis", response_model=GrowthAnalysisResponse)
async def analyze_growth(experiences: List[Dict[str, Any]]):
    """成長分析を実行"""
    try:
        analysis = analyze_growth_trends(experiences)
        
        # AIによる深い分析も追加
        ai_insights = await serendipity_engine.ai_service.analyze_growth_pattern(experiences)
        
        return GrowthAnalysisResponse(
            status="success",
            growth_stage=analysis['growth_stage'],
            insights=ai_insights.get('insights', []),
            next_challenges=ai_insights.get('next_challenges', []),
            diversity_score=analysis['diversity_score'],
            category_distribution=analysis['category_distribution']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"成長分析に失敗しました: {str(e)}")

@router.post("/journal/templates")
async def get_journal_templates(user_context: Dict[str, Any]):
    """パーソナライズされたジャーナルテンプレートを取得"""
    try:
        templates = [
            {
                "id": "discovery",
                "title": "今日の小さな発見",
                "prompts": ["何を発見しましたか？", "どんな気持ちになりましたか？"],
                "tags": ["発見", "気づき", "新鮮"]
            },
            {
                "id": "challenge",
                "title": "挑戦したこと",
                "prompts": ["どんな挑戦でしたか？", "結果はどうでしたか？"],
                "tags": ["挑戦", "成長", "勇気"]
            },
            {
                "id": "emotion",
                "title": "心が動いた瞬間",
                "prompts": ["何に心を動かされましたか？", "なぜそう感じたと思いますか？"],
                "tags": ["感動", "気持ち", "内省"]
            }
        ]
        
        # AIでパーソナライズ
        if user_context.get('recent_experiences'):
            personalized = await serendipity_engine.ai_service.suggest_journal_prompts(
                user_context['recent_experiences']
            )
            if personalized:
                templates.extend(personalized)
        
        return {"templates": templates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"テンプレート取得に失敗しました: {str(e)}")

@router.post("/recommendations", response_model=ChallengeResponse)
async def get_recommendation_endpoint(request: RecommendationRequest):
    """パーソナライズされたチャレンジを取得"""
    try:
        print(f"🔄 Recommendation request received:")
        print(f"   Level: {request.level}")
        print(f"   Preferences: {request.preferences}")
        print(f"   Experiences count: {len(request.experiences) if request.experiences else 0}")
        
        result = get_recommendation_service(
            request.level, 
            request.preferences, 
            request.experiences
        )
        
        print(f"📤 Service result: {result}")
        
        if result.get("status") == "success" and "data" in result:
            return result["data"]
        else:
            return result.get("data", {})
    except Exception as e:
        print(f"❌ Recommendation endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"レコメンド生成に失敗しました: {str(e)}")

@router.post("/recommendations/ai", response_model=ChallengeResponse)
async def get_ai_recommendation_endpoint(request: RecommendationRequest):
    """AI専用レコメンデーション（詳細プロンプト使用）"""
    try:
        print(f"🤖 AI Recommendation request received:")
        print(f"   Level: {request.level}")
        print(f"   Experiences count: {len(request.experiences) if request.experiences else 0}")
        
        # AIサービスから直接取得
        from .services.services import ai_service
        
        if not ai_service.enabled:
            raise HTTPException(status_code=503, detail="AI service is not available")
        
        ai_recommendation = ai_service.generate_ai_recommendation(
            request.preferences, 
            request.experiences or [], 
            request.level
        )
        
        if ai_recommendation:
            print(f"✅ AI recommendation generated: {ai_recommendation.get('title', 'Unknown')}")
            return ai_recommendation
        else:
            raise HTTPException(status_code=500, detail="AI recommendation generation failed")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ AI Recommendation endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI レコメンド生成に失敗しました: {str(e)}")

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

@router.post("/visualization/experience-strings")
async def get_experience_strings_visualization(experiences: List[Dict[str, Any]]):
    """ExperienceStringsの3Dビジュアライゼーションデータを取得"""
    try:
        print(f"📊 ビジュアライゼーションリクエスト受信: {len(experiences)}件の体験データ")
        visualization_data = visualization_service.generate_visualization_data(experiences)
        print("✅ ビジュアライゼーションデータ生成成功")
        return {
            "status": "success",
            "data": visualization_data
        }
    except Exception as e:
        print(f"❌ ビジュアライゼーション生成エラー: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"ビジュアライゼーション生成エラー: {str(e)}")

@router.post("/visualization/spiral-positions")
async def get_spiral_positions(experiences: List[Dict[str, Any]]):
    """完了済み体験のらせん配置データを取得"""
    try:
        spiral_positions = visualization_service.compute_spiral_positions(experiences)
        return {
            "status": "success",
            "data": spiral_positions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"らせん位置計算エラー: {str(e)}")

@router.post("/visualization/floating-positions") 
async def get_floating_positions(experiences: List[Dict[str, Any]]):
    """進行中ミッションの浮遊配置データを取得"""
    try:
        floating_positions = visualization_service.compute_floating_positions(experiences)
        return {
            "status": "success",
            "data": floating_positions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"浮遊位置計算エラー: {str(e)}")

@router.post("/visualization/connection-curves")
async def get_connection_curves(spiral_positions: List[Dict[str, Any]]):
    """球体間の接続曲線データを取得"""
    try:
        connection_curves = visualization_service.compute_connection_curves(spiral_positions)
        return {
            "status": "success",
            "data": connection_curves
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"接続曲線計算エラー: {str(e)}")