import logging
import os
from dotenv import load_dotenv
from .ai_service import AIRecommendationService

# 環境変数を読み込み
load_dotenv()

# ログレベルを環境変数から取得（デバッグモードの場合はDEBUGレベル）
log_level = logging.DEBUG if os.getenv('DEBUG', 'False').lower() == 'true' else logging.INFO

# ログ設定を強制的に再設定
for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)

logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_service.log', encoding='utf-8'),
        logging.StreamHandler()
    ],
    force=True
)

# AIサービス用のロガー
ai_logger = logging.getLogger('ai_service')
ai_logger.setLevel(log_level)

# 初期化時にテストログを出力
ai_logger.info("AI Service Logger initialized successfully")
ai_logger.debug("Debug mode is enabled")

# services.pyの関数を直接インポート（循環インポートを回避）
from .services import (
    get_recommendation_service,
    process_feedback_service, 
    update_preferences_service,
    analyze_growth_trends,
    serendipity_engine
)

__all__ = [
    'AIRecommendationService',
    'get_recommendation_service',
    'process_feedback_service',
    'update_preferences_service', 
    'analyze_growth_trends',
    'serendipity_engine',
    'ai_logger'
]