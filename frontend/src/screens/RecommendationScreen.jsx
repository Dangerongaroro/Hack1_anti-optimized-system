import React from 'react';
import IconRenderer from '../components/IconRenderer';
import { X } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-800">今日のお題</h2>
        <div className="w-10"></div>
      </div>

      {/* レベル選択 */}
      <div className="mb-8">
        <p className="text-sm text-gray-600 mb-3">挑戦レベルを選択</p>
        <div className="flex gap-3">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => {
                setSelectedLevel(level);
                onGenerateChallenge();
              }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                selectedLevel === level
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white/60 text-gray-700 hover:bg-white/80'
              }`}
            >
              Lv.{level}
            </button>
          ))}
        </div>
      </div>

      {/* お題カード */}
      {currentChallenge && (
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
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
              レベル {currentChallenge.level}
            </span>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              新しい体験があなたを待っています。このお題に挑戦することで、普段とは違う視点や感覚を発見できるかもしれません。
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onAcceptChallenge}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              挑戦する！
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onSkipChallenge('not_interested');
                  onGenerateChallenge();
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                興味なし
              </button>
              <button
                onClick={() => {
                  onSkipChallenge('too_difficult');
                  onGenerateChallenge();
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                今は無理
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationScreen;
