import { generateChallengeLocal } from '../utils/helpers.js';

// API設定 - ポートを8001に変更
const API_BASE_URL = 'http://localhost:8001/api';

const api = {
  // レコメンド取得
  getRecommendation: async (level, userPreferences) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, preferences: userPreferences })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API unavailable, using local recommendation generation:', error.message);
      return generateChallengeLocal(level);
    }
  },

  // フィードバック送信
  sendFeedback: async (experienceId, feedback) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience_id: experienceId, feedback })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Feedback sent successfully:', result);
      return result;
    } catch (error) {
      console.warn('Failed to send feedback, will retry later:', error.message);
      // フィードバックをローカルストレージに保存して後で送信
      this.savePendingFeedback(experienceId, feedback);
      return { status: 'pending', message: 'Feedback saved for later' };
    }
  },

  // ユーザー嗜好更新
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
      console.log('Preferences updated successfully:', result);
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

// アプリ起動時に保留中のデータを送信
api.syncPendingData();

export default api;