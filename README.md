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

## セットアップ手順

### 1. プロジェクトディレクトリに移動

```bash
cd "c:\Users\masah\制作物など\hack1\Hack1_anti-optimized-system"
```

### 2. バックエンド（Python/FastAPI）のセットアップ

#### 2.1 仮想環境の作成

```bash
# Pythonの仮想環境を作成
python -m venv masahiro_env

# 仮想環境をアクティベート（Windows）
masahiro_env\Scripts\activate
```

#### 2.2 依存関係のインストール

```bash
# backendディレクトリに移動
cd backend

# 依存関係をインストール
pip install -r requirements.txt
```

#### 2.3 バックエンドサーバーの起動

```bash
# バックエンドサーバーを起動
python uvicorn_runner.py
```

### 3. フロントエンド（React）のセットアップ

#### 3.1 新しいターミナルを開いてfrontendディレクトリに移動

```bash
cd "c:\Users\masah\制作物など\hack1\Hack1_anti-optimized-system\frontend"
```

#### 3.2 Node.jsの依存関係をインストール

```bash
npm install
```

#### 3.3 フロントエンド開発サーバーの起動

```bash
npm run dev
```

### 4. 動作確認

- バックエンド: `http://127.0.0.1:8000`
- フロントエンド: `http://localhost:5173`

### 開発時の起動手順（セットアップ後）

#### バックエンドの起動

```bash
cd "c:\Users\masah\制作物など\hack1\Hack1_anti-optimized-system"
masahiro_env\Scripts\activate
cd backend
python uvicorn_runner.py
```

#### フロントエンドの起動（新しいターミナル）
```bash
cd "c:\Users\masah\制作物など\hack1\Hack1_anti-optimized-system\frontend"
npm run dev
```

## トラブルシューティング

### Python関連のエラー
```bash
# 仮想環境の再作成
deactivate
rmdir /s masahiro_env
python -m venv masahiro_env
masahiro_env\Scripts\activate
```

### Node.js関連のエラー
```bash
# node_modulesの再インストール
cd frontend
rmdir /s node_modules
del package-lock.json
npm install
```

### ポートが使用中の場合
```bash
# バックエンド用の別ポートを指定
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload

# フロントエンド用の別ポートを指定
npm run dev -- --port 5174
```