# 完全Markdownベースプロンプトローダー
import os
from typing import Dict, List, Any
from pathlib import Path

class PromptLoader:
    """Markdownプロンプトファイルを読み込み、完全にファイルベースでプロンプトを管理"""
    
    def __init__(self):
        self.prompts_dir = Path(__file__).parent.parent / "prompts"
        self._prompt_cache = {}  # プロンプトキャッシュ
        print(f"📄 Markdown-based Prompt Loader initialized: {self.prompts_dir}")
          # プロンプトファイルの存在確認
        self._verify_prompt_files()
    
    def _verify_prompt_files(self):
        """プロンプトファイルの存在を確認"""
        required_files = ["recommendation.md", "growth_analysis.md", "challenge_enhancement.md", "custom_challenge.md"]
        for filename in required_files:
            file_path = self.prompts_dir / filename
            if file_path.exists():
                print(f"✅ Found prompt file: {filename}")
            else:
                print(f"❌ Missing prompt file: {filename}")
    
    def load_prompt(self, prompt_name: str) -> str:
        """プロンプトファイルを読み込む"""
        if prompt_name in self._prompt_cache:
            return self._prompt_cache[prompt_name]
        
        prompt_file = self.prompts_dir / f"{prompt_name}.md"
        
        if not prompt_file.exists():
            print(f"⚠️ Prompt file not found: {prompt_file}")
            return ""
        
        try:
            with open(prompt_file, 'r', encoding='utf-8') as f:
                content = f.read()
                self._prompt_cache[prompt_name] = content
                print(f"✅ Loaded prompt: {prompt_name}")
                return content
        except Exception as e:
            print(f"❌ Failed to load prompt {prompt_name}: {str(e)}")
            return ""
    
    def _format_template(self, template: str, **kwargs) -> str:
        """テンプレート内の変数を置換"""
        try:
            return template.format(**kwargs)
        except KeyError as e:
            print(f"⚠️ Missing template variable: {e}")
            return template
        except Exception as e:
            print(f"❌ Template formatting error: {str(e)}")
            return template

    def format_recommendation_prompt(self, interests: List[str], avoid_categories: List[str], 
                                   level: int, recent_experiences: List[Dict]) -> str:
        """レコメンデーションプロンプトを構築"""
        template = self.load_prompt("recommendation")
        if not template:
            return self._fallback_recommendation_prompt(interests, avoid_categories, level)
        
        recent_categories = [exp.get('category', '不明') for exp in recent_experiences[-5:]]
        
        # ユーザー情報セクションを追加
        user_info = f"""

## ユーザー情報

**興味のある分野**: {', '.join(interests) if interests else '未指定'}
**避けたい分野**: {', '.join(avoid_categories) if avoid_categories else 'なし'}
**チャレンジレベル**: {level} (1=簡単, 2=中程度, 3=挑戦的)
**最近の体験**: {', '.join(recent_categories) if recent_categories else 'なし'}

上記のユーザー情報を基に、出力形式に従って体験を1つ提案してください。
"""
        
        return template + user_info
    
    def format_growth_analysis_prompt(self, **kwargs) -> str:
        """成長分析プロンプトをフォーマット"""
        template = self.load_prompt("growth_analysis")
        if not template:
            return ""
        
        # 体験履歴の要約を作成
        experience_summary = self._create_experience_summary(kwargs.get('experiences', []))
        
        try:
            return template.format(experience_summary=experience_summary)
        except KeyError as e:
            print(f"⚠️ Missing template variable: {e}")
            return template
    
    def format_challenge_enhancement_prompt(self, **kwargs) -> str:
        """チャレンジ強化プロンプトをフォーマット（Markdownから読み込み）"""
        template = self.load_prompt("challenge_enhancement")
        if not template:
            return ""
        
        challenge = kwargs.get('challenge', {})
        user_analysis = kwargs.get('user_analysis', {})
        user_experiences = kwargs.get('user_experiences', [])
        
        # 最近の体験カテゴリーを取得
        recent_categories = []
        if user_experiences:
            recent_categories = list(set([exp.get('category', '') for exp in user_experiences[-5:]]))
        
        # デフォルト値を設定
        defaults = {
            'title': challenge.get('title', ''),
            'category': challenge.get('category', ''),
            'description': challenge.get('description', ''),
            'total_experiences': user_analysis.get('total_experiences', 0),
            'diversity_score': user_analysis.get('diversity_score', 0.5),
            'recent_categories': ', '.join(recent_categories) if recent_categories else 'なし'
        }
        
        try:
            return template.format(**defaults)
        except KeyError as e:
            print(f"⚠️ Missing template variable in challenge_enhancement: {e}")
            return template
    
    def format_custom_challenge_prompt(self, **kwargs) -> str:
        """カスタムチャレンジ生成プロンプトをフォーマット（Markdownから読み込み）"""
        template = self.load_prompt("custom_challenge")
        if not template:
            return ""
        
        user_preferences = kwargs.get('user_preferences', {})
        user_experiences = kwargs.get('user_experiences', [])
        level = kwargs.get('level', 1)
        
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
        
        # デフォルト値を設定
        defaults = {
            'interests': ', '.join(interests) if interests else '未指定',
            'avoid_categories': ', '.join(avoid_categories) if avoid_categories else 'なし',
            'recent_categories': ', '.join(set(recent_categories)) if recent_categories else 'なし',
            'level': level,
            'level_description': level_descriptions.get(level, '')
        }
        
        try:
            return template.format(**defaults)
        except KeyError as e:
            print(f"⚠️ Missing template variable in custom_challenge: {e}")
            return template
    
    def _get_level_description(self, level: int) -> str:
        """レベルの説明を取得"""
        descriptions = {
            1: "15-30分程度の手軽な体験",
            2: "1-3時間程度の中程度の挑戦",
            3: "半日以上の本格的なアドベンチャー"
        }
        return descriptions.get(level, "手軽な体験")
    
    def _format_recent_experiences(self, experiences: list) -> str:
        """最近の体験を文字列にフォーマット"""
        if not experiences:
            return "まだ体験がありません"
        
        recent = experiences[-5:]  # 最新5件
        formatted = []
        
        for exp in recent:
            title = exp.get('title', '不明')
            category = exp.get('category', '不明')
            formatted.append(f"- {title} ({category})")
        
        return '\n'.join(formatted)
    
    def _create_experience_summary(self, experiences: list) -> str:
        """体験履歴の要約を作成"""
        if not experiences:
            return "まだ体験履歴がありません"
        
        # カテゴリー分布を計算
        categories = {}
        for exp in experiences:
            category = exp.get('category', '不明')
            categories[category] = categories.get(category, 0) + 1
        
        summary = f"""
体験総数: {len(experiences)}件

カテゴリー分布:
{self._format_category_distribution(categories)}

最近の体験（最新5件）:
{self._format_recent_experiences(experiences)}
"""
        return summary
    
    def _format_category_distribution(self, categories: dict) -> str:
        """カテゴリー分布をフォーマット"""
        if not categories:
            return "なし"
        
        formatted = []
        for category, count in categories.items():
            formatted.append(f"- {category}: {count}件")
        
        return '\n'.join(formatted)
