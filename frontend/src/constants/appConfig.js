// frontend/src/constants/appConfig.js

/**
 * APIのベースURLを定義します。
 * バックエンドのFastAPIサーバーがデフォルトで動作するポート（8000）を指しています。
 * もしバックエンドサーバーのアドレスやポートが異なる場合は、ここを修正してください。
 */
export const API_BASE_URL = 'http://localhost:8000/api';

// 他にもアプリケーション全体で共有したい設定値があれば、ここに追加できます。
// 例:
// export const FEATURE_FLAG_NEW_PROFILE_PAGE = true;
// export const DEFAULT_LANGUAGE = 'ja';