import IconRenderer from '../components/IconRenderer';
import { X, RefreshCw, Sparkles } from 'lucide-react';
import { generateChallengeLocal } from '../utils/helpers.js';
import { useState } from 'react';

// API設定
const API_BASE_URL = 'http://localhost:8000/api';

const api = {
  // 自動保存の設定を管理
  getAutoSaveEnabled: () => {
    return localStorage.getItem('autoSaveExperiences') !== 'false';
  },
  
  setAutoSaveEnabled: (enabled) => {
    localStorage.setItem('autoSaveExperiences', enabled.toString());
  },
  
  updatePreferences: async (experiences) => {
    if (!api.getAutoSaveEnabled()) {
      console.log('🔧 Auto-save disabled, skipping API call');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/preferences`, {
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

  // 起動時にAPI接続をチェック
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('API接続エラー:', error);
      return false;
    }
  },

  // アプリ起動時に保留中のデータを送信
  syncPendingData: () => {
    const pendingData = JSON.parse(localStorage.getItem('pendingExperiences')) || [];
    if (pendingData.length === 0) return;
    
    api.updatePreferences(pendingData)
      .then(() => {
        console.log('保留中のデータを正常に送信');
        localStorage.removeItem('pendingExperiences');
      })
      .catch((error) => {
        console.error('保留中のデータの送信に失敗:', error);
      });
  }
};

// お題提案画面
const RecommendationScreen = ({ 
  currentChallenge, 
  selectedLevel, 
  setSelectedLevel, 
  onGenerateChallenge, 
  onAcceptChallenge, 
  onSkipChallenge,
  onClose 
}) => {
  // ローディング状態を管理
  const [isGenerating, setIsGenerating] = useState(false);

  // お題生成処理をラップする関数
  const handleGenerateChallenge = async () => {
    setIsGenerating(true);
    try {
      await onGenerateChallenge();
    } finally {
      // 少し遅延を入れてローディング表示を確実に見せる
      setTimeout(() => {
        setIsGenerating(false);
      }, 500);
    }
  };

  // スキップ時のお題生成も同様に処理
  const handleSkipAndGenerate = async (reason) => {
    setIsGenerating(true);
    try {
      onSkipChallenge(reason);
      await onGenerateChallenge();
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-800">今日のお題</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/60 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* レベル選択 */}
      <div className="mb-8">
        <p className="text-sm text-gray-600 mb-3">挑戦レベルを選択</p>
        <div className="flex gap-3">
          {[
            { level: 1, emoji: '🌱', name: 'プチ' },
            { level: 2, emoji: '🚀', name: 'チャレンジ' },
            { level: 3, emoji: '⭐', name: 'アドベンチャー' }
          ].map((item) => (
            <button
              key={item.level}
              onClick={() => {
                setSelectedLevel(item.level);
                // レベル変更時は既に生成済みのお題が表示されるのでAPIは呼ばない
              }}
              disabled={isGenerating}
              className={`flex-1 py-3 px-2 rounded-xl font-medium transition-all ${
                selectedLevel === item.level
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white/60 text-gray-700 hover:bg-white/80'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-xs">{item.name}</span>
                <span className="text-sm">Lv.{item.level}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* お題カード */}
      {currentChallenge && !isGenerating ? (
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center animate-pulse">
              <IconRenderer iconName={currentChallenge.icon} className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {currentChallenge.title}
          </h3>
          
          <div className="flex justify-center gap-3 mb-6">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {currentChallenge.category}
            </span>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
              {currentChallenge.estimated_time || '時間未定'}
            </span>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              {currentChallenge.description || '新しい体験があなたを待っています。このお題に挑戦することで、普段とは違う視点や感覚を発見できるかもしれません。'}
            </p>
            {currentChallenge.encouragement && (
              <p className="text-sm text-purple-600 mt-2 font-medium">
                💡 {currentChallenge.encouragement}
              </p>
            )}
          </div>

          {/* アンチ最適化スコア表示（AIが生成した場合） */}
          {currentChallenge.anti_optimization_score && (
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                <span className="text-xs text-gray-600">新発見度: </span>
                <span className="text-sm font-bold text-purple-600">
                  {Math.round(currentChallenge.anti_optimization_score * 100)}%
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={onAcceptChallenge}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              挑戦する！
            </button>
            
            <button
              onClick={handleGenerateChallenge}
              disabled={isGenerating}
              className="w-full py-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              別のお題を見る
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleSkipAndGenerate('not_interested')}
                disabled={isGenerating}
                className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                興味なし
              </button>
              <button
                onClick={() => handleSkipAndGenerate('too_difficult')}
                disabled={isGenerating}
                className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                今は無理
              </button>
            </div>
          </div>
        </div>
      ) : (
        // ローディング状態（既存のお題がない場合 または 生成中の場合）
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-center">
              {isGenerating ? '新しいお題を考えています...' : '新しいお題を考えています...'}
            </p>
            <p className="text-sm text-gray-400 mt-2 text-center">
              少々お待ちください
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationScreen;
