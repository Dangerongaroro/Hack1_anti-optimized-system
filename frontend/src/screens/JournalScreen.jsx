import React from 'react';
import { Plus, Award, Star, ThumbsUp, ThumbsDown, SkipForward } from 'lucide-react';

// ジャーナル画面
const JournalScreen = ({ experiences, userStats, onNavigateToEntry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">ジャーナル</h2>
        <button
          onClick={onNavigateToEntry}
          className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/60 backdrop-blur rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">総体験数</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{userStats.totalExperiences}</p>
        </div>
        <div className="bg-white/60 backdrop-blur rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-pink-600" />
            <span className="text-sm text-gray-600">獲得バッジ</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{userStats.badges.length}</p>
        </div>
      </div>

      {/* 最近の体験 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">最近の体験</h3>
        {experiences.slice(-5).reverse().map((exp) => (
          <div key={exp.id} className="bg-white/60 backdrop-blur rounded-2xl p-4 hover:bg-white/80 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800">{exp.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {exp.date.toLocaleDateString('ja-JP')} • {exp.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  exp.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {exp.completed ? '完了' : '進行中'}
                </div>
                {exp.feedback && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    exp.feedback === 'positive' ? 'bg-green-100' : 
                    exp.feedback === 'negative' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {exp.feedback === 'positive' ? <ThumbsUp className="w-3 h-3 text-green-600" /> :
                     exp.feedback === 'negative' ? <ThumbsDown className="w-3 h-3 text-red-600" /> :
                     <SkipForward className="w-3 h-3 text-gray-600" />}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalScreen;
