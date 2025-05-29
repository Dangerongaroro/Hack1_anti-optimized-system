# Hack1_anti-optimized-system

```
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
```

## フロントエンド (React)

### 主要コンポーネント

- **App.jsx**: メインアプリケーションコンポーネント、状態管理、ルーティング
- **index.js**: アプリケーションのエントリーポイント

### コンポーネント

- **NavigationBar.jsx**: ナビゲーションバー
- **ExperienceStrings.jsx**: 体験文字列表示
- **ExperienceDetailModal.jsx**: 体験詳細モーダル
- **IconRenderer.jsx**: アイコン名からコンポーネントをレンダリング

### 画面

- **HomeScreen.jsx**: ホーム画面
- **RecommendationScreen.jsx**: レコメンデーション画面
- **JournalScreen.jsx**: ジャーナル画面
- **JournalEntryScreen.jsx**: ジャーナル入力画面
- **ProfileScreen.jsx**: プロフィール画面

### サービス・ユーティリティ

- **api.js**: API通信関数
- **helpers.js**: ユーティリティ関数、ローカルチャレンジ生成、アイコンマップ
- **appConfig.js**: API_BASE_URL設定
- **initialData.js**: 初期データ

## バックエンド (FastAPI)

### 主要ファイル

- **main.py**: FastAPIアプリ、CORS、ルーター登録
- **routes.py**: APIエンドポイント定義
- **schemas.py**: Pydanticモデル定義
- **services.py**: ビジネスロジック（チャレンジ生成など）
- **uvicorn_runner.py**: uvicorn起動用 (オプション)

## 技術スタック

- **フロントエンド**: React, Tailwind CSS
- **バックエンド**: FastAPI (Python)
- **開発ツール**: uvicorn (ASGI サーバー)

仮想環境を構築してこちらを実行してください

```
cd path/to/seren-paths-app/backend
pip install -r requirements.txt
```