# backend/app/schemas.py
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime

class RecommendationRequest(BaseModel):
    level: int = Field(..., ge=1, le=3, description="チャレンジレベル")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="ユーザー設定")
    experiences: Optional[List[Dict[str, Any]]] = Field(default=None, description="過去の体験履歴")

class FeedbackRequest(BaseModel):
    experience_id: str = Field(..., description="体験ID")
    feedback: str = Field(..., description="フィードバック内容")
    experiences: Optional[List[Dict[str, Any]]] = Field(default=None, description="ユーザーの体験履歴")

class PreferencesUpdateRequest(BaseModel):
    experiences: List[Dict[str, Any]] = Field(..., description="体験履歴")

class ChallengeResponse(BaseModel):
    title: str
    category: str
    type: str
    icon: str
    description: str
    estimated_time: str
    level: Optional[int] = None
    encouragement: Optional[str] = None
    anti_optimization_score: Optional[float] = None
    personalization_reason: Optional[str] = None
    generated_at: Optional[str] = None

class StandardResponse(BaseModel):
    status: str
    message: str
    timestamp: Optional[str] = None
    learning_updates: Optional[Dict[str, Any]] = None

class AnalysisResponse(BaseModel):
    status: str
    message: str
    analysis: Optional[Dict[str, Any]] = None
    growth_trends: Optional[Dict[str, Any]] = None
    recommendations: Optional[List[str]] = None
    timestamp: Optional[str] = None

class UserStatsResponse(BaseModel):
    total_experiences: int
    diversity_score: float
    growth_trend: str
    recent_categories: List[str]
    achievements: List[str]