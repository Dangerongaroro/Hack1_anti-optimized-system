import React, { useCallback, useMemo } from 'react';
import { X, ThumbsUp, ThumbsDown, SkipForward } from 'lucide-react';

// 最適化された体験詳細モーダル
const ExperienceDetailModal = React.memo(({ experience, onClose, onFeedback, onClearMission }) => {
  console.log('🖼️ ExperienceDetailModal レンダリング:', {
    experience,
    hasExperience: !!experience,
    experienceId: experience?.id,
    experienceTitle: experience?.title
  });
  // 日付フォーマットをメモ化
  const formattedDate = useMemo(() => {
    if (!experience?.date) return '日付不明';
    
    const date = experience.date instanceof Date ? 
      experience.date : 
      new Date(experience.date);
      
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, [experience?.date]);

  // コールバック関数をメモ化
  const handleClearMission = useCallback(() => {
    if (experience?.id) {
      onClearMission(experience.id);
    }
  }, [experience?.id, onClearMission]);

  const handlePositiveFeedback = useCallback(() => {
    if (experience?.id) {
      onFeedback(experience.id, 'positive');
    }
  }, [experience?.id, onFeedback]);

  const handleNeutralFeedback = useCallback(() => {
    if (experience?.id) {
      onFeedback(experience.id, 'neutral');
    }
  }, [experience?.id, onFeedback]);

  const handleNegativeFeedback = useCallback(() => {
    if (experience?.id) {
      onFeedback(experience.id, 'negative');
    }
  }, [experience?.id, onFeedback]);

  // early returnはフックの後に
  if (!experience) {
    return null;
  }

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
            {formattedDate}
          </p>
          
          {!experience.completed && (
            <div className="border-t pt-4">
              <button
                onClick={handleClearMission}
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
                  onClick={handlePositiveFeedback}
                  className="flex-1 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  良かった
                </button>
                <button
                  onClick={handleNeutralFeedback}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <SkipForward className="w-4 h-4" />
                  普通
                </button>
                <button
                  onClick={handleNegativeFeedback}
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
});

ExperienceDetailModal.displayName = 'ExperienceDetailModal';

export default ExperienceDetailModal;
