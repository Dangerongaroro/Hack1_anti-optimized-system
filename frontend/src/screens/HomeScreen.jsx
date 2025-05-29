import React from 'react';
import ExperienceStrings from '../components/ExperienceStrings.jsx'; // 修正: インポートパス
import { TrendingUp, Calendar, Sparkles } from 'lucide-react'; // このコンポーネントで使うアイコンをインポート

// ホーム画面
const HomeScreen = ({ experiences, userStats, onNavigateToRecommendation, onExperienceClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="relative">
        {/* ヘッダー */}
        <div className="absolute top-0 left-0 right-0 z-10 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Seren Paths
              </h1>
              <p className="text-gray-600 mt-1">新しい自分を発見する旅</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/80 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">{userStats.diversityScore}%</span>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                <Calendar className="w-4 h-4 text-pink-600" />
                <span className="text-sm font-medium">{userStats.currentStreak}日</span>
              </div>
            </div>
          </div>
        </div>

        {/* エクスペリエンス・ストリングス */}
        <div className="pt-24 pb-8 px-6">
          <ExperienceStrings experiences={experiences} onExperienceClick={onExperienceClick} />
        </div>

        {/* アクションボタン */}
        <div className="px-6 pb-24">
          <button
            onClick={onNavigateToRecommendation}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl py-4 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <Sparkles className="w-5 h-5" />
            新しいお題を見つける
          </button>
        </div>
      </div>
    </div>
  );
};
export default HomeScreen;