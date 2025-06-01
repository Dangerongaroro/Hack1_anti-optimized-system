# AI推奨サービス（LangChain + Google Gemini統合）
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
from dotenv import load_dotenv

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
    """LangChain + Google Gemini を使用したAI推奨サービス"""
    
    def __init__(self):
        # 環境変数からAPIキーを取得
        google_api_key = os.getenv("GOOGLE_API_KEY")
        
        if LANGCHAIN_AVAILABLE and google_api_key and google_api_key != 'your_api_key_here':
            try:
                self.model = ChatGoogleGenerativeAI(
                    model="gemma-3-12b-it",
                    google_api_key=google_api_key
                )
                # 接続テスト
                test_response = self.model.invoke([HumanMessage(content="Hello")])
                self.enabled = True
                print("✅ AI Service: LangChain + Gemini API initialized successfully")
            except Exception as e:
                self.model = None
                self.enabled = False
                print(f"⚠️ AI Service: Failed to initialize Gemini API: {str(e)}")
        else:
            self.model = None
            self.enabled = False
            print("⚠️ AI Service: No API key found or LangChain not available, running in fallback mode")
    
    def enhance_challenge_with_ai(self, challenge: Dict, user_analysis: Dict, user_experiences: List[Dict] = None) -> Dict:
        """AIでチャレンジを強化・パーソナライズ"""
        if not self.enabled:
            return challenge
        
        try:
            # プロンプトの構築
            prompt = self._build_enhancement_prompt(challenge, user_analysis, user_experiences)
            
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
    
    def suggest_custom_challenge(self, user_preferences: Dict, user_experiences: List[Dict], level: int) -> Optional[Dict]:
        """完全カスタムチャレンジをAIで生成"""
        if not self.enabled:
            return None
        
        try:
            prompt = self._build_custom_challenge_prompt(user_preferences, user_experiences, level)
            message = HumanMessage(content=prompt)
            response = self.model.invoke([message])
            
            if response.content:
                return self._parse_custom_challenge(response.content, level)
                
        except Exception as e:
            print(f"🤖 Custom challenge generation failed: {str(e)}")
        
        return None
    
    def _build_enhancement_prompt(self, challenge: Dict, user_analysis: Dict, user_experiences: List[Dict]) -> str:
        """チャレンジ強化用プロンプト"""
        recent_categories = []
        if user_experiences:
            recent_categories = list(set([exp.get('category', '') for exp in user_experiences[-5:]]))
        
        return f"""
        【チャレンジ強化タスク】
        
        基本チャレンジ:
        - タイトル: {challenge['title']}
        - カテゴリー: {challenge['category']}
        - 説明: {challenge.get('description', '')}
        
        ユーザー分析:
        - 総体験数: {user_analysis.get('total_experiences', 0)}
        - 多様性スコア: {user_analysis.get('diversity_score', 0.5)}
        - 最近の体験カテゴリー: {', '.join(recent_categories)}
        
        このユーザーに合わせてチャレンジを強化してください。
        以下のJSON形式で返してください（JSON以外は含めないでください）:
        
        {{
            "enhanced_description": "パーソナライズされた説明文",
            "encouragement": "ユーザーを励ます一言",
            "tips": ["実行のコツ1", "実行のコツ2"],
            "expected_discovery": "期待される発見や学び"
        }}
        """
    
    def _build_custom_challenge_prompt(self, user_preferences: Dict, user_experiences: List[Dict], level: int) -> str:
        """カスタムチャレンジ生成プロンプト"""
        avoid_categories = user_preferences.get('avoidCategories', [])
        interests = user_preferences.get('interests', [])
        
        # 最近の体験を分析
        recent_categories = []
        if user_experiences:
            recent_categories = [exp.get('category', '') for exp in user_experiences[-10:]]
        
        level_descriptions = {
            1: "15-30分程度の手軽な体験",
            2: "1-3時間程度の中程度の挑戦",
            3: "半日以上の本格的なアドベンチャー"
        }
        
        return f"""
        【完全オリジナルチャレンジ生成】
        
        ユーザープロフィール:
        - 興味分野: {', '.join(interests) if interests else '未指定'}
        - 避けたい分野: {', '.join(avoid_categories) if avoid_categories else 'なし'}
        - 最近の体験: {', '.join(set(recent_categories)) if recent_categories else 'なし'}
        
        要求レベル: {level} ({level_descriptions.get(level, '')})
        
        アンチ最適化の観点から、このユーザーが予期しない発見をできる完全オリジナルのチャレンジを考案してください。
        
        以下のJSON形式で返してください（JSON以外は含めないでください）:
        
        {{
            "title": "チャレンジタイトル",
            "category": "カテゴリー",
            "type": "タイプ",
            "description": "説明文",
            "estimated_time": "所要時間",
            "encouragement": "励ましの言葉",
            "anti_optimization_reason": "なぜこのチャレンジがアンチ最適化なのか"
        }}
        """
    
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