# backend/app/schemas.py
from pydantic import BaseModel
from typing import List, Dict, Optional

class RecommendationRequest(BaseModel):
    level: int
    preferences: Dict

class FeedbackRequest(BaseModel):
    experience_id: int # または str、フロントのID型と合わせる
    feedback: str

class PreferencesUpdateRequest(BaseModel):
    experiences: List[Dict]

# レスポンス用スキーマ (任意だが推奨)
class ChallengeResponse(BaseModel):
    title: str
    icon: str
    category: str
    type: str
    level: int
    id: Optional[str] = None # チャレンジにIDを付与する場合