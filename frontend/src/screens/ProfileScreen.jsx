// frontend/src/screens/ProfileScreen.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react'; // このコンポーネントで使うアイコンをインポート

const ProfileScreen = ({ userStats }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">プロフィール</h2>
      </div>

      <div className="bg-white/60 backdrop-blur rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            A
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">冒険者A</h3>
            <p className="text-gray-600">探求を始めて30日</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{userStats.totalExperiences}</p>
            <p className="text-xs text-gray-600">体験数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-600">{userStats.diversityScore}%</p>
            <p className="text-xs text-gray-600">多様性スコア</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{userStats.currentStreak}</p>
            <p className="text-xs text-gray-600">連続日数</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-3">獲得バッジ</h4>
          <div className="flex flex-wrap gap-2">
            {userStats.badges.map((badge, index) => (
              <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button className="w-full bg-white/60 backdrop-blur rounded-2xl p-4 flex items-center justify-between hover:bg-white/80 transition-colors">
          <span className="font-medium text-gray-800">通知設定</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button className="w-full bg-white/60 backdrop-blur rounded-2xl p-4 flex items-center justify-between hover:bg-white/80 transition-colors">
          <span className="font-medium text-gray-800">プライバシー設定</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button className="w-full bg-white/60 backdrop-blur rounded-2xl p-4 flex items-center justify-between hover:bg-white/80 transition-colors">
          <span className="font-medium text-gray-800">初回アンケートを再設定</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
};
export default ProfileScreen;