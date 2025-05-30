# backend/app/data/challenges.py
# filepath: backend/app/data/challenges.py
"""チャレンジデータの定義"""

# チャレンジデータベース
from typing import Dict, List

CHALLENGES_DATA = {
    1: [  # プチ・ディスカバリー
        {
            "title": "いつもと違う道で帰る",
            "category": "ライフスタイル",
            "type": "lifestyle",
            "icon": "MapPin",
            "description": "新しい景色や発見があなたを待っています",
            "estimated_time": "15-30分",
            "serendipity_score": 0.7,
            "discovery_potential": "日常の風景から新しい視点を得る"
        },
        {
            "title": "普段聴かないジャンルの音楽を1曲聴く",
            "category": "アート・創作",
            "type": "music",
            "icon": "Music",
            "description": "心に響く新しいメロディーとの出会い",
            "estimated_time": "5分",
            "serendipity_score": 0.8,
            "discovery_potential": "音楽の新しい世界を発見"
        },
        {
            "title": "知らない飲み物を試してみる",
            "category": "料理・グルメ",
            "type": "food",
            "icon": "Coffee",
            "description": "味覚の新しい扉を開いてみませんか",
            "estimated_time": "10分",
            "serendipity_score": 0.6,
            "discovery_potential": "新しい味の体験"
        },
        {
            "title": "散歩中に見つけた気になるお店に入ってみる",
            "category": "ソーシャル",
            "type": "social",
            "icon": "Sparkles",
            "description": "偶然の出会いが待っています",
            "estimated_time": "30分",
            "serendipity_score": 0.8,
            "discovery_potential": "新しい人や場所との出会い"
        }
    ],
    2: [  # チャレンジ・エクスプローラー
        {
            "title": "隣町のカフェを開拓する",
            "category": "ソーシャル",
            "type": "social",
            "icon": "Coffee",
            "description": "新しい空間で過ごす時間を楽しんでみましょう",
            "estimated_time": "1-2時間",
            "serendipity_score": 0.8,
            "discovery_potential": "新しい場所と雰囲気の発見"
        },
        {
            "title": "オンライン体験レッスンに参加する",
            "category": "学習・読書",
            "type": "learning",
            "icon": "BookOpen",
            "description": "新しいスキルや知識との出会いを",
            "estimated_time": "1-2時間",
            "serendipity_score": 0.9,
            "discovery_potential": "未知のスキル領域への挑戦"
        },
        {
            "title": "地元の美術館や博物館を訪れる",
            "category": "アート・創作",
            "type": "art",
            "icon": "Palette",
            "description": "文化と歴史に触れる特別な時間",
            "estimated_time": "2-3時間",
            "serendipity_score": 0.8,
            "discovery_potential": "芸術と文化の新しい視点"
        },
        {
            "title": "知らないジャンルの本を図書館で借りる",
            "category": "学習・読書", 
            "type": "reading",
            "icon": "Book",
            "description": "新しい知識の世界への扉",
            "estimated_time": "1時間",
            "serendipity_score": 0.7,
            "discovery_potential": "思考の新しい視点を獲得"
        }
    ],
    3: [  # アドベンチャー・シーカー
        {
            "title": "日帰りで近郊の山にハイキング",
            "category": "自然・アウトドア",
            "type": "outdoor",
            "icon": "Mountain",
            "description": "自然の中で新しい自分を発見しましょう",
            "estimated_time": "4-6時間",
            "serendipity_score": 0.9,
            "discovery_potential": "自然との繋がりと体力的挑戦"
        },
        {
            "title": "プログラミングの入門書を1章読む",
            "category": "学習・読書",
            "type": "tech",
            "icon": "Code",
            "description": "デジタル世界の扉を開いてみませんか",
            "estimated_time": "2-3時間",
            "serendipity_score": 0.8,
            "discovery_potential": "論理的思考と創造性の融合"
        },
        {
            "title": "一人で映画館に行く",
            "category": "エンタメ",
            "type": "entertainment",
            "icon": "Film",
            "description": "自分だけの時間で映像作品を味わう",
            "estimated_time": "3時間",
            "serendipity_score": 0.7,
            "discovery_potential": "一人時間の価値と映像芸術の深味"
        },
        {
            "title": "新しい趣味のワークショップに参加する",
            "category": "アート・創作",
            "type": "creative",
            "icon": "Sparkles",
            "description": "創造性を刺激する新しい体験",
            "estimated_time": "3-4時間",
            "serendipity_score": 0.9,
            "discovery_potential": "隠れた才能や興味の発見"
        }
    ]
}

# カテゴリー別の追加データ
CATEGORY_METADATA = {
    "ライフスタイル": {
        "color": "#10B981",
        "description": "日常生活に新しい習慣や視点を取り入れる"
    },
    "アート・創作": {
        "color": "#8B5CF6", 
        "description": "創造性を刺激し、芸術的感性を育む"
    },
    "料理・グルメ": {
        "color": "#F59E0B",
        "description": "味覚の冒険と食文化の発見"
    },
    "ソーシャル": {
        "color": "#EF4444",
        "description": "人とのつながりと新しいコミュニティの発見"
    },
    "学習・読書": {
        "color": "#3B82F6",
        "description": "知識の拡張と思考の柔軟性を高める"
    },
    "自然・アウトドア": {
        "color": "#059669",
        "description": "自然とのつながりと身体的な挑戦"
    },
    "エンタメ": {
        "color": "#DC2626",
        "description": "娯楽を通じた新しい感動の発見"
    }
}

# レベル別のメタデータ
LEVEL_METADATA = {
    1: {
        "name": "プチ・ディスカバリー",
        "emoji": "🌱",
        "description": "手軽に始められる小さな発見",
        "time_range": "5-30分",
        "difficulty": "easy"
    },
    2: {
        "name": "チャレンジ・エクスプローラー", 
        "emoji": "🚀",
        "description": "少し踏み出す中程度の挑戦",
        "time_range": "1-3時間",
        "difficulty": "medium"
    },
    3: {
        "name": "アドベンチャー・シーカー",
        "emoji": "⭐",
        "description": "本格的な新体験への挑戦",
        "time_range": "半日以上",
        "difficulty": "hard"
    }
}