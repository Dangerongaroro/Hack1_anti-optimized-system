// src/services/api.js
import { API_BASE_URL } from '../constants/appConfig';
import { generateChallengeLocal } from '../utils/helpers'; // 修正

// API関数（暫定実装）
const api = {
  // レコメンド取得
  getRecommendation: async (level, userPreferences) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, { // API_BASE_URLを使用
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, preferences: userPreferences })
      });
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      // APIからのデータは icon プロパティが文字列名であることを期待
      return data;
    } catch (error) {
      console.log('Using local recommendation generation');
      // generateChallengeLocal は icon プロパティが文字列名のオブジェクトを返す
      return generateChallengeLocal(level);
    }
  },
  // sendFeedback, updatePreferences も同様に API_BASE_URL を使用
  sendFeedback: async (experienceId, feedback) => { /* ... */ },
  updatePreferences: async (experiences) => { /* ... */ }
};

export default api;