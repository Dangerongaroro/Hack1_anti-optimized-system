# backend/app/routes.py
from fastapi import APIRouter
from .schemas import RecommendationRequest, FeedbackRequest, PreferencesUpdateRequest, ChallengeResponse
from .services import get_recommendation_service, process_feedback_service, update_preferences_service

router = APIRouter()

@router.post("/recommendations", response_model=ChallengeResponse) # response_model追加
async def get_recommendation_endpoint(request: RecommendationRequest):
    return get_recommendation_service(request.level, request.preferences)

@router.post("/feedback")
async def send_feedback_endpoint(request: FeedbackRequest):
    return process_feedback_service(request.experience_id, request.feedback)

@router.post("/preferences/update")
async def update_preferences_endpoint(request: PreferencesUpdateRequest):
    return update_preferences_service(request.experiences)