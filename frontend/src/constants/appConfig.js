// frontend/src/constants/appConfig.js

/**
 * APIのベースURLを定義します。
 * 環境変数VITE_API_URLが設定されている場合はそれを使用し、
 * 設定されていない場合はローカル開発用のURLを使用します。
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// 他にもアプリケーション全体で共有したい設定値があれば、ここに追加できます。
// 例:
// export const FEATURE_FLAG_NEW_PROFILE_PAGE = true;
// export const DEFAULT_LANGUAGE = 'ja';