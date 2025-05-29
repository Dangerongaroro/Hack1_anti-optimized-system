# backend/app/services.py
import random
from typing import Dict, List

CHALLENGES_DATA = {
    1: [
        {"id": "chall_001", "title": "普段聴かないジャンルの音楽を1曲聴く", "icon": "Music", "category": "アート", "type": "music"},
        {"id": "chall_002", "title": "いつもと違う道で帰る", "icon": "MapPin", "category": "アウトドア", "type": "place"},
    ],
    2: [
        {"id": "chall_003", "title": "隣町のカフェを開拓する", "icon": "Coffee", "category": "アウトドア", "type": "place"},
        {"id": "chall_004", "title": "オンラインで単発の絵画教室に参加", "icon": "Palette", "category": "アート", "type": "art"},
    ],
    3: [
        {"id": "chall_005", "title": "日帰りで近郊の山にハイキング", "icon": "Mountain", "category": "アウトドア", "type": "outdoor"},
        {"id": "chall_006", "title": "プログラミングの入門書を1章読む", "icon": "Code", "category": "学び", "type": "skill"},
    ]
} # IDを追加しておくとフィードバックなどで便利

def get_recommendation_service(level: int, preferences: Dict) -> Dict:
    # preferences は現状未使用
    level_challenges = CHALLENGES_DATA.get(level, CHALLENGES_DATA[2])
    selected = random.choice(level_challenges).copy() # .copy() を追加
    selected["level"] = level
    return selected

def process_feedback_service(experience_id: int, feedback: str) -> dict:
    print(f"Feedback received: {experience_id} - {feedback}")
    return {"status": "success", "message": "Feedback processed"}

def update_preferences_service(experiences: List[Dict]) -> dict:
    print(f"Updating preferences with {len(experiences)} experiences")
    return {"status": "success", "message": "Preferences updated"}