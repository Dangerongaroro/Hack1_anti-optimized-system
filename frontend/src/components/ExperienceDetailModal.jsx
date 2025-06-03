import React from 'react';
import { X, ThumbsUp, ThumbsDown, SkipForward } from 'lucide-react';

// 体験詳細モーダル
const ExperienceDetailModal = ({ experience, onClose, onFeedback, onClearMission }) => {
  if (!experience) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{experience.title}</h3>
          <button onClick={onClose} className="p-2 bg-transparent">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {experience.category}
            </span>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
              レベル {experience.level}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              experience.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {experience.completed ? '完了' : '進行中'}
            </span>
          </div>
          
          <p className="text-gray-600">
            {experience.date.toLocaleDateString('ja-JP', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          
          {!experience.completed && (
            <div className="border-t pt-4">
              <button
                onClick={() => onClearMission(experience.id)}
                className="w-full py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                達成した
              </button>
            </div>
          )}

          {experience.completed && !experience.feedback && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-700 mb-3">この体験はどうでしたか？</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onFeedback(experience.id, 'positive')}
                  className="flex-1 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  良かった
                </button>
                <button
                  onClick={() => onFeedback(experience.id, 'neutral')}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <SkipForward className="w-4 h-4" />
                  普通
                </button>
                <button
                  onClick={() => onFeedback(experience.id, 'negative')}
                  className="flex-1 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  合わなかった
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetailModal;
