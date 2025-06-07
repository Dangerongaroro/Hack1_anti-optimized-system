# AI推奨サービス（LangChain + Google Gemini統合）
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
from dotenv import load_dotenv
from .prompt_loader import PromptLoader

# LangChainのインポート
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    print("⚠️ LangChain Google GenAI not installed, running in fallback mode")

# .envファイルを読み込む
load_dotenv()

class AIRecommendationService:
    def __init__(self):
        # プロンプトローダーを初期化
        self.prompt_loader = PromptLoader()
        
        # 環境変数の詳細確認
        google_api_key = os.getenv("GOOGLE_API_KEY")
        
        print("🤖 AI Service Initialization:")
        print(f"   LANGCHAIN_AVAILABLE: {LANGCHAIN_AVAILABLE}")
        print(f"   API Key exists: {google_api_key is not None}")
        print(f"   API Key length: {len(google_api_key) if google_api_key else 0}")
        print(f"   API Key valid format: {google_api_key and len(google_api_key) > 20 if google_api_key else False}")
        
        if LANGCHAIN_AVAILABLE and google_api_key and google_api_key != 'your_api_key_here':
            try:
                print("🔄 Attempting to initialize Gemini API...")
                self.model = ChatGoogleGenerativeAI(
                    model="gemma-3-27b-it",  # モデル名を修正
                    google_api_key=google_api_key,
                    temperature=0.7
                )
                self.enabled = True
                print("✅ AI Service: Gemini API initialized successfully")
                
                # 簡単な接続テスト（起動時ではなく、必要時に実行）
                # self.test_connection()
                
            except Exception as e:
                self.model = None
                self.enabled = False
                print(f"❌ AI Service: Failed to initialize Gemini API: {str(e)}")
                print(f"   Error type: {type(e).__name__}")
        else:
            self.model = None
            self.enabled = False
            reasons = []
            if not LANGCHAIN_AVAILABLE:
                reasons.append("LangChain not available")
            if not google_api_key:
                reasons.append("No API key")
            elif google_api_key == 'your_api_key_here':
                reasons.append("Placeholder API key")
            
            print(f"⚠️ AI Service disabled: {', '.join(reasons)}")
    
    def test_connection_endpoint(self) -> dict:
        """デバッグ用の接続テストエンドポイント"""
        if not self.enabled:
            return {
                "status": "disabled",
                "message": "AI service is not enabled",
                "langchain_available": LANGCHAIN_AVAILABLE,
                "api_key_exists": "GOOGLE_API_KEY" in os.environ
            }
        
        try:
            message = HumanMessage(content="Hello, test connection")
            response = self.model.invoke([message])
            return {
                "status": "success",
                "message": "AI service is working",
                "response_length": len(response.content),
                "model_name": "gemini-pro"
            }
        except Exception as e:
            return {
                "status": "error", 
                "message": f"AI service test failed: {str(e)}",
                "error_type": type(e).__name__
            }
    
    # 接続テストを別メソッドに分離
    def lazy_test_connection(self) -> bool:
        """必要時のみ接続テストを実行"""
        if not self.enabled:
            return False
        
        try:
            message = HumanMessage(content="test")
            response = self.model.invoke([message])
            return True
        except Exception as e:
            print(f"AI connection test failed: {str(e)}")
            return False

    def enhance_challenge_with_ai(self, challenge: Dict, user_analysis: Dict, user_experiences: List[Dict] = None) -> Dict:
        """AIでチャレンジを強化・パーソナライズ"""
        if not self.enabled:
            return challenge
        
        try:
            # プロンプトローダーを使用してプロンプトを構築
            prompt = self.prompt_loader.format_challenge_enhancement_prompt(
                challenge=challenge,
                user_analysis=user_analysis,
                user_experiences=user_experiences or []
            )
            
            # LangChainでAI生成
            message = HumanMessage(content=prompt)
            response = self.model.invoke([message])
            
            if response.content:
                ai_enhancement = self._parse_ai_response(response.content)
                return self._merge_ai_enhancement(challenge, ai_enhancement)
        except Exception as e:
            print(f"🤖 AI Enhancement failed: {str(e)}")
        
        return challenge

    def generate_personalized_description(self, challenge: Dict, user_context: Dict) -> str:
        """ユーザーコンテキストに基づいた説明文を生成"""
        if not self.enabled:
            return challenge.get('description', '')
        
        try:
            prompt = f"""
            チャレンジ: {challenge['title']}
            カテゴリー: {challenge['category']}
            ユーザーの体験レベル: {user_context.get('total_experiences', 0)}件
            多様性スコア: {user_context.get('diversity_score', 0.5)}
            
            このユーザーに向けて、このチャレンジの魅力を2-3文で説明してください。
            アンチ最適化（予期しない発見）の価値を強調してください。
            日本語で回答してください。
            """
            
            message = HumanMessage(content=prompt)
            response = self.model.invoke([message])
            
            if response.content:
                return response.content.strip()
                
        except Exception as e:
            print(f"🤖 AI Description generation failed: {str(e)}")
        
        return challenge.get('description', '')
    
    def generate_ai_recommendation(self, user_preferences: Dict, user_experiences: List[Dict], level: int = 2) -> Optional[Dict]:
        """詳細なプロンプトテンプレートを使用したレコメンデーション生成"""
        if not self.enabled:
            return None
        
        try:
            # プロンプトローダーを使用してレコメンデーションプロンプトを構築
            prompt = self.prompt_loader.format_recommendation_prompt(
                interests=user_preferences.get('interests', []),
                avoid_categories=user_preferences.get('avoidCategories', []),
                level=level,
                recent_experiences=user_experiences[-10:] if user_experiences else []
            )
            
            print(f"🤖 Generated recommendation prompt (length: {len(prompt)})")
            
            message = HumanMessage(content=prompt)
            response = self.model.invoke([message])
            
            if response.content:
                recommendation = self._parse_ai_response(response.content)
                if recommendation:
                    # レコメンデーション用の追加フィールドを設定
                    recommendation.update({
                        "level": level,
                        "ai_generated": True,
                        "generated_at": datetime.now().isoformat(),
                        "recommendation_type": "ai_personalized"
                    })
                    print(f"✅ AI recommendation generated: {recommendation.get('title', 'Unknown')}")
                    return recommendation
        except Exception as e:
            print(f"🤖 AI Recommendation generation failed: {str(e)}")
        
        return None

    def suggest_custom_challenge(self, user_preferences: Dict, user_experiences: List[Dict], level: int) -> Optional[Dict]:
        """完全カスタムチャレンジをAIで生成"""
        if not self.enabled:
            return None
        
        try:
            # プロンプトローダーを使用してプロンプトを構築
            prompt = self.prompt_loader.format_custom_challenge_prompt(
                user_preferences=user_preferences,
                user_experiences=user_experiences,
                level=level
            )
            
            message = HumanMessage(content=prompt)
            response = self.model.invoke([message])
            
            if response.content:
                return self._parse_custom_challenge(response.content, level)
                
        except Exception as e:
            print(f"🤖 Custom challenge generation failed: {str(e)}")
            return None

    def _parse_ai_response(self, response_text: str) -> Dict:
        """AI応答をパース"""
        try:
            # JSON部分を抽出
            response_text = response_text.strip()
            
            # JSONブロックを探す
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            
            if start != -1 and end > start:
                json_text = response_text[start:end]
                return json.loads(json_text)
            else:
                # JSONが見つからない場合の処理
                print(f"🤖 No JSON found in response: {response_text[:100]}...")
                return {}
                
        except json.JSONDecodeError as e:
            print(f"🤖 JSON parsing failed: {str(e)}")
            print(f"🤖 Response text: {response_text[:200]}...")
        except Exception as e:
            print(f"🤖 AI response parsing failed: {str(e)}")
        
        return {}
    
    def _parse_custom_challenge(self, response_text: str, level: int) -> Dict:
        """カスタムチャレンジをパース"""
        parsed = self._parse_ai_response(response_text)
        if parsed:
            # 必要なフィールドを追加
            parsed.update({
                "level": level,
                "icon": "Sparkles",  # デフォルトアイコン
                "serendipity_score": 0.9,  # AI生成は高いセレンディピティスコア
                "discovery_potential": parsed.get("anti_optimization_reason", "AI が提案する新しい体験"),
                "generated_at": datetime.now().isoformat(),
                "ai_generated": True
            })
            return parsed
        return None
    
    def _merge_ai_enhancement(self, original: Dict, enhancement: Dict) -> Dict:
        """オリジナルチャレンジとAI強化を統合"""
        enhanced = original.copy()
        
        if enhancement.get('enhanced_description'):
            enhanced['description'] = enhancement['enhanced_description']
        
        if enhancement.get('encouragement'):
            enhanced['encouragement'] = enhancement['encouragement']
        
        if enhancement.get('tips'):
            enhanced['ai_tips'] = enhancement['tips']
        
        if enhancement.get('expected_discovery'):
            enhanced['expected_discovery'] = enhancement['expected_discovery']
        
        enhanced['ai_enhanced'] = True
        enhanced['enhancement_timestamp'] = datetime.now().isoformat()
        
        return enhanced

    def test_connection(self) -> Dict:
        """AI接続テスト"""
        if not self.enabled:
            return {"status": "disabled", "message": "AI service is not enabled"}
        
        try:
            message = HumanMessage(content="こんにちは！動作確認です。")
            response = self.model.invoke([message])
            return {
                "status": "success", 
                "message": "AI service is working",
                "response": response.content[:100] + "..." if len(response.content) > 100 else response.content
            }        
        except Exception as e:
            return {"status": "error", "message": f"AI service test failed: {str(e)}"}
            
    def analyze_growth_pattern(self, experiences: List[Dict]) -> Dict:
        """成長パターンをAIで分析"""
        if not self.enabled:
            return {
                "insights": ["順調に成長しています"],
                "next_challenges": ["新しいカテゴリーに挑戦"]
            }
        
        try:
            # プロンプトローダーを使用してプロンプトを構築
            prompt = self.prompt_loader.format_growth_analysis_prompt(experiences=experiences)
            
            message = HumanMessage(content=prompt)
            response = self.model.invoke([message])
            
            if response.content:
                return self._parse_ai_response(response.content)
                
        except Exception as e:
            print(f"AI analysis error: {str(e)}")
            return {
                "insights": ["分析中にエラーが発生しました"],
                "next_challenge_areas": ["様々な分野への挑戦"],
                "summary": "基本的な成長パターンを継続中",
                "encouragement": "新しい体験を続けていきましょう",
                "growth_stage": "developing"
            }

    def _safe_json_parse(self, content: str) -> Dict:
        """安全なJSON解析"""
        try:
            # JSONブロックを抽出
            if "```json" in content:
                start = content.find("```json") + 7
                end = content.find("```", start)
                if end != -1:
                    content = content[start:end].strip()
            
            return json.loads(content)
        except Exception as e:
            print(f"JSON parse error: {str(e)}")
            return {}

    def _create_fallback_response(self, challenge_type: str = "general") -> Dict:
        """フォールバック応答を作成"""
        if challenge_type == "enhancement":
            return {
                "enhanced_description": "新しい体験への挑戦",
                "encouragement": "一歩踏み出してみましょう",
                "tips": ["ゆっくりと始める", "楽しむことを重視する"],
                "expected_discovery": "新しい発見"
            }
        elif challenge_type == "custom":
            return {
                "title": "今日の特別な発見",
                "category": "ライフスタイル",
                "type": "general",
                "description": "新しい一日を特別にする小さな冒険",
                "estimated_time": "30分",
                "encouragement": "新しい体験を楽しんでください",
                "anti_optimization_reason": "日常の枠を超えた新しい発見のため"
            }
        else:
            return {
                "insights": ["継続的な成長を続けています"],
                "next_challenge_areas": ["新しい分野への挑戦"],
                "summary": "着実な成長パターン",
                "encouragement": "新しい体験を続けていきましょう",
                "growth_stage": "developing"
            }