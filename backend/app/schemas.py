# backend/app/schemas.py
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class RecommendationRequest(BaseModel):
    level: int = Field(..., ge=1, le=3, description="チャレンジレベル（1-3）")
    preferences: Dict = Field(default_factory=dict, description="ユーザー嗜好")

class FeedbackRequest(BaseModel):
    experience_id: str = Field(..., description="体験ID")
    feedback: str = Field(..., description="フィードバック内容")

class PreferencesUpdateRequest(BaseModel):
    experiences: List[Dict] = Field(..., description="体験データリスト")

# レスポンス用スキーマ
class ChallengeResponse(BaseModel):
    id: str = Field(..., description="チャレンジID")
    title: str = Field(..., description="チャレンジタイトル")
    category: str = Field(..., description="カテゴリー")
    type: str = Field(..., description="タイプ")
    icon: str = Field(..., description="アイコン名")
    level: int = Field(..., description="レベル")
    description: Optional[str] = Field(None, description="説明")
    estimated_time: Optional[str] = Field(None, description="推定時間")
    generated_at: Optional[str] = Field(None, description="生成日時")

class StandardResponse(BaseModel):
    status: str = Field(..., description="処理結果ステータス")
    message: Optional[str] = Field(None, description="メッセージ")
    data: Optional[Dict] = Field(None, description="データ")

class AnalysisResponse(BaseModel):
    status: str
    message: str
    analysis: Dict = Field(..., description="分析結果")