import { generateChallengeLocal } from '../utils/helpers.js';

// API設定
const API_BASE_URL = 'http://localhost:8000/api';

const api = {
  // 強化されたレコメンド取得
  getRecommendation: async (level, userPreferences, experiences = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          level, 
          preferences: userPreferences || {},
          experiences: experiences.slice(-20) // 最近20件の体験を送信
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
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

  // ユーザー嗜好更新（分析結果付き）
  updatePreferences: async (experiences) => {
    try {
      const response = await fetch(`${API_BASE_URL}/preferences/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experiences })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Preferences updated with analysis:', result);
      return result;
    } catch (error) {
      console.warn('Failed to update preferences, will retry later:', error.message);
      // 嗜好をローカルストレージに保存
      this.savePendingPreferences(experiences);
      return { status: 'pending', message: 'Preferences saved for later' };
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
  }
};

// 起動時にAPI接続をチェック
api.checkHealth().then(isHealthy => {
  console.log(isHealthy ? '✅ Enhanced API connection established' : '⚠️ API not available, using fallback');
});

// アプリ起動時に保留中のデータを送信
api.syncPendingData();

export default api;