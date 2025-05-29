# Hack1_anti-optimized-system

seren-paths-app/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx                     # メインアプリケーションコンポーネント、状態管理、ルーティング
│   │   ├── index.js                    # アプリケーションのエントリーポイント
│   │   ├── components/                 # 再利用可能なUIコンポーネント
│   │   │   ├── NavigationBar.jsx
│   │   │   ├── ExperienceStrings.jsx
│   │   │   ├── ExperienceDetailModal.jsx
│   │   │   └── IconRenderer.jsx        # アイコン名からコンポーネントをレンダリング
│   │   ├── screens/                    # 各画面コンポーネント
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── RecommendationScreen.jsx
│   │   │   ├── JournalScreen.jsx
│   │   │   ├── JournalEntryScreen.jsx
│   │   │   └── ProfileScreen.jsx
│   │   ├── services/
│   │   │   └── api.js                  # API通信関数 (元のapiオブジェクト)
│   │   ├── utils/
│   │   │   └── helpers.js              # ユーティリティ関数、ローカルチャレンジ生成、アイコンマップ
│   │   ├── constants/
│   │   │   ├── appConfig.js            # API_BASE_URL
│   │   │   └── initialData.js          # 初期データ
│   ├── package.json
│   └── tailwind.config.js
│
└── backend/
    ├── app/
    │   ├── __init__.py
    │   ├── main.py                     # FastAPIアプリ、CORS、ルーター登録
    │   ├── routes.py                   # APIエンドポイント定義
    │   ├── schemas.py                  # Pydanticモデル定義
    │   └── services.py                 # ビジネスロジック（チャレンジ生成など）
    ├── requirements.txt
    └── uvicorn_runner.py               # uvicorn起動用 (オプション)
