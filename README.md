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
    │   ├── services/
    │   │   ├── __init__.py             # ログ設定、サービス初期化
    │   │   ├── ai_service.py           # Google Gemini AI統合
    │   │   └── services.py             # ビジネスロジック（チャレンジ生成など）
    ├── .env                            # 環境変数（APIキー、デバッグ設定）
    ├── requirements.txt
    ├── ai_service.log                  # AIサービスログファイル
    └── uvicorn_runner.py               # uvicorn起動用 (オプション)
```

## 主要機能

### AIレコメンデーション機能
- **Google Gemini API統合**: 高品質なAI推奨システム
- **パーソナライズド体験**: ユーザーの好みと過去の活動に基づく推奨
- **セレンディピティエンジン**: 予期しない発見を促す推奨システム
- **成長トレンド分析**: ユーザーの進歩をAIが分析

### ログ機能
- **リアルタイムログ**: AIの出力をコンソールとファイルに記録
- **デバッグモード**: 詳細なログ出力でトラブルシューティング支援
- **UTF-8対応**: 日本語ログの適切な記録

## 環境設定

### .envファイルの設定

```bash
# Google Gemini API Key
GOOGLE_API_KEY="your_api_key_here"

# その他の設定
DEBUG=True
API_BASE_URL=http://localhost:8000
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
- **RecommendationScreen.jsx**: レコメンデーション画面（AI機能搭載）
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

### AIサービス

- **ai_service.py**: Google Gemini AI統合、レコメンデーションエンジン
- **services.py**: ビジネスロジック（チャレンジ生成、フィードバック処理）
- **__init__.py**: ログ設定とサービス初期化

### ログ機能

- **ai_service.log**: AIサービスの出力ログ
- **デバッグモード**: 環境変数DEBUGでログレベル制御
- **リアルタイム出力**: コンソールとファイルへの同時出力

## 技術スタック

- **フロントエンド**: React, Tailwind CSS
- **バックエンド**: FastAPI (Python)
- **AI**: Google Gemini API
- **ログ**: Python logging module
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

#### 2.3 環境変数の設定

```bash
# .envファイルにGoogle Gemini APIキーを設定
# GOOGLE_API_KEY="your_api_key_here"
# DEBUG=True
```

#### 2.4 バックエンドサーバーの起動

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
- ログファイル: `backend/ai_service.log`

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

## AIログの確認方法

### リアルタイム確認

```bash
# コンソール出力を確認
# バックエンド起動時に自動表示

# ログファイルをリアルタイム監視
tail -f ai_service.log
```

### デバッグモード

```bash
# .envファイルでDEBUG=Trueに設定
# より詳細なログが出力される
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

### AIサービスのトラブルシューティング

```bash
# APIキーの確認
echo %GOOGLE_API_KEY%

# ログファイルの確認
type ai_service.log
```