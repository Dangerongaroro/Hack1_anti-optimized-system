import React from 'react';
import { TrendingUp, Calendar, Sparkles } from 'lucide-react';
import ExperienceStrings from '../components/ExperienceStrings';

const HomeScreen = ({ experiences, userStats, onNavigateToRecommendation, onExperienceClick }) => {
  console.log('HomeScreen props:', { experiences, userStats });

  // プロパティの安全性チェック
  const safeExperiences = Array.isArray(experiences) ? experiences : [];
  const safeUserStats = userStats || {
    totalExperiences: 0,
    currentStreak: 0,
    diversityScore: 0,
    badges: []
  };

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="relative">
          {/* ヘッダー部分 */}
          <div className="absolute top-0 left-0 right-0 z-10 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Seren Paths
                </h1>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">新しい自分を発見する旅</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-white/80 backdrop-blur rounded-full px-3 py-2 lg:px-4 lg:py-2 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">{safeUserStats.diversityScore}%</span>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-full px-3 py-2 lg:px-4 lg:py-2 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Calendar className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-medium">{safeUserStats.currentStreak}日</span>
                </div>
              </div>
            </div>
          </div>

          {/* 体験表示部分 */}
          <div className="pt-24 lg:pt-28 pb-8 px-4 lg:px-6">
            <ExperienceStrings 
              experiences={safeExperiences} 
              onExperienceClick={onExperienceClick} 
            />
          </div>

          {/* 統計表示（PC用） */}
          <div className="hidden lg:block px-6 pb-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 text-center hover:bg-white/80 transition-colors">
                <p className="text-2xl font-bold text-purple-600">{safeUserStats.totalExperiences}</p>
                <p className="text-sm text-gray-600">総体験数</p>
              </div>
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 text-center hover:bg-white/80 transition-colors">
                <p className="text-2xl font-bold text-pink-600">{safeUserStats.badges?.length || 0}</p>
                <p className="text-sm text-gray-600">獲得バッジ</p>
              </div>
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 text-center hover:bg-white/80 transition-colors">
                <p className="text-2xl font-bold text-blue-600">
                  {safeExperiences.filter(e => e && e.completed).length}
                </p>
                <p className="text-sm text-gray-600">完了済み</p>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="px-6 pb-24">
            <button
              onClick={() => {
                console.log('Recommend button clicked');
                if (onNavigateToRecommendation && typeof onNavigateToRecommendation === 'function') {
                  onNavigateToRecommendation();
                }
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl py-4 lg:py-5 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-base lg:text-lg"
            >
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
              新しいお題を見つける
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('HomeScreen render error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">エラーが発生しました</h1>
          <p className="text-gray-600">ページの表示中に問題が発生しました。</p>
        </div>
      </div>
    );
  }
};

export default HomeScreen;