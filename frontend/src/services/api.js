// frontend/src/services/api.js
import { generateChallengeLocal } from '../utils/helpers.js';
import { supabase } from '../lib/supabase.js';

// API設定（デプロイ対応）
const getApiBaseUrl = () => {
  // 本番環境の場合
  if (import.meta.env.PROD) {
    return 'https://srv-d10sbe63jp1c739anh1g.onrender.com/api';
  }
  
  // 開発環境の場合
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

// デバッグ情報をコンソールに出力
console.log('🔧 API Configuration:');
console.log('   Environment:', import.meta.env.MODE);
console.log('   VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('   Final API_BASE_URL:', API_BASE_URL);

const CACHE_DURATION = 5 * 60 * 1000; // 5分
const requestCache = new Map();

// リトライのためのレート制限管理
let lastApiCall = 0;
const MIN_API_INTERVAL = 1000; // 1秒間隔

// 統一されたAPI呼び出し関数（認証付き→認証なし→ローカルフォールバック）
async function callAPIWithFallback(endpoint, options = {}, localFallback = null) {
  // レート制限チェック
  const now = Date.now();
  if (now - lastApiCall < MIN_API_INTERVAL) {
    console.log('⏳ レート制限により待機中...');
    await new Promise(resolve => setTimeout(resolve, MIN_API_INTERVAL - (now - lastApiCall)));
  }
  lastApiCall = Date.now();
  try {
    // まず認証付きAPIを試行
    const result = await callAuthenticatedAPI(endpoint, options);
    console.log('✅ 認証付きAPI呼び出し成功');
    return result;
  } catch {
    console.log('🔐 認証エラー、パブリックAPIにフォールバック');
    
    try {
      // 認証なしAPIにフォールバック
      const result = await callPublicAPI(endpoint, options);
      console.log('✅ パブリックAPI呼び出し成功');
      return result;
    } catch {
      console.warn('⚠️ API利用不可、ローカルフォールバック使用');
      
      if (localFallback) {
        return localFallback();
      }
      throw new Error('All API methods failed and no local fallback provided');
    }
  }
}

// 認証付きAPI呼び出し関数
async function callAuthenticatedAPI(endpoint, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.log('User not authenticated, using fallback');
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
    // タイムアウト設定
    signal: AbortSignal.timeout(30000), // 30秒
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }
  
  return response.json();
}

// 認証なしAPI呼び出し関数（フォールバック用）
async function callPublicAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // タイムアウト設定
    signal: AbortSignal.timeout(30000), // 30秒
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }
  
  return response.json();
}

const api = {
  // AI機能の有効/無効切り替え
  getAIEnabled: () => {
    return localStorage.getItem('aiEnabled') !== 'false';
  },
  
  setAIEnabled: (enabled) => {
    localStorage.setItem('aiEnabled', enabled.toString());
  },

  // 自動保存の設定を管理
  getAutoSaveEnabled: () => {
    return localStorage.getItem('autoSaveExperiences') !== 'false';
  },
  
  setAutoSaveEnabled: (enabled) => {
    localStorage.setItem('autoSaveExperiences', enabled.toString());
  },
  // ヘルスチェック機能
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },

  // API接続チェック
  checkConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  },
  // 統合レコメンデーション取得（最適化版）
  getRecommendation: async (level, userPreferences, experiences = []) => {
    if (!api.getAIEnabled()) {
      console.log('🤖 AI disabled, using local recommendation');
      return generateChallengeLocal(level);
    }
    
    const cacheKey = `rec_${level}_${JSON.stringify(userPreferences)}_${experiences.length}`;
    const cached = requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Using cached recommendation');
      return cached.data;
    }
    
    const requestBody = { 
      level, 
      preferences: userPreferences || {},
      experiences: experiences.slice(-10)
    };

    try {
      const result = await callAPIWithFallback('/recommendations', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      }, () => generateChallengeLocal(level));
      
      requestCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.warn('⚠️ All API methods failed, using local fallback:', error.message);
      return generateChallengeLocal(level);
    }
  },
  // ユーザー統計取得（最適化版）
  getUserStats: async (experiences = []) => {
    try {
      const experiencesParam = encodeURIComponent(JSON.stringify(experiences));
      
      const result = await callAPIWithFallback(`/user/stats?experiences=${experiencesParam}`, {
        method: 'GET'
      });
      
      return result;
    } catch (error) {
      console.warn('Failed to fetch user stats:', error);
      
      // フォールバック
      return {
        total_experiences: experiences.length,
        diversity_score: 0.5,
        growth_trend: "成長中",
        recent_categories: [],
        achievements: []
      };
    }
  },

  // チャレンジレベル情報を取得（最適化版）
  getChallengeLevels: async () => {
    try {
      const result = await callAPIWithFallback('/challenges/levels', {
        method: 'GET'
      });
      
      return result;
    } catch (error) {
      console.warn('Failed to fetch challenge levels:', error);
      
      // フォールバック
      return {
        levels: {
          1: { name: "プチ・ディスカバリー", emoji: "🌱", description: "日常の小さな変化" },
          2: { name: "ウィークエンド・チャレンジ", emoji: "🚀", description: "半日～1日の挑戦" },
          3: { name: "アドベンチャー・クエスト", emoji: "⭐", description: "少し大きな体験" }
        }
      };
    }
  },
  // 最適化されたフィードバック送信
  sendFeedback: async (experienceId, feedback, experiences = []) => {
    const requestBody = { 
      experience_id: experienceId, 
      feedback,
      experiences: experiences.slice(-10)
    };

    try {
      const result = await callAPIWithFallback('/feedback', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      console.log('✅ フィードバック送信成功:', result);
      return result;
    } catch (error) {
      console.warn('フィードバック送信失敗、後で再試行:', error.message);
      api.savePendingFeedback(experienceId, feedback);
      return { status: 'pending', message: 'Feedback saved for later' };
    }
  },
  // 最適化された設定更新
  updatePreferences: async (experiences) => {
    if (!api.getAutoSaveEnabled()) {
      console.log('🔧 Auto-save disabled, skipping API call');
      return;
    }
    
    try {
      const result = await callAPIWithFallback('/preferences/update', {
        method: 'POST',
        body: JSON.stringify({ experiences })
      });
      return result;
    } catch (error) {
      console.error('設定の更新に失敗:', error);
      // エラーでも続行
    }
  },

  // 最適化されたビジュアライゼーションAPI
  getVisualizationData: async (experiences) => {
    if (!api.getAIEnabled()) {
      console.log('🤖 AI disabled, skipping server-side visualization');
      return null;
    }
    
    // キャッシングキーを生成（体験の数とハッシュベース）
    const cacheKey = `viz_${experiences.length}_${JSON.stringify(experiences.slice(-3))}`;
    const cached = requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Cached visualization data returned');
      return cached.data;
    }
    
    try {
      const result = await callAPIWithFallback('/visualization/experience-strings', {
        method: 'POST',
        body: JSON.stringify(experiences)
      });
      
      const data = result.data || result;
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
      console.log('✅ ビジュアライゼーションデータ取得成功（キャッシュ保存）');
      return data;
    } catch (error) {
      console.error('❌ Server-side visualization failed:', error);
      return null;
    }
  },

  // 保留データ管理
  savePendingFeedback: (experienceId, feedback) => {
    try {
      const pending = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
      pending.push({ experienceId, feedback, timestamp: Date.now() });
      localStorage.setItem('pendingFeedback', JSON.stringify(pending));
    } catch (error) {
      console.error('Failed to save pending feedback:', error);
    }
  },

  savePendingPreferences: (experiences) => {
    try {
      localStorage.setItem('pendingPreferences', JSON.stringify({
        experiences,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save pending preferences:', error);
    }
  },

  // 保留中のデータを送信
  syncPendingData: async () => {
    try {
      // 保留中のフィードバックを送信
      const pendingFeedback = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
      for (const item of pendingFeedback) {
        await api.sendFeedback(item.experienceId, item.feedback);
      }
      if (pendingFeedback.length > 0) {
        localStorage.removeItem('pendingFeedback');
        console.log(`✅ Synced ${pendingFeedback.length} pending feedback items`);
      }

      // 保留中の嗜好を送信
      const pendingPreferences = JSON.parse(localStorage.getItem('pendingPreferences') || 'null');
      if (pendingPreferences) {
        await api.updatePreferences(pendingPreferences.experiences);
        localStorage.removeItem('pendingPreferences');
        console.log('✅ Synced pending preferences');
      }
    } catch (error) {
      console.warn('Failed to sync pending data:', error.message);
    }
  },

  // 初期化
  initialize: async () => {
    try {
      const isHealthy = await api.checkHealth();
      if (isHealthy) {
        console.log('✅ API接続OK');
        await api.syncPendingData();
      } else {
        console.log('⚠️ API未接続 - オフラインモード');
      }
      
      // Supabase認証状態もチェック
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('✅ Supabase認証済み');
      } else {
        console.log('ℹ️ Supabase未認証 - ゲストモード');
      }
    } catch (error) {
      console.error('API初期化エラー:', error);
    }
  },

  // 認証状態取得
  getAuthStatus: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      isAuthenticated: !!session,
      user: session?.user || null,
      session: session
    };
  },

  // サインアウト
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    // ローカルキャッシュもクリア
    requestCache.clear();
    console.log('✅ Signed out successfully');
  }
};

// 正しいエクスポート
export default api;
export { api, callAuthenticatedAPI };