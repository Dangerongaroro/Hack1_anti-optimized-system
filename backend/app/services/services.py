# backend/app/services.py
import random
import json
import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from collections import defaultdict, Counter

# Option 1の場合
try:
    from app.services.ai_service import AIRecommendationService
except ImportError:
    # Option 2の場合
    from app.ai_service import AIRecommendationService

from app.data.challenges import CHALLENGES_DATA, CATEGORY_METADATA, LEVEL_METADATA

# 強化されたアンチ最適化レコメンドエンジン
class SerendipityEngine:
    def __init__(self):
        """初期化時にデータを読み込み"""
        self.challenges_db = CHALLENGES_DATA
        self.category_metadata = CATEGORY_METADATA
        self.level_metadata = LEVEL_METADATA
        
        # 動的データ（ユーザー履歴等）
        self.user_experiences = defaultdict(list)
        self.user_feedback = defaultdict(list)
        
        print(f"✅ SerendipityEngine initialized with {sum(len(challenges) for challenges in self.challenges_db.values())} challenges")
    
    def get_challenge_by_level(self, level: int) -> List[Dict]:
        """レベル別チャレンジを取得"""
        return self.challenges_db.get(level, [])
    
    def get_category_info(self, category: str) -> Dict:
        """カテゴリー情報を取得"""
        return self.category_metadata.get(category, {
            "color": "#6B7280",
            "description": "新しい体験"
        })
    
    def get_level_info(self, level: int) -> Dict:
        """レベル情報を取得"""
        return self.level_metadata.get(level, {
            "name": f"レベル{level}",
            "emoji": "⚡",
            "description": "新しい挑戦",
            "time_range": "時間未定",
            "difficulty": "unknown"
        })
    
    def get_personalized_recommendation(self, level: int, preferences: Dict, experiences: List[Dict] = None) -> Dict:
        """パーソナライズされたレコメンデーション"""
        available_challenges = self.get_challenge_by_level(level)
        
        if not available_challenges:
            return self._create_fallback_challenge(level)
        
        # ユーザー分析
        user_analysis = self._analyze_user_preferences(experiences or [])
        
        # アンチ最適化スコアの計算
        scored_challenges = []
        for challenge in available_challenges:
            score = self._calculate_anti_optimization_score(challenge, user_analysis, preferences)
            scored_challenges.append((challenge, score))
        
        # ランダム性を保ちつつ、スコアの高いものを優先
        challenge = self._weighted_random_selection(scored_challenges)
        
        # チャレンジを強化
        enhanced_challenge = self._enhance_challenge(challenge, user_analysis)
        
        return enhanced_challenge
    
    def _analyze_user_preferences(self, experiences: List[Dict]) -> Dict:
        """ユーザーの体験履歴を分析"""
        if not experiences:
            return {
                "total_experiences": 0,
                "favorite_categories": [],
                "avoided_categories": [],
                "diversity_score": 0.5,
                "recent_trend": "balanced"
            }
        
        # カテゴリー分析
        category_counts = Counter(exp.get('category', 'その他') for exp in experiences)
        
        # 多様性スコア計算
        total_categories = len(self.category_metadata)
        experienced_categories = len(category_counts)
        diversity_score = min(experienced_categories / total_categories, 1.0)
        
        # 最近のトレンド分析
        recent_experiences = experiences[-5:] if len(experiences) >= 5 else experiences
        recent_categories = [exp.get('category', '') for exp in recent_experiences]
        
        return {
            "total_experiences": len(experiences),
            "favorite_categories": [cat for cat, count in category_counts.most_common(3)],
            "avoided_categories": self._find_avoided_categories(category_counts),
            "diversity_score": diversity_score,
            "recent_categories": recent_categories,
            "category_distribution": dict(category_counts)
        }
    
    def _find_avoided_categories(self, category_counts: Counter) -> List[str]:
        """避けられがちなカテゴリーを特定"""
        all_categories = set(self.category_metadata.keys())
        experienced_categories = set(category_counts.keys())
        return list(all_categories - experienced_categories)
    
    def _calculate_anti_optimization_score(self, challenge: Dict, user_analysis: Dict, preferences: Dict) -> float:
        """アンチ最適化スコアを計算"""
        score = challenge.get('serendipity_score', 0.5)
        
        # 新しいカテゴリーへのボーナス
        category = challenge.get('category', '')
        if category in user_analysis.get('avoided_categories', []):
            score += 0.3
        elif category not in user_analysis.get('favorite_categories', []):
            score += 0.1
        
        # 多様性ボーナス
        if user_analysis.get('diversity_score', 0) < 0.7:
            score += 0.2
        
        # 最近の体験との重複ペナルティ
        recent_categories = user_analysis.get('recent_categories', [])
        if category in recent_categories:
            score -= 0.2
        
        # ユーザー設定による調整
        avoid_categories = preferences.get('avoidCategories', [])
        if category in avoid_categories:
            score -= 0.4
        
        return max(0.0, min(1.0, score))
    
    def _weighted_random_selection(self, scored_challenges: List[tuple]) -> Dict:
        """重み付きランダム選択"""
        if not scored_challenges:
            return self._create_fallback_challenge(1)
        
        # スコアに基づく重み計算
        total_weight = sum(score for _, score in scored_challenges)
        if total_weight == 0:
            return random.choice([challenge for challenge, _ in scored_challenges])
        
        # 重み付きランダム選択
        rand = random.uniform(0, total_weight)
        cumulative = 0
        
        for challenge, score in scored_challenges:
            cumulative += score
            if rand <= cumulative:
                return challenge
        
        # フォールバック
        return scored_challenges[0][0]
    
    def _enhance_challenge(self, challenge: Dict, user_analysis: Dict) -> Dict:
        """チャレンジを強化"""
        enhanced = challenge.copy()
        
        # レベル情報を追加
        level = enhanced.get('level', 1)
        level_info = self.get_level_info(level)
        enhanced.update({
            "level_name": level_info['name'],
            "level_emoji": level_info['emoji'],
            "difficulty": level_info['difficulty']
        })
        
        # カテゴリー情報を追加
        category = enhanced.get('category', '')
        category_info = self.get_category_info(category)
        enhanced.update({
            "category_color": category_info['color'],
            "category_description": category_info['description']
        })
        
        # パーソナライゼーション情報
        enhanced.update({
            "anti_optimization_score": self._calculate_anti_optimization_score(
                challenge, user_analysis, {}
            ),
            "personalization_reason": self._generate_personalization_reason(
                challenge, user_analysis
            ),
            "generated_at": datetime.now().isoformat()
        })
        
        return enhanced
    
    def _generate_personalization_reason(self, challenge: Dict, user_analysis: Dict) -> str:
        """パーソナライゼーションの理由を生成"""
        category = challenge.get('category', '')
        total_exp = user_analysis.get('total_experiences', 0)
        
        if category in user_analysis.get('avoided_categories', []):
            return f"まだ体験していない「{category}」分野への新しい挑戦です"
        elif total_exp < 3:
            return "初心者向けの優しい体験から始めましょう"
        elif user_analysis.get('diversity_score', 0) < 0.5:
            return "経験の幅を広げる新しい分野への挑戦です"
        else:
            return "あなたの冒険心を刺激する特別な体験です"
    
    def _create_fallback_challenge(self, level: int) -> Dict:
        """フォールバック用のチャレンジ"""
        level_info = self.get_level_info(level)
        
        return {
            "title": f"今日の特別な発見 ({level_info['name']})",
            "category": "ライフスタイル",
            "type": "general",
            "icon": "Sparkles",
            "description": "新しい一日を特別にする小さな冒険を見つけてみましょう",
            "estimated_time": level_info['time_range'],
            "serendipity_score": 0.8,
            "discovery_potential": "予期しない発見",
            "level": level,
            "fallback": True,
            "generated_at": datetime.now().isoformat()
        }

# 他のクラスも継続...
class UserLearningEngine:
    def __init__(self):
        self.feedback_history = defaultdict(list)
        
    def process_feedback(self, challenge_id: str, feedback_type: str, user_id: str = "default") -> Dict:
        """フィードバック処理"""
        feedback_entry = {
            "challenge_id": challenge_id,
            "feedback_type": feedback_type,
            "timestamp": datetime.now().isoformat(),
            "processed": True
        }
        
        self.feedback_history[user_id].append(feedback_entry)
        
        return {
            "status": "success",
            "message": "フィードバックを記録しました",
            "learning_applied": True
        }

# サービスインスタンス
serendipity_engine = SerendipityEngine()
learning_engine = UserLearningEngine()
ai_service = AIRecommendationService()

# サービス関数
def get_recommendation_service(level: int, preferences: Dict, experiences: List[Dict] = None) -> Dict:
    """AI強化されたレコメンドサービス"""
    try:
        print(f"🚀 Service called with level={level}, preferences={preferences}")
        print(f"   Experiences: {len(experiences) if experiences else 0} items")
        
        # データ検証
        if not isinstance(level, int) or level < 1 or level > 3:
            raise ValueError(f"Invalid level: {level}")
        
        # 基本レコメンデーションを取得
        recommendation = serendipity_engine.get_personalized_recommendation(
            level, preferences, experiences or []
        )
        
        print(f"📋 Base recommendation: {recommendation.get('title', 'Unknown')}")
        
        # AIで強化
        user_analysis = serendipity_engine._analyze_user_preferences(experiences or [])
        enhanced_recommendation = ai_service.enhance_challenge_with_ai(
            recommendation, user_analysis, experiences or []
        )
        
        # AI生成のカスタムチャレンジも試行
        if len(experiences or []) > 5:  # 十分な履歴がある場合のみ
            custom_challenge = ai_service.suggest_custom_challenge(preferences, experiences, level)
            if custom_challenge and random.random() < 0.3:  # 30%の確率でカスタムチャレンジ
                enhanced_recommendation = custom_challenge
                print("🤖 Using AI-generated custom challenge")
        
        print(f"✅ AI-Enhanced recommendation generated: {enhanced_recommendation.get('title', 'Unknown')}")
        
        return {
            "status": "success",
            "data": enhanced_recommendation,
            "personalization_applied": True,
            "ai_enhanced": enhanced_recommendation.get('ai_enhanced', False),
            "engine_version": "2.1-AI"
        }
    except Exception as e:
        print(f"❌ Error in AI recommendation service: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # フォールバック処理
        try:
            fallback = serendipity_engine.get_personalized_recommendation(level, {}, [])
            return {
                "status": "fallback",
                "data": fallback,
                "error": str(e),
                "engine_version": "2.1-Fallback"
            }
        except Exception as fallback_error:
            print(f"❌ Fallback also failed: {str(fallback_error)}")
            return {
                "status": "error",
                "data": {},
                "error": f"Service error: {str(e)}, Fallback error: {str(fallback_error)}"
            }
        return {
            "status": "error",
            "message": f"レコメンド生成に失敗しました: {str(e)}",
            "data": serendipity_engine._create_fallback_challenge(level)
        }

def process_feedback_service(challenge_id: str, feedback_type: str, rating: int = None) -> Dict:
    """フィードバック処理サービス"""
    return learning_engine.process_feedback(challenge_id, feedback_type)

def update_preferences_service(preferences: Dict) -> Dict:
    """設定更新サービス"""
    return {
        "status": "success",
        "message": "設定を更新しました",
        "updated_preferences": preferences
    }

def analyze_growth_trends(experiences: List[Dict]) -> Dict:
    """成長トレンド分析"""
    if not experiences:
        return {"status": "no_data", "message": "分析するデータがありません"}
    
    user_analysis = serendipity_engine._analyze_user_preferences(experiences)
    
    return {
        "status": "success",
        "total_experiences": user_analysis['total_experiences'],
        "diversity_score": user_analysis['diversity_score'],
        "growth_trend": "expanding" if user_analysis['diversity_score'] > 0.6 else "developing",
        "recommendations": "新しい分野への挑戦を続けましょう"
    }