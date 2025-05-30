# backend/app/prompts/__init__.py
import os
from pathlib import Path

def load_prompt(prompt_name: str) -> str:
    """プロンプトファイルを読み込む"""
    prompt_path = Path(__file__).parent / f"{prompt_name}.md"
    if prompt_path.exists():
        with open(prompt_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")

__all__ = ['load_prompt']