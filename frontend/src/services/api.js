// frontend/src/services/api.js
import { generateChallengeLocal } from '@/utils/helpers.js';
import { supabase } from '@/lib/supabase.js';

// API設定
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const CACHE_DURATION = 5 * 60 * 1000; // 5分
const requestCache = new Map();

// 認証付きAPI呼び出し関数
async function callAuthenticatedAPI(endpoint, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.warn('User not authenticated, using fallback');
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
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
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
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
    } catch (error) {
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
    } catch (error) {
      return false;
    }
  },

  // 統合レコメンデーション取得（認証ありと認証なし両対応）
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
      // まず認証付きAPIを試行
      const result = await callAuthenticatedAPI('/recommendations', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      requestCache.set(cacheKey, { data: result, timestamp: Date.now() });
      console.log('✅ Authenticated recommendation received:', result);
      return result;
    } catch (authError) {
      console.log('🔐 Authentication failed, trying public API');
      
      try {
        // 認証なしAPIにフォールバック
        const result = await callPublicAPI('/recommendations', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });
        
        requestCache.set(cacheKey, { data: result, timestamp: Date.now() });
        console.log('✅ Public recommendation received:', result);
        return result;
      } catch (publicError) {
        console.warn('⚠️ API unavailable, using local recommendation:', publicError.message);
        return generateChallengeLocal(level);
      }
    }
  },

  // ユーザー統計取得
  getUserStats: async (experiences = []) => {
    try {
      const experiencesParam = encodeURIComponent(JSON.stringify(experiences));
      
      try {
        // 認証付きAPI試行
        return await callAuthenticatedAPI(`/user/stats?experiences=${experiencesParam}`);
      } catch (authError) {
        // 認証なしAPIにフォールバック
        const response = await fetch(`${API_BASE_URL}/user/stats?experiences=${experiencesParam}`);
        if (response.ok) {
          return await response.json();
        }
        throw new Error('Stats API failed');
      }
    } catch (error) {
      console.warn('Failed to fetch user stats:', error);
    }
    
    // フォールバック
    return {
      total_experiences: experiences.length,
      diversity_score: 0.5,
      growth_trend: "成長中",
      recent_categories: [],
      achievements: []
    };
  },

  // チャレンジレベル情報を取得
  getChallengeLevels: async () => {
    try {
      try {
        return await callAuthenticatedAPI('/challenges/levels');
      } catch (authError) {
        const response = await fetch(`${API_BASE_URL}/challenges/levels`);
        if (response.ok) {
          return await response.json();
        }
        throw new Error('Challenge levels API failed');
      }
    } catch (error) {
      console.warn('Failed to fetch challenge levels:', error);
    }
    
    // フォールバック
    return {
      levels: {
        1: { name: "プチ・ディスカバリー", emoji: "🌱", description: "日常の小さな変化" },
        2: { name: "ウィークエンド・チャレンジ", emoji: "🚀", description: "半日～1日の挑戦" },
        3: { name: "アドベンチャー・クエスト", emoji: "⭐", description: "少し大きな体験" }
      }
    };
  },

  // 強化されたフィードバック送信
  sendFeedback: async (experienceId, feedback, experiences = []) => {
    const requestBody = { 
      experience_id: experienceId, 
      feedback,
      experiences: experiences.slice(-10)
    };

    try {
      try {
        // 認証付きAPI試行
        const result = await callAuthenticatedAPI('/feedback', {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });
        console.log('✅ Authenticated feedback processed:', result);
        return result;
      } catch (authError) {
        // 認証なしAPIにフォールバック
        const response = await fetch(`${API_BASE_URL}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Public feedback processed:', result);
        return result;
      }
    } catch (error) {
      console.warn('Failed to send feedback, will retry later:', error.message);
      api.savePendingFeedback(experienceId, feedback);
      return { status: 'pending', message: 'Feedback saved for later' };
    }
  },

  // 設定更新
  updatePreferences: async (experiences) => {
    if (!api.getAutoSaveEnabled()) {
      console.log('🔧 Auto-save disabled, skipping API call');
      return;
    }
    
    try {
      try {
        // 認証付きAPI試行
        return await callAuthenticatedAPI('/preferences/update', {
          method: 'POST',
          body: JSON.stringify({ experiences })
        });
      } catch (authError) {
        // 認証なしAPIにフォールバック
        const response = await fetch(`${API_BASE_URL}/preferences/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ experiences })
        });
        return await response.json();
      }
    } catch (error) {
      console.error('設定の更新に失敗:', error);
      // エラーでも続行
    }
  },

  // ビジュアライゼーションAPI
  getVisualizationData: async (experiences) => {
    if (!api.getAIEnabled()) {
      console.log('🤖 AI disabled, skipping server-side visualization');
      return null;
    }
    
    try {
      try {
        // 認証付きAPI試行
        const result = await callAuthenticatedAPI('/visualization/experience-strings', {
          method: 'POST',
          body: JSON.stringify(experiences)
        });
        console.log('✅ Authenticated visualization data received');
        return result.data;
      } catch (authError) {
        // 認証なしAPIにフォールバック
        const response = await fetch(`${API_BASE_URL}/visualization/experience-strings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(experiences)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Public visualization data received');
        return result.data;
      }
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