# backend/app/services.py
import random
import json
import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from collections import defaultdict, Counter

# 強化されたアンチ最適化レコメンドエンジン
class SerendipityEngine:
    def __init__(self):
        # レベル別チャレンジデータベース（structure.yamlに基づく）
        self.challenges_db = {
            1: [  # プチ・ディスカバリー
                {
                    "title": "いつもと違う道で帰る",
                    "category": "ライフスタイル",
                    "type": "lifestyle",
                    "icon": "MapPin",
                    "description": "新しい景色や発見があなたを待っています",
                    "estimated_time": "15-30分",
                    "serendipity_score": 0.7,
                    "discovery_potential": "日常の風景から新しい視点を得る"
                },
                {
                    "title": "普段聴かないジャンルの音楽を1曲聴く",
                    "category": "アート・創作",
                    "type": "music",
                    "icon": "Music",
                    "description": "心に響く新しいメロディーとの出会い",
                    "estimated_time": "5分",
                    "serendipity_score": 0.8,
                    "discovery_potential": "音楽の新しい世界を発見"
                },
                {
                    "title": "知らない飲み物を試してみる",
                    "category": "料理・グルメ",
                    "type": "food",
                    "icon": "Coffee",
                    "description": "味覚の新しい扉を開いてみませんか",
                    "estimated_time": "10分",
                    "serendipity_score": 0.6,
                    "discovery_potential": "新しい味の体験"
                },
                {
                    "title": "散歩中に見つけた気になるお店に入ってみる",
                    "category": "ソーシャル",
                    "type": "social",
                    "icon": "Sparkles",
                    "description": "偶然の出会いが待っています",
                    "estimated_time": "30分",
                    "serendipity_score": 0.8,
                    "discovery_potential": "新しい人や場所との出会い"
                }
            ],
            2: [  # ウィークエンド・チャレンジ
                {
                    "title": "隣町のカフェを開拓する",
                    "category": "ソーシャル",
                    "type": "social",
                    "icon": "Coffee",
                    "description": "新しい空間で過ごす時間を楽しんでみましょう",
                    "estimated_time": "1-2時間",
                    "serendipity_score": 0.8,
                    "discovery_potential": "新しい場所と雰囲気の発見"
                },
                {
                    "title": "オンライン体験レッスンに参加する",
                    "category": "学習・読書",
                    "type": "learning",
                    "icon": "BookOpen",
                    "description": "新しいスキルや知識との出会いを",
                    "estimated_time": "1-2時間",
                    "serendipity_score": 0.9,
                    "discovery_potential": "未知のスキル領域への挑戦"
                },
                {
                    "title": "地元の美術館や博物館を訪れる",
                    "category": "アート・創作",
                    "type": "art",
                    "icon": "Palette",
                    "description": "文化と歴史に触れる特別な時間",
                    "estimated_time": "2-3時間",
                    "serendipity_score": 0.8,
                    "discovery_potential": "芸術と文化の新しい視点"
                },
                {
                    "title": "知らないジャンルの本を図書館で借りる",
                    "category": "学習・読書", 
                    "type": "reading",
                    "icon": "Book",
                    "description": "新しい知識の世界への扉",
                    "estimated_time": "1時間",
                    "serendipity_score": 0.7,
                    "discovery_potential": "思考の新しい視点を獲得"
                }
            ],
            3: [  # アドベンチャー・クエスト
                {
                    "title": "日帰りで近郊の山にハイキング",
                    "category": "自然・アウトドア",
                    "type": "outdoor",
                    "icon": "Mountain",
                    "description": "自然の中で新しい自分を発見しましょう",
                    "estimated_time": "4-6時間",
                    "serendipity_score": 0.9,
                    "discovery_potential": "自然との繋がりと体力的挑戦"
                },
                {
                    "title": "プログラミングの入門書を1章読む",
                    "category": "学習・読書",
                    "type": "tech",
                    "icon": "Code",
                    "description": "デジタル世界の扉を開いてみませんか",
                    "estimated_time": "2-3時間",
                    "serendipity_score": 0.8,
                    "discovery_potential": "論理的思考と創造性の融合"
                },
                {
                    "title": "一人で映画館に行く",
                    "category": "エンタメ",
                    "type": "entertainment",
                    "icon": "Film",
                    "description": "自分だけの時間で映像作品を味わう",
                    "estimated_time": "3時間",
                    "serendipity_score": 0.7,
                    "discovery_potential": "一人時間の価値と映像芸術の深味"
                },
                {
                    "title": "新しい趣味のワークショップに参加する",
                    "category": "アート・創作",
                    "type": "creative",
                    "icon": "Sparkles",
                    "description": "創造性を刺激する新しい体験",
                    "estimated_time": "3-4時間",
                    "serendipity_score": 0.9,
                    "discovery_potential": "隠れた才能や興味の発見"
                }
            ]
        }
        
        # ユーザー学習データ（メモリ内）
        self.user_profiles = {}
        self.feedback_history = {}
        
    def get_personalized_recommendation(self, level: int, user_preferences: Dict, user_experiences: List[Dict] = None) -> Dict:
        """パーソナライズされたレコメンデーション（アンチ最適化）"""
        print(f"🔍 Debug: Level={level}, DB keys={list(self.challenges_db.keys())}")
        
        # レベルに対応するチャレンジを取得
        available_challenges = self.challenges_db.get(level, [])
        print(f"🔍 Debug: Available challenges count={len(available_challenges)}")
        
        if not available_challenges:
            print("⚠️ Debug: No challenges found for level, using fallback")
            return self._create_fallback_challenge(level)
        
        # ユーザー分析
        user_analysis = self._analyze_user_preferences(user_experiences or [])
        print(f"🔍 Debug: User analysis={user_analysis}")
        
        # 避けるべきカテゴリーのみフィルタリング（安全性のため）
        avoid_categories = user_preferences.get('avoidCategories', [])
        print(f"🔍 Debug: Avoid categories={avoid_categories}")
        
        # 安全性チェックのみ（避けるべきもの以外は全て候補）
        filtered_challenges = []
        for challenge in available_challenges:
            challenge_category = challenge.get('category', '')
            challenge_type = challenge.get('type', '')
            
            # 避けるべきカテゴリーのみ除外
            should_avoid = any(
                avoid_cat.lower() in challenge_category.lower() or 
                avoid_cat.lower() in challenge_type.lower() or
                avoid_cat.lower() == 'tech' and challenge_type in ['tech', 'technology']
                for avoid_cat in avoid_categories
            )
            
            if not should_avoid:
                filtered_challenges.append(challenge)
            else:
                print(f"🚫 Debug: Filtered out '{challenge['title']}' due to safety: {challenge_category}/{challenge_type}")
        
        print(f"🔍 Debug: Filtered challenges count={len(filtered_challenges)}")
        
        # フィルタが強すぎて何も残らない場合のみフォールバック
        if not filtered_challenges:
            print("⚠️ Debug: All challenges filtered out, using fallback")
            return self._create_fallback_challenge(level)
        
        # アンチ最適化スコアで評価（興味から離れたものほど高スコア）
        scored_challenges = []
        user_interests = user_preferences.get('interests', [])
        
        for challenge in filtered_challenges:
            # ベーススコア
            anti_opt_score = self._calculate_anti_optimization_score(challenge, user_experiences or [])
            
            # 🎯 アンチ最適化ボーナス：興味から離れているほど高得点
            if user_interests:
                interest_penalty = 0
                challenge_category = challenge.get('category', '').lower()
                challenge_type = challenge.get('type', '').lower()
                
                for interest in user_interests:
                    if (interest.lower() in challenge_category or 
                        interest.lower() in challenge_type or
                        (interest.lower() == 'art' and 'アート' in challenge_category)):
                        interest_penalty += 0.3  # 興味に合致するものは減点
                
                # 興味から離れているほど高得点
                anti_opt_score = max(anti_opt_score - interest_penalty, 0.1)
            
            scored_challenges.append((challenge, anti_opt_score))
            print(f"🔍 Debug: Challenge '{challenge['title']}' anti-opt scored {anti_opt_score}")
        
        if not scored_challenges:
            print("⚠️ Debug: No scored challenges, using fallback")
            return self._create_fallback_challenge(level)
        
        # 🎯 アンチ最適化：スコアの高い順（=興味から遠い順）でソート
        scored_challenges.sort(key=lambda x: x[1], reverse=True)
        
        # より予期しない体験のため、上位候補からランダム選択
        top_challenges = scored_challenges[:min(3, len(scored_challenges))]
        print(f"🔍 Debug: Top {len(top_challenges)} anti-optimized challenges selected")
        
        if top_challenges:
            selected_challenge, score = random.choice(top_challenges)
            print(f"✅ Debug: Selected ANTI-OPTIMIZED challenge '{selected_challenge['title']}' with score {score}")
            return self._enhance_challenge_with_context(selected_challenge, user_analysis, score)
        
        print("⚠️ Debug: No top challenges, using fallback")
        return self._create_fallback_challenge(level)
    
    def _calculate_anti_optimization_score(self, challenge: Dict, user_history: List[Dict]) -> float:
        """アンチ最適化スコアを計算（嗜好からの逸脱度）"""
        if not user_history:
            return challenge.get('serendipity_score', 0.7)  # 履歴がない場合はベーススコア
            
        # カテゴリーの多様性を分析
        past_categories = [exp.get('category', '') for exp in user_history]
        category_counts = Counter(past_categories)
        
        base_score = challenge.get('serendipity_score', 0.7)
        
        # 🎯 アンチ最適化：最頻カテゴリーから離れているほど高得点
        if category_counts:
            most_common_category = category_counts.most_common(1)[0][0]
            if challenge['category'] != most_common_category:
                # 新しいカテゴリーは高得点
                return min(base_score + 0.3, 1.0)
            else:
                # 同じカテゴリーは低得点
                return max(base_score - 0.2, 0.1)
        
        return base_score
    
    def _analyze_user_preferences(self, experiences: List[Dict]) -> Dict:
        """ユーザーの嗜好パターンを分析"""
        if not experiences:
            return {"diversity_score": 0.0, "preferred_categories": [], "challenge_comfort": 0.5}
        
        categories = [exp.get('category', '') for exp in experiences if exp.get('category')]
        types = [exp.get('type', '') for exp in experiences if exp.get('type')]
        
        # 多様性スコア計算
        unique_categories = len(set(categories))
        diversity_score = min(unique_categories / 8.0, 1.0)  # 8カテゴリーで正規化
        
        # 好みカテゴリー分析
        category_counts = Counter(categories)
        preferred_categories = [cat for cat, count in category_counts.most_common(3)]
        
        # 挑戦快適度（高レベル体験の割合）
        high_level_experiences = [exp for exp in experiences if exp.get('level', 1) >= 2]
        challenge_comfort = len(high_level_experiences) / len(experiences) if experiences else 0.5
        
        return {
            "diversity_score": diversity_score,
            "preferred_categories": preferred_categories,
            "challenge_comfort": challenge_comfort,
            "total_experiences": len(experiences)
        }
    
    def _enhance_challenge_with_context(self, challenge: Dict, user_analysis: Dict, anti_opt_score: float) -> Dict:
        """チャレンジにコンテキストと励ましメッセージを追加"""
        enhanced = challenge.copy()
        
        # レベルを追加（もし存在しない場合）
        if 'level' not in enhanced:
            # チャレンジがどのレベルに属するかを逆引き
            for level, challenges in self.challenges_db.items():
                if challenge in challenges:
                    enhanced['level'] = level
                    break
            else:
                enhanced['level'] = 2  # デフォルト
        
        # user_analysisの安全な取得
        total_experiences = user_analysis.get('total_experiences', 0)
        diversity_score = user_analysis.get('diversity_score', 0.0)
        
        # 🎯 アンチ最適化に特化したメッセージ
        if total_experiences == 0:
            encouragement = "新しい冒険の始まりです！予期せぬ発見があなたを待っています。"
        elif anti_opt_score > 0.8:
            encouragement = "これは普段のあなたとは全く違う体験です。新しい自分との出会いを楽しんでください！"
        elif diversity_score < 0.3:
            encouragement = "未知の領域への第一歩！快適圏から一歩外に出てみましょう。"
        else:
            encouragement = "意外性のある体験が、新しい視点をもたらしてくれるでしょう。"
        
        enhanced.update({
            "encouragement": encouragement,
            "anti_optimization_score": round(anti_opt_score, 2),
            "personalization_reason": self._generate_anti_optimization_reason(challenge, user_analysis),
            "generated_at": datetime.now().isoformat()
        })
        
        print(f"🔧 Debug: Enhanced ANTI-OPTIMIZED challenge: {enhanced.get('title', 'Unknown')}")
        return enhanced
    
    def _generate_anti_optimization_reason(self, challenge: Dict, user_analysis: Dict) -> str:
        """アンチ最適化の理由を生成"""
        total_experiences = user_analysis.get('total_experiences', 0)
        preferred_categories = user_analysis.get('preferred_categories', [])
        
        if total_experiences == 0:
            return "新しい世界への第一歩として選ばれました"
        
        if challenge['category'] not in preferred_categories:
            return f"普段選ばない{challenge['category']}分野で、新しい発見があるかもしれません"
        
        return f"馴染みのある{challenge['category']}でも、違った角度からアプローチしてみましょう"
    
    def _create_fallback_challenge(self, level: int) -> Dict:
        """フォールバック用のチャレンジ"""
        fallback_challenges = {
            1: {
                "title": "今日一日、意識的に新しいことを一つ試してみる",
                "category": "ライフスタイル",
                "type": "lifestyle",
                "icon": "Sparkles",
                "description": "小さな変化が大きな発見につながります",
                "estimated_time": "任意",
                "encouragement": "どんな小さなことでも構いません。新しい自分を発見しましょう。"
            },
            2: {
                "title": "今週末、普段しない活動を1つ計画してみる",
                "category": "ライフスタイル", 
                "type": "lifestyle",
                "icon": "Calendar",
                "description": "週末の新しい過ごし方を発見しませんか",
                "estimated_time": "1-2時間",
                "encouragement": "新しい体験が、新しい視点をもたらしてくれます。"
            },
            3: {
                "title": "今まで避けていた分野に一歩踏み出してみる",
                "category": "ライフスタイル",
                "type": "lifestyle", 
                "icon": "Target",
                "description": "大きな成長は快適圏の外にあります",
                "estimated_time": "3-4時間",
                "encouragement": "勇気を出した分だけ、新しい世界が広がります。"
            }
        }
        
        challenge = fallback_challenges.get(level, fallback_challenges[2])
        challenge.update({
            "level": level,
            "generated_at": datetime.now().isoformat(),
            "serendipity_score": 0.5
        })
        
        print(f"🔧 Debug: Generated fallback challenge for level {level}: {challenge['title']}")
        return challenge

# 学習機能を強化したフィードバック処理
class UserLearningEngine:
    def __init__(self):
        self.feedback_weights = {
            'completed': 1.0,
            'enjoyed': 0.8,
            'not_interested': -0.5,
            'too_difficult': -0.3,
            'too_easy': -0.2,
            '合わなかった': -0.4
        }
    
    def process_feedback(self, experience_id: str, feedback: str, user_experiences: List[Dict] = None) -> Dict:
        """フィードバックを処理して学習データを更新"""
        timestamp = datetime.now().isoformat()
        
        # フィードバックの分析
        sentiment_score = self.feedback_weights.get(feedback, 0.0)
        
        # 体験の特徴を抽出
        if user_experiences:
            experience = next((exp for exp in user_experiences if str(exp.get('id')) == str(experience_id)), None)
            if experience:
                category_preference = self._update_category_preference(experience['category'], sentiment_score)
                difficulty_preference = self._update_difficulty_preference(experience.get('level', 2), sentiment_score)
                
                return {
                    "status": "success",
                    "message": "フィードバックを学習に反映しました",
                    "learning_updates": {
                        "category_adjustment": category_preference,
                        "difficulty_adjustment": difficulty_preference,
                        "sentiment_score": sentiment_score
                    },
                    "timestamp": timestamp
                }
        
        return {
            "status": "success", 
            "message": "フィードバックを記録しました",
            "timestamp": timestamp
        }
    
    def _update_category_preference(self, category: str, sentiment: float) -> Dict:
        """カテゴリー嗜好を更新"""
        return {
            "category": category,
            "preference_change": sentiment * 0.1,  # 徐々に学習
            "recommendation": "今後の提案に反映されます"
        }
    
    def _update_difficulty_preference(self, level: int, sentiment: float) -> Dict:
        """難易度嗜好を更新"""
        return {
            "preferred_level": level,
            "confidence_change": sentiment * 0.05,
            "recommendation": f"レベル{level}の体験の提案頻度を調整します"
        }

# サービス関数を更新
serendipity_engine = SerendipityEngine()
learning_engine = UserLearningEngine()

def get_recommendation_service(level: int, preferences: Dict, experiences: List[Dict] = None) -> Dict:
    """強化されたレコメンドサービス"""
    try:
        print(f"🚀 Service called with level={level}, preferences={preferences}")
        
        # SerendipityEngineを使用してパーソナライズされた推奨を取得
        recommendation = serendipity_engine.get_personalized_recommendation(
            level, preferences, experiences
        )
        
        print(f"✅ Recommendation generated: {recommendation.get('title', 'Unknown')}")
        
        return {
            "status": "success",
            "data": recommendation,
            "personalization_applied": True,
            "engine_version": "2.0"
        }
    except Exception as e:
        print(f"❌ Error in recommendation service: {str(e)}")
        return {
            "status": "error",
            "message": f"レコメンド生成に失敗しました: {str(e)}",
            "data": serendipity_engine._create_fallback_challenge(level)
        }

def process_feedback_service(experience_id: str, feedback: str, user_experiences: List[Dict] = None) -> Dict:
    """強化されたフィードバック処理サービス"""
    try:
        result = learning_engine.process_feedback(experience_id, feedback, user_experiences)
        return result
    except Exception as e:
        return {
            "status": "error",
            "message": f"フィードバック処理に失敗しました: {str(e)}"
        }

def update_preferences_service(experiences: List[Dict]) -> Dict:
    """ユーザー嗜好更新サービス（分析機能強化）"""
    try:
        analysis = serendipity_engine._analyze_user_preferences(experiences)
        
        # 成長トレンドの分析
        recent_experiences = experiences[-10:] if len(experiences) > 10 else experiences
        growth_metrics = analyze_growth_trends(recent_experiences)
        
        return {
            "status": "success",
            "message": "嗜好データを更新しました",
            "analysis": analysis,
            "growth_trends": growth_metrics,
            "recommendations": generate_growth_recommendations(analysis, growth_metrics),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"嗜好更新に失敗しました: {str(e)}"
        }

def analyze_growth_trends(experiences: List[Dict]) -> Dict:
    """成長トレンドを分析"""
    if not experiences:
        return {"trend": "初期段階", "diversity_change": 0.0}
    
    # 時系列での多様性変化を分析
    categories_over_time = []
    for i, exp in enumerate(experiences):
        unique_cats = len(set([e.get('category', '') for e in experiences[:i+1]]))
        categories_over_time.append(unique_cats)
    
    # トレンド計算（直近5つと最初5つの比較）
    if len(categories_over_time) >= 10:
        recent_diversity = sum(categories_over_time[-5:]) / 5
        early_diversity = sum(categories_over_time[:5]) / 5
        diversity_change = recent_diversity - early_diversity
    else:
        diversity_change = categories_over_time[-1] - categories_over_time[0] if len(categories_over_time) > 1 else 0
    
    trend = "成長中" if diversity_change > 0 else "安定" if diversity_change == 0 else "集中中"
    
    return {
        "trend": trend,
        "diversity_change": round(diversity_change, 2),
        "total_categories_explored": len(set([exp.get('category', '') for exp in experiences])),
        "experience_count": len(experiences)
    }

def generate_growth_recommendations(analysis: Dict, trends: Dict) -> List[str]:
    """成長に基づく推奨事項を生成"""
    recommendations = []
    
    if analysis['diversity_score'] < 0.3:
        recommendations.append("新しいカテゴリーの体験に挑戦してみましょう")
    
    if trends['diversity_change'] < 0:
        recommendations.append("最近同じタイプの体験が多いようです。違う分野も試してみませんか？")
    
    if analysis['challenge_comfort'] < 0.3:
        recommendations.append("より挑戦的なレベルの体験も検討してみてください")
    
    if not recommendations:
        recommendations.append("素晴らしい多様性を保っています！この調子で続けましょう")
    
    return recommendations