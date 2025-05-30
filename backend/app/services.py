# backend/app/services.py
import random
import json
from datetime import datetime
from typing import Dict, List, Any

# アンチ最適化レコメンドエンジン
class SerendipityEngine:
    def __init__(self):
        self.challenge_database = {
            1: [  # プチ・ディスカバリー
                {
                    "title": "いつもと違う道で帰宅する",
                    "category": "ライフスタイル",
                    "type": "lifestyle",
                    "icon": "MapPin",
                    "description": "普段歩かない道を通って新しい発見をしてみましょう",
                    "estimated_time": "10-15分"
                },
                {
                    "title": "普段聴かないジャンルの音楽を3曲聴く",
                    "category": "音楽・エンタメ",
                    "type": "music",
                    "icon": "Music",
                    "description": "新しい音楽ジャンルで感性を刺激してみましょう",
                    "estimated_time": "10-15分"
                },
                {
                    "title": "コンビニで見たことない商品を1つ買ってみる",
                    "category": "料理・グルメ",
                    "type": "food",
                    "icon": "ShoppingCart",
                    "description": "小さな冒険で新しい味との出会いを",
                    "estimated_time": "5-10分"
                },
                {
                    "title": "5分間だけ利き手と逆の手を使って生活する",
                    "category": "ライフスタイル",
                    "type": "challenge",
                    "icon": "Hand",
                    "description": "脳に新しい刺激を与えてみましょう",
                    "estimated_time": "5分"
                }
            ],
            2: [  # ウィークエンド・チャレンジ
                {
                    "title": "隣町のカフェを開拓する",
                    "category": "ソーシャル",
                    "type": "social",
                    "icon": "Coffee",
                    "description": "新しい空間で過ごす時間を楽しんでみましょう",
                    "estimated_time": "1-2時間"
                },
                {
                    "title": "オンライン体験レッスンに参加する",
                    "category": "学習・読書",
                    "type": "study",
                    "icon": "BookOpen",
                    "description": "新しいスキルや知識との出会いを",
                    "estimated_time": "1-2時間"
                },
                {
                    "title": "地元の美術館・博物館を訪れる",
                    "category": "アート・創作",
                    "type": "art",
                    "icon": "Palette",
                    "description": "芸術や文化で感性を豊かにしましょう",
                    "estimated_time": "2-3時間"
                },
                {
                    "title": "新しいレシピで料理に挑戦",
                    "category": "料理・グルメ",
                    "type": "food",
                    "icon": "ChefHat",
                    "description": "クリエイティブな料理体験を楽しみましょう",
                    "estimated_time": "1-2時間"
                }
            ],
            3: [  # アドベンチャー・クエスト
                {
                    "title": "日帰りで近郊の山にハイキング",
                    "category": "自然・アウトドア",
                    "type": "nature",
                    "icon": "Mountain",
                    "description": "自然の中で心身をリフレッシュしましょう",
                    "estimated_time": "半日"
                },
                {
                    "title": "プログラミングの入門書を1章読んで実践",
                    "category": "学習・読書",
                    "type": "study",
                    "icon": "Code",
                    "description": "デジタル時代の新しいスキルに挑戦",
                    "estimated_time": "3-4時間"
                },
                {
                    "title": "地域のボランティア活動に参加",
                    "category": "ソーシャル",
                    "type": "social",
                    "icon": "Heart",
                    "description": "社会貢献を通じて新しい価値観を発見",
                    "estimated_time": "半日"
                },
                {
                    "title": "一人で映画館に行く",
                    "category": "音楽・エンタメ",
                    "type": "entertainment",
                    "icon": "Film",
                    "description": "一人時間を楽しむ新しい体験",
                    "estimated_time": "2-3時間"
                }
            ]
        }

    def generate_recommendation(self, level: int, user_preferences: Dict) -> Dict:
        """アンチ最適化ロジックでレコメンドを生成"""
        available_challenges = self.challenge_database.get(level, self.challenge_database[2])
        
        # ユーザーの避けたいカテゴリーを除外
        avoid_categories = user_preferences.get('avoidCategories', [])
        filtered_challenges = [
            challenge for challenge in available_challenges
            if not self._should_avoid_challenge(challenge, avoid_categories)
        ]
        
        if not filtered_challenges:
            filtered_challenges = available_challenges  # フォールバック
        
        # アンチ最適化：ユーザーの興味から意図的に外れた提案も含める
        selected_challenge = self._apply_anti_optimization(filtered_challenges, user_preferences)
        
        # IDと追加情報を付与
        selected_challenge['id'] = f"challenge_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}"
        selected_challenge['level'] = level
        selected_challenge['generated_at'] = datetime.now().isoformat()
        
        return selected_challenge

    def _should_avoid_challenge(self, challenge: Dict, avoid_categories: List) -> bool:
        """チャレンジを避けるべきかどうかを判定"""
        challenge_type = challenge.get('type', '')
        challenge_category = challenge.get('category', '')
        
        # 避けたいカテゴリーとマッチングする簡単なロジック
        avoid_mapping = {
            'expensive': ['premium', 'costly'],
            'physical': ['sport', 'nature', 'outdoor'],
            'crowded': ['social', 'event'],
            'time': []  # 時間については estimated_time で判定可能
        }
        
        for avoid_item in avoid_categories:
            if avoid_item in avoid_mapping:
                if any(keyword in challenge_type.lower() or keyword in challenge_category.lower() 
                       for keyword in avoid_mapping[avoid_item]):
                    return True
        
        return False

    def _apply_anti_optimization(self, challenges: List[Dict], user_preferences: Dict) -> Dict:
        """アンチ最適化ロジックを適用"""
        user_interests = user_preferences.get('interests', [])
        
        if not user_interests:
            return random.choice(challenges)
        
        # 70%の確率でユーザーの興味外のチャレンジを選択（アンチ最適化）
        if random.random() < 0.7:
            # 興味外のチャレンジを優先
            outside_interests = [
                challenge for challenge in challenges
                if not any(interest in challenge.get('category', '').lower() or 
                          interest in challenge.get('type', '').lower()
                          for interest in user_interests)
            ]
            if outside_interests:
                return random.choice(outside_interests)
        
        # 30%の確率で興味内のチャレンジも提案
        return random.choice(challenges)


# サービス関数を更新
serendipity_engine = SerendipityEngine()

def get_recommendation_service(level: int, preferences: Dict) -> Dict:
    """改良されたレコメンドサービス"""
    try:
        recommendation = serendipity_engine.generate_recommendation(level, preferences)
        return {
            "status": "success",
            "data": recommendation
        }
    except Exception as e:
        print(f"Error generating recommendation: {e}")
        # フォールバック
        return {
            "title": "新しいことに挑戦してみましょう",
            "category": "その他",
            "type": "general",
            "icon": "Sparkles",
            "level": level,
            "id": f"fallback_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "description": "今日は何か新しいことを始める良い日です"
        }

def process_feedback_service(experience_id: str, feedback: str) -> Dict:
    """フィードバック処理サービス"""
    # TODO: データベースに保存するロジックを実装
    print(f"Feedback received - Experience ID: {experience_id}, Feedback: {feedback}")
    
    # フィードバックを学習データとして活用するロジック（将来実装）
    feedback_data = {
        "experience_id": experience_id,
        "feedback": feedback,
        "timestamp": datetime.now().isoformat(),
        "processed": True
    }
    
    return {
        "status": "success",
        "message": "フィードバックを受け取りました",
        "data": feedback_data
    }

def update_preferences_service(experiences: List[Dict]) -> Dict:
    """ユーザー嗜好更新サービス"""
    # TODO: 体験データを分析してユーザー嗜好を更新するロジック
    print(f"Updating preferences based on {len(experiences)} experiences")
    
    # 簡単な分析例
    categories = {}
    completion_rate = 0
    
    for exp in experiences:
        category = exp.get('category', 'その他')
        categories[category] = categories.get(category, 0) + 1
        if exp.get('completed', False):
            completion_rate += 1
    
    if experiences:
        completion_rate = completion_rate / len(experiences)
    
    analysis = {
        "total_experiences": len(experiences),
        "category_distribution": categories,
        "completion_rate": completion_rate,
        "most_active_category": max(categories.keys(), key=categories.get) if categories else None,
        "updated_at": datetime.now().isoformat()
    }
    
    return {
        "status": "success",
        "message": "嗜好データを更新しました",
        "analysis": analysis
    }