# backend/app/data/challenges.py
# filepath: backend/app/data/challenges.py
"""チャレンジデータの定義"""

CHALLENGES_DATA = {
    1: [
        {
            "id": "chall_001",
            "title": "普段聴かないジャンルの音楽を1曲聴く",
            "icon": "Music",
            "category": "アート",
            "type": "music",
            "description": "新しい音楽ジャンルで感性を広げてみましょう",
            "estimated_time": "5分",
            "difficulty": 1
        },
        {
            "id": "chall_002",
            "title": "いつもと違う道で帰る",
            "icon": "MapPin",
            "category": "アウトドア",
            "type": "place",
            "description": "普段とは違うルートで小さな発見をしてみましょう",
            "estimated_time": "10分",
            "difficulty": 1
        },
        {
            "id": "chall_003",
            "title": "普段読まない分野の記事を読む",
            "icon": "BookOpen",
            "category": "学び",
            "type": "reading",
            "description": "新しい知識で世界を広げてみましょう",
            "estimated_time": "10分",
            "difficulty": 1
        }
    ],
    2: [
        {
            "id": "chall_004",
            "title": "隣町のカフェを開拓する",
            "icon": "Coffee",
            "category": "アウトドア",
            "type": "place",
            "description": "新しい場所で素敵な時間を過ごしてみましょう",
            "estimated_time": "1-2時間",
            "difficulty": 2
        },
        {
            "id": "chall_005",
            "title": "オンライン講座を1つ受講する",
            "icon": "Video",
            "category": "学び",
            "type": "online",
            "description": "新しいスキルに挑戦してみましょう",
            "estimated_time": "1時間",
            "difficulty": 2
        },
        {
            "id": "chall_006",
            "title": "新しいレシピで料理に挑戦",
            "icon": "Book",
            "category": "食",
            "type": "skill",
            "description": "料理で創造性を発揮してみましょう",
            "estimated_time": "1-2時間",
            "difficulty": 2
        }
    ],
    3: [
        {
            "id": "chall_007",
            "title": "日帰りで近郊の山にハイキング",
            "icon": "Mountain",
            "category": "アウトドア",
            "type": "outdoor",
            "description": "自然の中で新しい自分を発見してみましょう",
            "estimated_time": "半日",
            "difficulty": 3
        },
        {
            "id": "chall_008",
            "title": "新しい言語の基礎を学ぶ",
            "icon": "Globe",
            "category": "学び",
            "type": "language",
            "description": "新しい言語で世界を広げてみましょう",
            "estimated_time": "3-4時間",
            "difficulty": 3
        }
    ]
}