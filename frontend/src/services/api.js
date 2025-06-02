import { generateChallengeLocal } from '../utils/helpers.js';

// API設定
const API_BASE_URL = 'http://localhost:8000/api';

const CACHE_DURATION = 5 * 60 * 1000; // 5分
const requestCache = new Map();

const api = {
  // AI機能の有効/無効切り替え
  getAIEnabled: () => {
    return localStorage.getItem('aiEnabled') !== 'false'; // デフォルトはtrue
  },
  
  setAIEnabled: (enabled) => {
    localStorage.setItem('aiEnabled', enabled.toString());
  },

  // 条件付きレコメンド取得
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
    
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          level, 
          preferences: userPreferences || {},
          experiences: experiences.slice(-10) // 最近10件のみ送信
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      requestCache.set(cacheKey, { data: result, timestamp: Date.now() });
      console.log('✅ Personalized recommendation received:', result);
      return result;
    } catch (error) {
      console.warn('⚠️ API unavailable, using local recommendation:', error.message);
      return generateChallengeLocal(level);
    }
  },

  // ヘルスチェック機能を追加
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // ユーザー統計取得
  getUserStats: async (experiences = []) => {
    try {
      const experiencesParam = encodeURIComponent(JSON.stringify(experiences));
      const response = await fetch(`${API_BASE_URL}/user/stats?experiences=${experiencesParam}`);
      
      if (response.ok) {
        return await response.json();
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
      const response = await fetch(`${API_BASE_URL}/challenges/levels`);
      if (response.ok) {
        return await response.json();
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
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          experience_id: experienceId, 
          feedback,
          experiences: experiences.slice(-10) // 最近10件を学習用に送信
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Enhanced feedback processed:', result);
      return result;
    } catch (error) {
      console.warn('Failed to send feedback, will retry later:', error.message);
      // フィードバックをローカルストレージに保存して後で送信
      this.savePendingFeedback(experienceId, feedback);
      return { status: 'pending', message: 'Feedback saved for later' };
    }
  },

  // 自動保存の設定を管理
  getAutoSaveEnabled: () => {
    return localStorage.getItem('autoSaveExperiences') !== 'false'; // デフォルトはtrue
  },
  
  setAutoSaveEnabled: (enabled) => {
    localStorage.setItem('autoSaveExperiences', enabled.toString());
  },
  
  // 既存のupdatePreferencesを条件付きに
  updatePreferences: async (experiences) => {
    if (!api.getAutoSaveEnabled()) {
      console.log('🔧 Auto-save disabled, skipping API call');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/preferences`, { // BASE_URL → API_BASE_URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experiences })
      });
      return await response.json();
    } catch (error) {
      console.error('設定の更新に失敗:', error);
      throw error;
    }
  },
  
  // 保留中のフィードバックを保存
  savePendingFeedback: (experienceId, feedback) => {
    try {
      const pending = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
      pending.push({ experienceId, feedback, timestamp: Date.now() });
      localStorage.setItem('pendingFeedback', JSON.stringify(pending));
    } catch (error) {
      console.error('Failed to save pending feedback:', error);
    }
  },

  // 保留中の嗜好を保存
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
      localStorage.removeItem('pendingFeedback');

      // 保留中の嗜好を送信
      const pendingPreferences = JSON.parse(localStorage.getItem('pendingPreferences') || 'null');
      if (pendingPreferences) {
        await api.updatePreferences(pendingPreferences.experiences);
        localStorage.removeItem('pendingPreferences');
      }
    } catch (error) {
      console.warn('Failed to sync pending data:', error.message);
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

  // useEffectの代わりに初期化関数を作成
  initialize: async () => {
    try {
      const isHealthy = await api.checkHealth();
      if (isHealthy) {
        console.log('✅ API接続OK');
        await api.syncPendingData();
      } else {
        console.log('⚠️ API未接続 - オフラインモード');
      }
    } catch (error) {
      console.error('API初期化エラー:', error);
    }
  },

  // ビジュアライゼーションAPI
  getVisualizationData: async (experiences) => {
    if (!api.getAIEnabled()) {
      console.log('🤖 AI disabled, skipping server-side visualization');
      return null;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/visualization/experience-strings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experiences)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Visualization data received from server');
      return result.data;
    } catch (error) {
      console.error('❌ Server-side visualization failed:', error);
      return null; // フォールバックとしてクライアント側計算を使用
    }
  },

  getSpiralPositions: async (experiences) => {
    if (!api.getAIEnabled()) return null;
    
    try {
      const response = await fetch(`${API_BASE_URL}/visualization/spiral-positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experiences)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('❌ Spiral positions fetch failed:', error);
      return null;
    }
  },

  getFloatingPositions: async (experiences) => {
    if (!api.getAIEnabled()) return null;
    
    try {
      const response = await fetch(`${API_BASE_URL}/visualization/floating-positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experiences)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('❌ Floating positions fetch failed:', error);
      return null;
    }
  },

  getConnectionCurves: async (spiralPositions) => {
    if (!api.getAIEnabled()) return null;
    
    try {
      const response = await fetch(`${API_BASE_URL}/visualization/connection-curves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spiralPositions)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('❌ Connection curves fetch failed:', error);
      return null;
    }
  },
};

// 正しいエクスポート
export default api;
export { api };